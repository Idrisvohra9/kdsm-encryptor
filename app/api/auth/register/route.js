import { NextResponse } from 'next/server';
import { Client, Account, ID } from 'node-appwrite';
import { config } from '@/lib/appwrite/kdsm';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.project_id)
  .setKey(config.api_key);

const account = new Account(client);

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();
    
    // Create user account
    const user = await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    // Create email session for the new user
    const session = await account.createEmailPasswordSession(
      email,
      password
    );
    
    return NextResponse.json({ 
      success: true, 
      user,
      session 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Registration failed' 
      },
      { status: 400 }
    );
  }
}