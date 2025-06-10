import { NextResponse } from 'next/server';
import { Client, Account } from 'node-appwrite';
import { config } from '@/lib/appwrite/kdsm';

// Get user data using session route
export async function GET(request) {
  try {
    const sessionId = request.cookies.get('kdsm-session')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'No active session' },
        { status: 401 }
      );
    }
    
    // Initialize client with session (not API key)
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id);
    
    const account = new Account(client);
    
    // Set the session for this request
    client.setSession(sessionId);
    
    // Get user data using the session
    const user = await account.get();
    
    return NextResponse.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('User data fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 401 }
    );
  }
}