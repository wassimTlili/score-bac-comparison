import { createAzure } from '@ai-sdk/azure';

if (!process.env.AZURE_OPENAI_API_KEY) {
  throw new Error('AZURE_OPENAI_API_KEY environment variable is required');
}

if (!process.env.AZURE_OPENAI_TARGET) {
  throw new Error('AZURE_OPENAI_TARGET environment variable is required');
}

if (!process.env.AZURE_OPENAI_CHAT_DEPLOYMENT) {
  throw new Error('AZURE_OPENAI_CHAT_DEPLOYMENT environment variable is required');
}

// Extract the resource name from the target URL
// AZURE_OPENAI_TARGET format: https://nextgen-brazil-south.openai.azure.com
const resourceName = process.env.AZURE_OPENAI_TARGET
  .replace('https://', '')
  .replace('.openai.azure.com/openai/deployments', '')
  .replace('.openai.azure.com', '');

// Create Azure provider for AI SDK
const azure = createAzure({
  resourceName: resourceName,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: '2024-02-01'  // Use stable API version
});

// Export openai function that uses the chat deployment
export const openai = (modelName) => {
  // Map generic model names to actual deployment names
  const deploymentMap = {
    'gpt-4o': process.env.AZURE_OPENAI_CHAT_DEPLOYMENT,
    'gpt-4': process.env.AZURE_OPENAI_CHAT_DEPLOYMENT,
    'gpt-4.1': process.env.AZURE_OPENAI_CHAT_DEPLOYMENT,
    'gpt-35-turbo': process.env.AZURE_OPENAI_CHAT_DEPLOYMENT,
  };
  
  const deployment = deploymentMap[modelName] || process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
  return azure(deployment);
};

// Export the azure instance as client for backwards compatibility
export const client = azure;
export default azure;

