import { NextResponse } from "next/server";
import { Client, Databases } from "node-appwrite";
import {
  config,
  collections,
  getUserFromSession,
} from "@/lib/appwrite/kdsm";
import { encrypt } from "@/utils/kdsm";

/**
 * PATCH - Update a saved password
 */
export async function PATCH(request, { params }) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const { password, email, username, platformName, isActive } = await request.json();

    // Create client with API key for server-side operations
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setKey(config.api_key);

    const databases = new Databases(client);

    // First, verify the password belongs to the user
    const existingPassword = await databases.getDocument(
      config.database,
      collections.savedPasswords,
      id
    );

    if (existingPassword.user !== user.$id) {
      return NextResponse.json(
        { success: false, error: "Forbidden - This password does not belong to you" },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData = {};
    
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (platformName !== undefined) updateData.platformName = platformName;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // If password is being updated, encrypt it
    if (password !== undefined) {
      if (password.length > 30 || password.length < 6) {
        return NextResponse.json(
          { success: false, error: "Invalid password length" },
          { status: 400 }
        );
      }

      // Get user's hashed answer for encryption
      const userDoc = await databases.getDocument(
        config.database,
        collections.users,
        user.$id
      );

      updateData.passwordHash = encrypt(password, userDoc.hashedAnswer);
      updateData.lastUpdated = new Date().toISOString();
    }

    // Update the document
    const updatedPassword = await databases.updateDocument(
      config.database,
      collections.savedPasswords,
      id,
      updateData
    );

    return NextResponse.json({
      success: true,
      data: updatedPassword,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update password",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a saved password
 */
export async function DELETE(request, { params }) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Create client with API key for server-side operations
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setKey(config.api_key);

    const databases = new Databases(client);

    // First, verify the password belongs to the user
    const existingPassword = await databases.getDocument(
      config.database,
      collections.savedPasswords,
      id
    );

    if (existingPassword.user !== user.$id) {
      return NextResponse.json(
        { success: false, error: "Forbidden - This password does not belong to you" },
        { status: 403 }
      );
    }

    // Delete the document
    await databases.deleteDocument(
      config.database,
      collections.savedPasswords,
      id
    );

    return NextResponse.json({
      success: true,
      message: "Password deleted successfully",
      data: {
        id,
        platformName: existingPassword.platformName,
      },
    });
  } catch (error) {
    console.error("Delete password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete password",
      },
      { status: 500 }
    );
  }
}
