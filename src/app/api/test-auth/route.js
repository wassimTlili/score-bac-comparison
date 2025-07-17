import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    return NextResponse.json({
      success: true,
      authenticated: !!userId,
      userId: userId || null,
      message: userId ? 'User is authenticated' : 'User is not authenticated',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Auth test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
