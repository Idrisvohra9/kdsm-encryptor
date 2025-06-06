import { NextResponse } from "next/server";
import { Client, Account } from "node-appwrite";
import { config } from "@/lib/appwrite/kdsm";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.project_id)
  .setKey(config.api_key);

const account = new Account(client);
// Login route
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Create email session
    const session = await account.createEmailPasswordSession(email, password);
    
    // Set the session cookie
    const response = NextResponse.json({ success: true, session });
    response.cookies.set("appwrite-session", session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      expires: new Date(session.expire),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 401 }
    );
  }
}
// Logout route
export async function DELETE(request) {
  try {
    const sessionToken = request.cookies.get("appwrite-session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No active session" },
        { status: 401 }
      );
    }

    // Create a client with the session token for user-specific operations
    const sessionClient = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(sessionToken);

    const sessionAccount = new Account(sessionClient);
    
    // Delete the current session
    await sessionAccount.deleteSession('current');

    // Clear the session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete("appwrite-session", {
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Session deletion error:", error);
    
    // Even if session deletion fails, clear the cookie
    const response = NextResponse.json({ 
      success: true, 
      message: "Logged out locally" 
    });
    response.cookies.delete("appwrite-session", {
      path: "/",
    });
    
    return response;
  }
}
// Verify session route
export async function GET(request) {
  try {
    const sessionToken = request.cookies.get("appwrite-session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create session client
    const sessionClient = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(sessionToken);

    const sessionAccount = new Account(sessionClient);
    const user = await sessionAccount.get();

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid session" },
      { status: 401 }
    );
  }
}
