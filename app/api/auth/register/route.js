import { NextResponse } from 'next/server';
import { Client, Account, ID, Databases } from 'node-appwrite';
import { config, collections } from '@/lib/appwrite/kdsm';
import { encrypt } from '@/utils/kdsm';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.project_id)
  .setKey(config.api_key);

const account = new Account(client);
const databases = new Databases(client);

export async function POST(request) {
  try {
    const { email, password, name, securityQuestion, answer } = await request.json();
    // Validate input
    if (!email || !password || !name || !securityQuestion || !answer) {
      return NextResponse.json(
        { success: false, error: 'Email, password, name, security question, and answer are required' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Encrypt the security answer with the question as the key
    const hashedAnswer = encrypt(answer, securityQuestion);
    
    // Create user account in Appwrite Auth (this also hashes the password internally)
    const user = await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    // Store additional user data in your custom users collection
    // Note: Appwrite Auth already securely hashes the password, so we don't store it here
    await databases.createDocument(
      config.database,
      collections.users,
      user.$id, // Use the same ID as the auth user for easy linking
      {
        email: user.email,
        name: user.name,
        securityQuestion: securityQuestion,
        hashedAnswer,
      }
    );

    // Create email session for the new user
    const session = await account.createEmailPasswordSession(
      email,
      password
    );
    
    // Initialize client with session to send verification email
    const sessionClient = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.project_id)
      .setSession(session.secret);
    // todo: Create the saved messages room for by default saving messages.
    const sessionAccount = new Account(sessionClient);
    
    try {
      // Send verification email automatically after registration
      await sessionAccount.createVerification(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-email`
      );
    } catch (verificationError) {
      console.warn('Failed to send verification email:', verificationError);
      // Don't fail registration if verification email fails
    }
    
    const response = NextResponse.json({ 
      success: true, 
      user: {
        $id: user.$id,
        email: user.email,
        name: user.name,
        emailVerification: user.emailVerification
      },
      session,
      message: 'Account created successfully. Please check your email to verify your account.'
    });
    
    // Set session cookie
    response.cookies.set("kdsm-session", session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      expires: new Date(session.expire),
      path: "/",
    });
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific Appwrite errors
    let errorMessage = 'Registration failed';
    let statusCode = 400;
    
    if (error.code === 409) {
      errorMessage = 'A user with the same email already exists';
    } else if (error.code === 400) {
      errorMessage = error.message || 'Invalid request data';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: statusCode }
    );
  }
}