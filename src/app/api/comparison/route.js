// src/app/api/comparison/route.js
import { NextResponse } from 'next/server'
import { createComparison } from '@/actions/comparison-actions'

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Create a FormData-like object with JSON data
    const formData = new FormData();
    formData.append('orientation1', JSON.stringify(body.orientation1));
    formData.append('orientation2', JSON.stringify(body.orientation2));
    formData.append('userProfile', JSON.stringify(body.userProfile));
    
    const result = await createComparison(formData);
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Comparison API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
