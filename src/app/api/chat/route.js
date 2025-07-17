import { streamText } from 'ai';
import { openai } from '@/lib/azure-ai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { 
      messages, 
      conversationId, 
      isGeneralChat = false,
      context = null
    } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Enhanced system prompt with Arabic support
    const systemPrompt = `أنت نيكسي، المساعد الذكي المتخصص في التوجيه الجامعي في تونس. أنت خبير في:

🎓 نظام التعليم العالي التونسي
📊 تحليل النتائج والمعدلات
🏫 الجامعات والمعاهد العليا
📈 احصائيات القبول والتوجيه
💼 التخصصات والآفاق المهنية

المهام الرئيسية:
- تقديم المشورة الأكاديمية والمهنية
- مساعدة الطلاب في اختيار التخصص المناسب
- شرح نظام التوجيه الجامعي
- تحليل فرص القبول
- مقارنة البرامج الأكاديمية

قواعد المحادثة:
✅ استخدم اللغة العربية دائماً
✅ كن ودوداً ومتفهماً
✅ قدم معلومات دقيقة ومفيدة
✅ استخدم الرموز التعبيرية بشكل مناسب
✅ اطرح أسئلة توضيحية عند الحاجة

إذا لم تكن متأكداً من معلومة معينة، أخبر المستخدم بذلك واقترح طرق للحصول على المعلومة الصحيحة.`;

    // Generate AI response
    const result = await streamText({
      model: openai('gpt-4o'),
      system: systemPrompt + (context ? `\n\nسياق إضافي:\n${context}` : ''),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      maxTokens: 2000,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    return NextResponse.json({ 
      error: 'خطأ في الخادم، يرجى المحاولة مرة أخرى' 
    }, { status: 500 });
  }
}
