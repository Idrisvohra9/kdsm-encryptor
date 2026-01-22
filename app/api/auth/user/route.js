import { NextResponse } from "next/server";
import { Databases, Users } from "node-appwrite";
import { collections, config, createSessionClient, createAdminClient, getUserFromSession } from "@/lib/appwrite/kdsm";

// Get user data using session route
export async function GET(request) {
  try {
    const sessionId = request.cookies.get("kdsm-session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "No active session" },
        { status: 401 }
      );
    }

    const user = await getUserFromSession(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Session invalid or expired" },
        { status: 401 }
      );
    }

    // Use admin client to access the database
    const { client: adminClient } = createAdminClient();
    const databases = new Databases(adminClient);

    const userDoc = await databases.getDocument(
      config.database,
      collections.users,
      user.$id
    );
    return NextResponse.json({
      success: true,
      user: {
        $id: user.$id,
        email: user.email,
        name: user.name,
        hashedAnswer: userDoc.hashedAnswer,
        securityQuestion: userDoc.securityQuestion,
        lastLogin: userDoc.lastLogin,
        emailVerification: user.emailVerification,
        registration: user.registration,
        status: user.status,
        labels: user.labels,
        prefs: user.prefs,
        mfa: user.mfa,
      },
    });
  } catch (error) {
    console.error("User data fetch error:", error);

    // FIX: Just return 401, DO NOT delete the cookie.
    return NextResponse.json(
      { success: false, error: "Failed to fetch user data" },
      { status: 401 }
    );
  }
}

// Update user profile
export async function PATCH(request) {
  try {
    const sessionId = request.cookies.get("kdsm-session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { name, email, password } = await request.json();

    // Validate input
    if (!name && !email) {
      return NextResponse.json(
        { success: false, error: "At least one field (name or email) is required" },
        { status: 400 }
      );
    }

    // Create session client
    const { account } = await createSessionClient(request);
    const user = await account.get();

    // Update name if provided
    if (name && name.trim()) {
      await account.updateName(name.trim());
    }

    // Update email if provided (requires password)
    if (email) {
      if (!password) {
        return NextResponse.json(
          { success: false, error: "Password is required to update email" },
          { status: 400 }
        );
      }
      await account.updateEmail(email, password);
    }

    // Get updated user data
    const updatedUser = await account.get();

    // Update the users collection in database
    try {
      const { client: adminClient } = createAdminClient();
      const databases = new Databases(adminClient);

      const updateData = {};
      if (name && name.trim()) {
        updateData.name = name.trim();
      }
      if (email) {
        updateData.email = email;
      }

      await databases.updateDocument(
        config.database,
        collections.users,
        user.$id,
        updateData
      );
    } catch (dbError) {
      console.warn("Failed to update user document in database:", dbError.message);
      // Continue even if database update fails, since Appwrite Auth was updated
    }

    return NextResponse.json({
      success: true,
      message: email
        ? "Profile updated. Please verify your new email address."
        : "Profile updated successfully",
      user: {
        $id: updatedUser.$id,
        email: updatedUser.email,
        name: updatedUser.name,
        emailVerification: updatedUser.emailVerification,
        registration: updatedUser.registration,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error("User update error:", error);

    let errorMessage = "Failed to update profile";
    let statusCode = 400;

    if (error.code === 401) {
      errorMessage = "Authentication failed";
      statusCode = 401;
    } else if (error.code === 409) {
      errorMessage = "Email already exists";
      statusCode = 409;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

// Change password
export async function PUT(request) {
  try {
    const sessionId = request.cookies.get("kdsm-session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { oldPassword, newPassword } = await request.json();

    // Validate input
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Both old and new passwords are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "New password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    if (oldPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: "New password must be different from old password" },
        { status: 400 }
      );
    }

    // Create session client
    const { account } = await createSessionClient(request);

    // Update password
    await account.updatePassword(newPassword, oldPassword);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password update error:", error);

    let errorMessage = "Failed to update password";
    let statusCode = 400;

    if (error.code === 401) {
      errorMessage = "Current password is incorrect";
      statusCode = 401;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

// Delete user account
export async function DELETE(request) {
  try {
    const sessionId = request.cookies.get("kdsm-session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Create session client
    const { account } = await createSessionClient(request);
    const user = await account.get();

    // Delete user's custom data from database first
    try {
      const { client: adminClient } = createAdminClient();
      const databases = new Databases(adminClient);
      await databases.deleteDocument(
        config.database,
        collections.users,
        user.$id
      );
    } catch (dbError) {
      console.warn("Failed to delete user document:", dbError.message);
      // Continue with account deletion even if document deletion fails
    }

    // Delete all user sessions first
    try {
      await account.deleteSessions();
    } catch (sessionError) {
      console.warn("Failed to delete sessions:", sessionError.message);
    }

    // Delete the actual user account using admin client
    try {
      const { client: adminClient } = createAdminClient();
      const users = new Users(adminClient);
      await users.delete(user.$id);
    } catch (deleteError) {
      console.error("Failed to delete user account:", deleteError.message);
      return NextResponse.json(
        { success: false, error: "Failed to delete account. Please contact support." },
        { status: 500 }
      );
    }

    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });

    response.cookies.delete("kdsm-session", {
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete account" },
      { status: 400 }
    );
  }
}
