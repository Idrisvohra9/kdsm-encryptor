import { NextResponse } from 'next/server';
import { ApiKeyManager } from '@/lib/apiKeyManager';
import { encrypt, generateKey } from '@/utils/kdsm';

export async function POST(request) {
  try {
    const { message, key } = await request.json();
    const apiKey = request.headers.get('x-api-key');
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Message is required' 
        },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key is required. Include it in x-api-key header.' 
        },
        { status: 401 }
      );
    }

    // Validate API key
    const keyData = await ApiKeyManager.validateApiKey(apiKey);
    if (!keyData) {
      await ApiKeyManager.logApiUsage(null, null, '/api/v1/encrypt', false, clientIP);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid API key' 
        },
        { status: 401 }
      );
    }

    // Check rate limit
    const withinLimit = await ApiKeyManager.checkRateLimit(keyData.id, keyData.userId);
    if (!withinLimit) {
      await ApiKeyManager.logApiUsage(keyData.id, keyData.userId, '/api/v1/encrypt', false, clientIP);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Maximum 10 requests per day.' 
        },
        { status: 429 }
      );
    }

    // Process encryption
    const usedKey = key || generateKey();
    const encryptedMessage = encrypt(message, usedKey);

    // Log successful usage
    await ApiKeyManager.logApiUsage(keyData.id, keyData.userId, '/api/v1/encrypt', true, clientIP);

    return NextResponse.json({
      success: true,
      data: {
        encryptedMessage,
        key: usedKey,
        keyGenerated: !key
      }
    });

  } catch (error) {
    console.error('Encryption API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}