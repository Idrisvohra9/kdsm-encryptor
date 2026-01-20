import { createSessionClient } from "@/lib/appwrite/kdsm";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { code } = await request.json();

    // Pass the request object here so it can read cookies
    const { account } = await createSessionClient(request);
    account.mfa;
    // updateMFAAuthenticator enables MFA on the account
    await account.updateMFAAuthenticator({ type: "totp", otp: code });
    await account.updateMFA({ mfa: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("MFA Verification Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 400 },
    );
  }
}