// Generate orientation analysis for user choices
export async function generateOrientationAnalysis({ userChoices, userGpa, userProfile }) {
  try {
    const { generateText } = await import('ai');
    
    // Prepare choices data for analysis with more detailed information
    const choicesData = userChoices.map((choice, index) => {
      const historicalTrend = choice.historical_scores ? 
        Object.entries(choice.historical_scores)
          .filter(([year, score]) => score && score > 0)
          .sort(([a], [b]) => b.localeCompare(a))
          .slice(0, 3)
          .map(([year, score]) => `${year}: ${score}`) : [];
      
      return {
        rank: index + 1,
        name: choice.name,
        university: choice.university,
        institution: choice.institution,
        location: choice.location,
        ramz_code: choice.ramz_code,
        acceptanceRate: choice.acceptanceRate || 0,
        lastYearScore: choice.lastYearScore || 0,
        historicalTrend: historicalTrend.join(' → '),
        fieldOfStudy: choice.fieldOfStudy || choice.field_of_study || 'غير محدد',
        bacType: choice.bacType || choice.bac_type_name || 'غير محدد'
      };
    });

    const prompt = `
أنت محلل تعليمي خبير متخصص في التوجيه الجامعي في تونس مع خبرة 15 سنة في تحليل فرص القبول الجامعي وتقديم الاستشارات التعليمية.

بيانات الطالب:
- المعدل العام: ${userGpa}
- نوع الباكالوريا: ${userProfile?.bacType || 'غير محدد'}
- المنطقة: ${userProfile?.region || 'غير محددة'}
- عدد الاختيارات: ${userChoices.length}

قائمة اختيارات الطالب (مرتبة حسب الأولوية):
${choicesData.map(choice => `
${choice.rank}. ${choice.name}
   - الجامعة: ${choice.university}
   - المؤسسة: ${choice.institution}
   - المنطقة: ${choice.location}
   - مجال الدراسة: ${choice.fieldOfStudy}
   - نوع الباك المطلوب: ${choice.bacType}
   - رمز البرنامج: ${choice.ramz_code}
   - نسبة القبول المتوقعة: ${choice.acceptanceRate}%
   - آخر نقطة قطع: ${choice.lastYearScore}
   - الاتجاه التاريخي: ${choice.historicalTrend || 'غير متوفر'}
`).join('\n')}

مطلوب منك تحليل شامل ومفصل مع التركيز على:
1. تحليل استراتيجية الطالب الحالية ونقاط القوة والضعف
2. تحديد الاختيار الأكثر احتمالاً للقبول مع التبرير المفصل
3. تقديم وصف تحليلي شامل للوضع العام
4. اقتراحات تحسينية محددة وعملية
5. توصيات استراتيجية لضمان أفضل النتائج

أرجع النتيجة بصيغة JSON دقيقة ومفصلة:
{
  "overallAcceptanceRate": رقم بين 0-100,
  "riskLevel": "منخفض" أو "متوسط" أو "عالي",
  "analysisDescription": "وصف تحليلي مفصل (250-350 كلمة) يشرح استراتيجية الطالب الحالية، نقاط القوة والضعف في اختياراته، التوزيع الجغرافي، تنوع التخصصات، ومدى ملاءمة الاختيارات للمعدل الحاصل عليه",
  "mostProbableChoice": {
    "rank": رقم الاختيار الأكثر احتمالاً للقبول,
    "name": "اسم التخصص",
    "university": "اسم الجامعة",
    "probability": رقم بين 0-100,
    "reasoning": "سبب مفصل ومقنع لكونه الأكثر احتمالاً للقبول (150-200 كلمة) مع ذكر العوامل المساعدة"
  },
  "improvements": [
    {
      "originalRank": رقم الاختيار الأصلي,
      "suggestedProgram": "اسم البرنامج المقترح كبديل أفضل",
      "reasoning": "سبب الاقتراح المفصل مع ذكر المزايا",
      "improvementPercentage": رقم بين 0-100,
      "category": "نوع التحسين: أمان/تنويع/فرصة أفضل/تخصص مشابه"
    }
  ],
  "strategicRecommendations": [
    "توصية استراتيجية محددة وعملية 1",
    "توصية استراتيجية محددة وعملية 2", 
    "توصية استراتيجية محددة وعملية 3"
  ],
  "riskFactors": [
    "عامل خطر محدد 1",
    "عامل خطر محدد 2"
  ],
  "strengths": [
    "نقطة قوة واضحة 1",
    "نقطة قوة واضحة 2"
  ],
  "choiceDistribution": {
    "safe": عدد الاختيارات الآمنة,
    "moderate": عدد الاختيارات المتوسطة,
    "risky": عدد الاختيارات المخاطرة
  }
}`;

    const result = await generateText({
      model: openai('gpt-4o'),
      prompt,
      temperature: 0.7,
      maxTokens: 3000,
    });

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Enhanced fallback analysis with new structure
      const topChoice = userChoices[0] || {};
      analysis = {
        overallAcceptanceRate: Math.max(30, Math.min(95, userGpa - 10)),
        riskLevel: userGpa >= 85 ? 'منخفض' : userGpa >= 70 ? 'متوسط' : 'عالي',
        analysisDescription: `بناءً على المعدل الحاصل عليه (${userGpa}) والاختيارات المقدمة، يظهر التحليل أن الطالب قد اختار مجموعة متنوعة من التخصصات. الاستراتيجية المتبعة تتضمن ${userChoices.length} اختيارات، مما يوفر مرونة جيدة في عملية التوجيه. من المهم مراجعة ترتيب الأولويات للتأكد من توافقها مع الأهداف المهنية والأكاديمية. يُنصح بالتنويع بين اختيارات آمنة وأخرى طموحة لضمان أفضل النتائج.`,
        mostProbableChoice: {
          rank: 1,
          name: topChoice.name || 'الاختيار الأول',
          university: topChoice.university || 'الجامعة',
          probability: Math.max(60, Math.min(95, userGpa - 5)),
          reasoning: `يعتبر هذا الاختيار الأكثر احتمالاً للقبول لكونه في المرتبة الأولى من أولويات الطالب. المعدل الحالي يوفر فرصة جيدة للقبول، خاصة مع مراعاة المعايير التاريخية للقبول في هذا التخصص.`
        },
        improvements: [],
        strategicRecommendations: [
          'مراجعة ترتيب الأولويات بناءً على الميول والقدرات الشخصية',
          'إضافة خيارات احتياطية آمنة لضمان القبول',
          'التواصل مع مستشار أكاديمي لتحسين الاستراتيجية'
        ],
        riskFactors: ['قد تحتاج لمراجعة بعض الاختيارات عالية التنافسية'],
        strengths: ['تنوع جيد في التخصصات', 'عدد مناسب من الاختيارات'],
        choiceDistribution: {
          safe: Math.ceil(userChoices.length * 0.3),
          moderate: Math.ceil(userChoices.length * 0.4),
          risky: Math.floor(userChoices.length * 0.3)
        }
      };
    }

    return analysis;

  } catch (error) {
    console.error('Error in generateOrientationAnalysis:', error);
    throw new Error('فشل في إنتاج التحليل');
  }
}
