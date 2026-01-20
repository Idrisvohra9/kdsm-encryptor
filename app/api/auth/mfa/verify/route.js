import { NextResponse } from "next/server";
import { Client, Account, Databases } from "node-appwrite";
import { collections, config } from "@/lib/appwrite/kdsm";

// Initialize Admin Client for database updates
const adminClient = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.project_id)
  .setKey(config.api_key);

export async function POST(request) {
  try {
    const { secret, challengeId, otp } = await request.json();

    // 1. Initialize Client with the temporary session secret
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(secret);

    const account = new Account(client);

    // 2. Complete the MFA challenge
    // Note: Appwrite completes the session verification here
    const session = await account.updateMFAChallenge({ challengeId, otp });

    // 3. Sync User State and Log Activity
    // Now that the session is verified, we can get user data
    const user = await account.get();

    const databases = new Databases(adminClient);
    await databases.updateDocument(
      config.database,
      collections.users,
      user.$id,
      { lastLogin: new Date().toISOString() },
    );

    // 4. Set final cookie and Respond
    const response = NextResponse.json({
      success: true,
      user: {
        $id: user.$id,
        email: user.email,
        name: user.name,
      },
    });

    response.cookies.set("kdsm-session", session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("MFA Verify Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
