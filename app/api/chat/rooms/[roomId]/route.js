import { NextResponse } from "next/server";
import { Client, Databases, Account } from "node-appwrite";
import { config, collections } from "@/lib/appwrite/kdsm";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.project_id)
  .setKey(config.api_key);

const databases = new Databases(client);

// Get a specific chat room
export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get("kdsm-session")?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { roomId } = await params;

    const room = await databases.getDocument(
      config.database,
      collections.chatRooms,
      roomId
    );

    return NextResponse.json({
      success: true,
      room
    });

  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { success: false, error: "Room not found" },
      { status: 404 }
    );
  }
}

// Update room (join room)
export async function PATCH(request, { params }) {
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

    const account = new Account(sessionClient);
    const user = await account.get();

    const { roomId } = params;
    const { action, pin } = await request.json();

    // Get current room
    const room = await databases.getDocument(
      config.database,
      collections.chatRooms,
      roomId
    );

    if (action === "join") {
      // Verify PIN if required
      if (room.roomKeyHash && pin) {
        // TODO: Fix
        const hashedPin = Buffer.from(pin).toString('base64');
        if (hashedPin !== room.roomKeyHash) {
          return NextResponse.json(
            { success: false, error: "Invalid PIN" },
            { status: 403 }
          );
        }
      } else if (room.roomKeyHash && !pin) {
        return NextResponse.json(
          { success: false, error: "PIN required" },
          { status: 403 }
        );
      }

      // Add user to room if not already a member
      const updatedMembers = [...new Set([...room.members, user.$id])];
      
      const updatedRoom = await databases.updateDocument(
        config.database,
        collections.chatRooms,
        roomId,
        { members: updatedMembers }
      );

      return NextResponse.json({
        success: true,
        room: updatedRoom
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update room" },
      { status: 500 }
    );
  }
}