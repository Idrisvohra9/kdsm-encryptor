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

    // Prevent DoS attacks with overly large messages (limit to 1MB)
    if (message.length > 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is too large. Maximum size is 1MB.",
        },
        { status: 413 }
      );
    }

    // Validate key length if provided
    if (key && key.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "Key is too long. Maximum length is 1000 characters.",
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
    const usedKey = key || await generateKey();
    const encryptedMessage = encrypt(message, usedKey);

    // Log successful usage non-blocking
    ApiKeyManager.logApiUsage(
      keyData.id,
      keyData.userId,
      "/api/v1/encrypt",
      true,
      clientIP
    ).catch(console.error);

    const response = NextResponse.json({
      success: true,
      data: {
        encryptedMessage,
        key: usedKey,
        keyGenerated: !key,
      },
      rateLimitStatus,
    });

    // Add rate limit headers
    if (rateLimitStatus.limit !== 'unlimited') {
      response.headers.set('X-RateLimit-Limit', rateLimitStatus.limit.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimitStatus.remaining.toString());
      response.headers.set('X-RateLimit-Used', rateLimitStatus.used.toString());
    }

    return response;
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
