import { NextResponse } from 'next/server';
import { ApiKeyManager } from '@/lib/apiKeyManager';
import { Client, Account } from 'node-appwrite';
import { config } from '@/lib/appwrite/kdsm';

async function getUserFromSession(request) {
  try {
    const sessionToken = request.cookies.get('kdsm-session')?.value;
    if (!sessionToken) return null;

    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(sessionToken);

    const account = new Account(client);
    return await account.get();
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rateLimitStatus = await ApiKeyManager.getRateLimitStatus(user.$id);
    
    return NextResponse.json({
      success: true,
      data: rateLimitStatus
    });
  } catch (error) {
    console.error('Rate limit status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rate limit status' },
      { status: 500 }
    );
  }
}