import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite/kdsm";

/**
 * Create a new MFA authenticator (TOTP)
 * Uses Appwrite's latest MFA API
 * Returns the secret and QR code URI for the user to scan
 */
export async function POST(request) {
  try {
    // Get the logged-in user's session
    const { account } = await createSessionClient(request);

    // Get current user to verify they're authenticated
    const user = await account.get();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    // Create TOTP authenticator for the logged-in user
    // Appwrite returns { secret, uri } with the QR code URI
    const authenticator = await account.createMFAAuthenticator({
      type: "totp",
    });

    return NextResponse.json({
      success: true,
      data: {
        secret: authenticator.secret,
        uri: authenticator.uri,
      },
    });
  } catch (error) {
    console.error("Error creating MFA authenticator:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create MFA authenticator",
      },
      { status: 500 },
    );
  }
}
