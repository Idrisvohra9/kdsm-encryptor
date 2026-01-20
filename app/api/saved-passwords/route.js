import { NextResponse } from "next/server";
import { Client, Databases, ID, Query } from "node-appwrite";
import {
  config,
  collections,
  getUserFromSession,
} from "@/lib/appwrite/kdsm";
import { encrypt } from "@/utils/kdsm";

/**
 * POST - Create a new shared encrypted message
 */
export async function POST(request) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { password, email, username, platformName } = await request.json();

    // Validate inputs
    if (!password || password.length > 30 || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Invalid password length" },
        { status: 400 }
      );
    }

    if (!email || email.length > 100 || email.length < 5) {
      return NextResponse.json(
        { success: false, error: "Invalid email length" },
        { status: 400 }
      );
    }

    // Create client with API key for server-side operations
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setKey(config.api_key);

    const databases = new Databases(client);
    const { hashedAnswer } = await databases.getDocument(
      config.database,
      collections.users,
      user.$id,
      [Query.select("hashedAnswer")]
    );
    // Create document in Appwrite
    await databases.createDocument(
      config.database,
      collections.savedPasswords,
      ID.unique(),
      {
        user: user.$id,
        username,
        email,
        platformName,
        passwordHash: encrypt(password, hashedAnswer),
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        platformName,
      },
    });
  } catch (error) {
    console.error("Create shared message error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create shared message",
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Get all shared messages for the logged-in user
 */
export async function GET(request) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setKey(config.api_key);

    const databases = new Databases(client);

    const passwords = await databases.listDocuments(
      config.database,
      collections.savedPasswords,
      [Query.equal("user", user.$id), Query.orderDesc("$createdAt")]
    );

    return NextResponse.json({
      success: true,
      data: passwords,
    });
  } catch (error) {
    console.error("Get passwords error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get passwords",
      },
      { status: 500 }
    );
  }
}
