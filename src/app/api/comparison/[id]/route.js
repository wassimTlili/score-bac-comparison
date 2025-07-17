import { NextResponse } from 'next/server';
import comparisonStorage from '@/lib/comparison-storage';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Comparison ID is required' }, { status: 400 });
    }

    // Get comparison using our storage layer which handles data transformation
    const comparison = await comparisonStorage.getById(id);

    if (!comparison) {
      return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
    }

    console.log('📦 API returning comparison:', { 
      id: comparison.id, 
      hasUserProfile: !!comparison.userProfile,
      userProfile: comparison.userProfile 
    });

    return NextResponse.json(comparison);
  } catch (error) {
    console.error('Error fetching comparison:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Comparison ID is required' }, { status: 400 });
    }

    // Update comparison using our storage layer
    const updatedComparison = await comparisonStorage.updateAiAnalysis(id, data.aiAnalysis);

    return NextResponse.json(updatedComparison);
  } catch (error) {
    console.error('Error updating comparison:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
