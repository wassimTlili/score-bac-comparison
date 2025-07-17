// src/app/api/profile/route.js
import { NextResponse } from 'next/server'
import { getUserProfile } from '@/actions/profile-actions'

export async function GET(request) {
  try {
    const result = await getUserProfile()
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 404 })
    }
  } catch (error) {
    console.error('❌ Profile API error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
  }
}
