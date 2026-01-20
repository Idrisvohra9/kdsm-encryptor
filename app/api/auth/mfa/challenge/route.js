import { NextResponse } from "next/server";
import { Client, Account } from "node-appwrite";
import { config } from "@/lib/appwrite/kdsm";

export async function POST(request) {
  try {
    const { secret } = await request.json();

    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(secret);

    const account = new Account(client);

    // Create the TOTP challenge
    const challenge = await account.createMFAChallenge({ factor: "totp" });

    return NextResponse.json({
      success: true,
      challengeId: challenge.$id,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
