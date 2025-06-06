import { NextResponse } from "next/server";
import { ApiKeyManager } from "@/lib/apiKeyManager";
import { decrypt } from "@/utils/kdsm";

export async function POST(request) {
  try {
    const { encryptedMessage, key } = await request.json();
    const apiKey = request.headers.get("x-api-key");
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Validate required fields
    if (!encryptedMessage || !key) {
      return NextResponse.json(
        {
          success: false,
          error: "Both encryptedMessage and key are required",
        },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "API key is required. Include it in x-api-key header.",
        },
        { status: 401 }
      );
    }

    // Validate API key
    const keyData = await ApiKeyManager.validateApiKey(apiKey);
    if (!keyData) {
      await ApiKeyManager.logApiUsage(
        null,
        null,
        "/api/v1/decrypt",
        false,
        clientIP
      );
      return NextResponse.json(
        {
          success: false,
          error: "Invalid API key",
        },
        { status: 401 }
      );
    }

    // Check rate limit
    const withinLimit = await ApiKeyManager.checkRateLimit(
      keyData.id,
      keyData.userId
    );
    if (!withinLimit) {
      await ApiKeyManager.logApiUsage(
        keyData.id,
        keyData.userId,
        "/api/v1/decrypt",
        false,
        clientIP
      );
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Maximum 10 requests per day.",
        },
        { status: 429 }
      );
    }

    // Process decryption
    const decryptedMessage = decrypt(encryptedMessage, key);

    // Log successful usage
    await ApiKeyManager.logApiUsage(
      keyData.id,
      keyData.userId,
      "/api/v1/decrypt",
      true,
      clientIP
    );

    return NextResponse.json({
      success: true,
      data: {
        decryptedMessage,
      },
    });
  } catch (error) {
    console.error("Decryption API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Decryption failed. Please check your encrypted message and key.",
      },
      { status: 400 }
    );
  }
}
