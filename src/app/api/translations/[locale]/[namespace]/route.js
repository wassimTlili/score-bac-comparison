import { NextResponse } from 'next/server';
import { i18nConfig } from '../../../../../i18n/config';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15
    const { locale, namespace } = await params;
    
    // Validate locale and namespace
    if (!i18nConfig.locales.includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    if (!i18nConfig.namespaces.includes(namespace)) {
      return NextResponse.json(
        { error: 'Invalid namespace' },
        { status: 400 }
      );
    }

    // Construct file path
    const filePath = path.join(
      process.cwd(),
      'src',
      'i18n',
      'locales',
      locale,
      `${namespace}.json`
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // Try to fallback to English if not found
      if (locale !== 'en') {
        const fallbackPath = path.join(
          process.cwd(),
          'src',
          'i18n',
          'locales',
          'en',
          `${namespace}.json`
        );
        
        if (fs.existsSync(fallbackPath)) {
          const fallbackData = fs.readFileSync(fallbackPath, 'utf8');
          return NextResponse.json(JSON.parse(fallbackData));
        }
      }
      
      return NextResponse.json(
        { error: 'Translation file not found' },
        { status: 404 }
      );
    }

    // Read and parse the translation file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(fileContent);

    return NextResponse.json(translations);
  } catch (error) {
    console.error('Error loading translations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
