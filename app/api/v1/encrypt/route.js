import { NextResponse } from "next/server";
import { ApiKeyManager } from "@/lib/apiKeyManager";
import { encrypt, generateKey } from "@/utils/kdsm";

export async function POST(request) {
  try {
    // Parse request data once
    const [{ message, key }, apiKey, clientIP] = await Promise.all([
      request.json(),
      request.headers.get("x-api-key"),
      Promise.resolve(
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown"
      )
    ]);

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required",
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
      ApiKeyManager.logApiUsage(
        null,
        null,
        "/api/v1/encrypt",
        false,
        clientIP
      ).catch(console.error); // Non-blocking error logging

      return NextResponse.json(
        {
          success: false,
          error: "Invalid API key",
        },
        { status: 401 }
      );
    }

    // Check rate limit and get status concurrently
    const [withinLimit, rateLimitStatus] = await Promise.all([
      ApiKeyManager.checkRateLimit(keyData.userId),
      ApiKeyManager.getRateLimitStatus(keyData.userId)
    ]);

    if (!withinLimit) {
      // Log failed usage non-blocking
      ApiKeyManager.logApiUsage(
        keyData.id,
        keyData.userId,
        "/api/v1/encrypt",
        false,
        clientIP
      ).catch(console.error);

      const errorMessage = rateLimitStatus.tier === "free"
        ? "Rate limit exceeded. Maximum 10 requests per day for free users."
        : rateLimitStatus.tier === "premium"
          ? "Rate limit exceeded. Maximum 100 requests per day for premium users."
          : "Rate limit exceeded.";

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          rateLimitStatus,
        },
        { status: 429 }
      );
    }

    // Process encryption
    const usedKey = key || generateKey();
    const encryptedMessage = encrypt(message, usedKey);

    // Log successful usage non-blocking
    ApiKeyManager.logApiUsage(
      keyData.id,
      keyData.userId,
      "/api/v1/encrypt",
      true,
      clientIP
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      data: {
        encryptedMessage,
        key: usedKey,
        keyGenerated: !key,
      },
      rateLimitStatus,
    });
  } catch (error) {
    console.error("Encryption API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
