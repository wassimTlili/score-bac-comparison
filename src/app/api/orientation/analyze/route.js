import { NextResponse } from 'next/server';
import { generateOrientationAnalysis } from '@/lib/azure-ai';

export async function POST(request) {
  try {
    const { userChoices, userGpa, userProfile } = await request.json();

    // Validate required data
    if (!userChoices || !Array.isArray(userChoices) || userChoices.length < 6) {
      return NextResponse.json(
        { error: 'يجب تقديم على الأقل 6 اختيارات للتحليل' },
        { status: 400 }
      );
    }

    if (!userGpa || typeof userGpa !== 'number' || userGpa <= 0) {
      return NextResponse.json(
        { error: 'يجب تقديم معدل صحيح' },
        { status: 400 }
      );
    }

    // Generate AI analysis
    const analysis = await generateOrientationAnalysis({
      userChoices,
      userGpa,
      userProfile
    });

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Orientation analysis error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحليل الاختيارات' },
      { status: 500 }
    );
  }
}
