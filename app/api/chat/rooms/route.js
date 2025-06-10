import { NextResponse } from "next/server";
import { Client, Databases, ID, Query } from "node-appwrite";
import { config, collections } from "@/lib/appwrite/kdsm";
import { encrypt } from "@/utils/kdsm";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.project_id)
  .setKey(config.api_key);

const databases = new Databases(client);

// Create a new chat room
export async function POST(request) {
  try {
    const sessionToken = request.cookies.get("kdsm-session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify session and get user
    const sessionClient = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(sessionToken);

    const { Account } = await import("node-appwrite");
    const account = new Account(sessionClient);
    const user = await account.get();

    const data = await request.json();

    // Validate required fields
    if (
      !data.name ||
      typeof data.name !== "string" ||
      data.name.trim() === ""
    ) {
      return NextResponse.json(
        { success: false, error: "Room name is required" },
        { status: 400 }
      );
    }

    if (
      !data.roomPin ||
      typeof data.roomPin !== "string" ||
      data.roomPin.trim() === ""
    ) {
      return NextResponse.json(
        { success: false, error: "Room PIN is required" },
        { status: 400 }
      );
    }

    if (!data.retention) {
      return NextResponse.json(
        { success: false, error: "Valid retention period is required" },
        { status: 400 }
      );
    }

    const { name, roomPin, retention, autoDecrypt } = data;

    // Hash the room PIN if provided
    let roomKeyHash = encrypt(roomPin, user.$id);

    const roomData = {
      name: name.trim(),
      creatorId: user.$id,
      roomKeyHash,
      members: [user.$id],
      retention: retention,
      autoDecrypt: autoDecrypt || false,
    };

    const room = await databases.createDocument(
      config.database,
      collections.chatRooms,
      ID.unique(),
      roomData
    );

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create room" },
      { status: 500 }
    );
  }
}

// Get user's chat rooms
export async function GET(request) {
  try {
    const sessionToken = request.cookies.get("kdsm-session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify session and get user
    const sessionClient = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(sessionToken);

    const { Account } = await import("node-appwrite");
    const account = new Account(sessionClient);
    const user = await account.get();

    // Get rooms where user is a member
    const rooms = await databases.listDocuments(
      config.database,
      collections.chatRooms,
      [Query.contains("members", user.$id)]
    );

    return NextResponse.json({
      success: true,
      rooms: rooms.documents,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
