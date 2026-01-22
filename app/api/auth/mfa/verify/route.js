import { NextResponse } from "next/server";
import { Client, Account } from "node-appwrite";
import { config } from "@/lib/appwrite/kdsm";

export async function POST(request) {
  try {
    const { secret, challengeId, otp } = await request.json();
    
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(secret);

    const account = new Account(client);
    
    // Complete the challenge (Note: ensure method name matches your SDK version)
    const session = await account.updateMfaChallenge(challengeId, otp);
    
    const response = NextResponse.json({ success: true });
    
    // Set the cookie with the same settings as the login route
    // Use the session.secret if returned, otherwise fallback to the provided secret
    const sessionToken = session.secret || secret;
    
    response.cookies.set("kdsm-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      expires: new Date(session.expire), // Set expiration
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("MFA complete error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
