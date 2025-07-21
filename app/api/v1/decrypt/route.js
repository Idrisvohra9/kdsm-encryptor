import { NextResponse } from "next/server";
import { ApiKeyManager } from "@/lib/apiKeyManager";
import { decrypt } from "@/utils/kdsm";

export async function POST(request) {
  try {
    // Parse request data once
    const [{ encryptedMessage, key }, apiKey, clientIP] = await Promise.all([
      request.json(),
      request.headers.get("x-api-key"),
      Promise.resolve(
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown"
      )
    ]);

    // Early validation checks
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
      // Fire and forget logging for invalid key
      ApiKeyManager.logApiUsage(null, null, "/api/v1/decrypt", false, clientIP).catch(console.error);
      
      return NextResponse.json(
        {
          success: false,
          error: "Invalid API key",
        },
        { status: 401 }
      );
    }

    // Parallel checks for rate limit and status
    const [withinLimit, rateLimitStatus] = await Promise.all([
      ApiKeyManager.checkRateLimit(keyData.userId),
      ApiKeyManager.getRateLimitStatus(keyData.userId)
    ]);
    
    if (!withinLimit) {
      // Fire and forget logging for rate limit exceeded
      ApiKeyManager.logApiUsage(
        keyData.id,
        keyData.userId,
        "/api/v1/decrypt",
        false,
        clientIP
      ).catch(console.error);
      
      const errorMessage = rateLimitStatus.tier === 'free' 
        ? "Rate limit exceeded. Maximum 10 requests per day for free users."
        : rateLimitStatus.tier === 'premium'
          ? "Rate limit exceeded. Maximum 100 requests per day for premium users."
          : "Rate limit exceeded.";
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          rateLimitStatus
        },
        { status: 429 }
      );
    }

    // Process decryption
    const decryptedMessage = decrypt(encryptedMessage, key);

    // Fire and forget logging for successful usage
    ApiKeyManager.logApiUsage(
      keyData.id,
      keyData.userId,
      "/api/v1/decrypt",
      true,
      clientIP
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      data: {
        decryptedMessage,
      },
      rateLimitStatus
    });
  } catch (error) {
    console.error("Decryption API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Decryption failed. Please check your encrypted message and key.",
      },
      { status: 400 }
    );
  }
}
