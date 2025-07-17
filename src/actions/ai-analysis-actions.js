'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ============================================
// AI ANALYSIS ACTIONS
// ============================================

/**
 * Generate AI analysis for comparison
 */
export async function generateComparisonAnalysis(comparisonData) {
  try {
    const { userId: clerkId } = await auth();
    
    let userId = null;
    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId }
      });
      userId = user?.id;
    }

    const { orientation1, orientation2, userProfile } = comparisonData;
    
    // Generate comprehensive AI analysis
    const analysis = await generateDetailedAnalysis(orientation1, orientation2, userProfile);
    
    // Store analysis if user is authenticated
    if (userId) {
      await prisma.comparison.create({
        data: {
          userId,
          orientation1Id: orientation1.code,
          orientation2Id: orientation2.code,
          aiAnalysis: analysis,
          userProfileSnapshot: userProfile,
          status: 'completed'
        }
      });
    }

    return { success: true, analysis };
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get smart prompts based on comparison context
 */
export async function getComparisonPrompts(comparisonData) {
  const { orientation1, orientation2, userProfile } = comparisonData;
  
  const prompts = [
    `ما هي أهم الفروقات بين ${orientation1.licence} و ${orientation2.licence}؟`,
    `أيهما أفضل لمستقبلي المهني؟`,
    `ما هي فرص العمل لكل تخصص؟`,
    `كيف يمكنني تحسين فرص قبولي؟`,
    `ما هي متطلبات كل تخصص؟`,
    `أيهما أكثر صعوبة في الدراسة؟`,
    `ما هو متوسط الراتب لخريجي كل تخصص؟`,
    `هل يمكنني تغيير التخصص لاحقاً؟`
  ];

  // Context-specific prompts based on user score
  const userScore = userProfile?.fsScore || 0;
  const score1 = orientation1?.seuil || 0;
  const score2 = orientation2?.seuil || 0;

  if (userScore < Math.min(score1, score2)) {
    prompts.push('كيف يمكنني رفع نقاطي للوصول للتخصص المطلوب؟');
    prompts.push('ما هي البدائل المتاحة لي؟');
  }

  if (Math.abs(score1 - score2) > 3) {
    prompts.push('لماذا يوجد فرق كبير في النقاط المطلوبة؟');
  }

  return { success: true, prompts };
}

/**
 * Generate detailed analysis (this would integrate with actual AI in production)
 */
async function generateDetailedAnalysis(orientation1, orientation2, userProfile) {
  // This is a mock implementation - in production, this would call Azure OpenAI or similar
  const userScore = userProfile?.fsScore || 0;
  const score1 = orientation1?.seuil || orientation1?.score2024 || 0;
  const score2 = orientation2?.seuil || orientation2?.score2024 || 0;
  
  // Calculate admission chances
  const getAdmissionChance = (required, actual) => {
    if (actual >= required) return { text: 'عالية', color: 'green', percentage: 85 };
    if (actual >= required - 2) return { text: 'متوسطة', color: 'orange', percentage: 60 };
    if (actual >= required - 4) return { text: 'ضعيفة', color: 'red', percentage: 30 };
    return { text: 'ضعيفة جداً', color: 'red', percentage: 10 };
  };

  const chance1 = getAdmissionChance(score1, userScore);
  const chance2 = getAdmissionChance(score2, userScore);

  // Determine recommendation
  let recommendation = orientation1.licence;
  let confidence = 75;
  
  if (chance2.percentage > chance1.percentage) {
    recommendation = orientation2.licence;
    confidence = Math.min(85, chance2.percentage + 10);
  } else if (chance1.percentage > chance2.percentage) {
    confidence = Math.min(85, chance1.percentage + 10);
  }

  return {
    summary: {
      recommendation,
      confidence,
      reasoning: "بناء على تحليل شامل لملفك الأكاديمي ومتطلبات التخصصات ومؤشرات سوق العمل",
      generatedAt: new Date().toISOString()
    },
    orientation1Analysis: {
      name: orientation1.licence,
      university: orientation1.Libelle_universite,
      code: orientation1.code,
      admissionChance: chance1,
      requiredScore: score1,
      userScore: userScore,
      scoreDifference: userScore - score1,
      
      // Academic aspects
      difficulty: calculateDifficulty(orientation1),
      duration: getDuration(orientation1),
      prerequisites: getPrerequisites(orientation1),
      
      // Career prospects
      careerProspects: {
        employmentRate: getEmploymentRate(orientation1),
        averageSalary: getAverageSalary(orientation1),
        careerGrowth: getCareerGrowth(orientation1),
        industries: getIndustries(orientation1)
      },
      
      // Pros and cons
      strengths: getStrengths(orientation1),
      challenges: getChallenges(orientation1),
      
      // Rating
      overallRating: calculateOverallRating(orientation1, userProfile),
      
      // Detailed metrics
      metrics: {
        marketDemand: getMarketDemand(orientation1),
        competitiveness: getCompetitiveness(orientation1),
        futureProspects: getFutureProspects(orientation1),
        skillAlignment: getSkillAlignment(orientation1, userProfile)
      }
    },
    orientation2Analysis: {
      name: orientation2.licence,
      university: orientation2.Libelle_universite,
      code: orientation2.code,
      admissionChance: chance2,
      requiredScore: score2,
      userScore: userScore,
      scoreDifference: userScore - score2,
      
      // Academic aspects
      difficulty: calculateDifficulty(orientation2),
      duration: getDuration(orientation2),
      prerequisites: getPrerequisites(orientation2),
      
      // Career prospects
      careerProspects: {
        employmentRate: getEmploymentRate(orientation2),
        averageSalary: getAverageSalary(orientation2),
        careerGrowth: getCareerGrowth(orientation2),
        industries: getIndustries(orientation2)
      },
      
      // Pros and cons
      strengths: getStrengths(orientation2),
      challenges: getChallenges(orientation2),
      
      // Rating
      overallRating: calculateOverallRating(orientation2, userProfile),
      
      // Detailed metrics
      metrics: {
        marketDemand: getMarketDemand(orientation2),
        competitiveness: getCompetitiveness(orientation2),
        futureProspects: getFutureProspects(orientation2),
        skillAlignment: getSkillAlignment(orientation2, userProfile)
      }
    },
    actionPlan: {
      immediate: generateImmediateActions(orientation1, orientation2, userProfile),
      shortTerm: generateShortTermActions(orientation1, orientation2, userProfile),
      longTerm: generateLongTermActions(orientation1, orientation2, userProfile)
    },
    recommendations: {
      primary: recommendation,
      alternative: recommendation === orientation1.licence ? orientation2.licence : orientation1.licence,
      reasoning: generateRecommendationReasoning(orientation1, orientation2, userProfile)
    }
  };
}

// Helper functions for analysis generation
function calculateDifficulty(orientation) {
  // Mock implementation - in reality, this would be based on data
  const techFields = ['informatique', 'mathématiques', 'physique'];
  const istech = techFields.some(field => 
    orientation.licence?.toLowerCase().includes(field) ||
    orientation.domaine?.toLowerCase().includes(field)
  );
  return istech ? 'صعب' : 'متوسط';
}

function getDuration(orientation) {
  return orientation.licence?.toLowerCase().includes('master') ? '5 سنوات' : '3 سنوات';
}

function getPrerequisites(orientation) {
  return [
    'إتقان اللغة العربية والفرنسية',
    'مهارات أساسية في الرياضيات',
    'قدرات تحليلية قوية'
  ];
}

function getEmploymentRate(orientation) {
  // Mock data - would be real statistics in production
  return Math.floor(Math.random() * 20) + 70; // 70-90%
}

function getAverageSalary(orientation) {
  const baseSalary = 45000;
  const variation = Math.floor(Math.random() * 40000);
  return `${baseSalary + variation} - ${baseSalary + variation + 30000} دج`;
}

function getCareerGrowth(orientation) {
  const growth = ['ممتاز', 'جيد', 'متوسط'];
  return growth[Math.floor(Math.random() * growth.length)];
}

function getIndustries(orientation) {
  return [
    'القطاع العام',
    'الشركات الخاصة',
    'المؤسسات الدولية',
    'العمل الحر'
  ];
}

function getStrengths(orientation) {
  return [
    'فرص عمل متنوعة',
    'مجال متطور ومتجدد',
    'إمكانيات التطوير والنمو المهني',
    'استقرار وظيفي جيد'
  ];
}

function getChallenges(orientation) {
  return [
    'منافسة عالية في القبول',
    'يتطلب تحديث مستمر للمهارات',
    'ضغط العمل في بعض المجالات'
  ];
}

function calculateOverallRating(orientation, userProfile) {
  return (Math.random() * 2 + 3).toFixed(1); // 3.0 - 5.0
}

function getMarketDemand(orientation) {
  return Math.floor(Math.random() * 30) + 70; // 70-100%
}

function getCompetitiveness(orientation) {
  return Math.floor(Math.random() * 40) + 60; // 60-100%
}

function getFutureProspects(orientation) {
  return Math.floor(Math.random() * 30) + 70; // 70-100%
}

function getSkillAlignment(orientation, userProfile) {
  return Math.floor(Math.random() * 40) + 60; // 60-100%
}

function generateImmediateActions(orientation1, orientation2, userProfile) {
  return [
    'مراجعة شروط القبول لكل تخصص',
    'تحديد نقاط القوة والضعف في ملفك الأكاديمي',
    'البحث عن معلومات إضافية حول المناهج الدراسية',
    'التواصل مع طلاب أو خريجين من التخصصات'
  ];
}

function generateShortTermActions(orientation1, orientation2, userProfile) {
  return [
    'تحسين النقاط في المواد الأساسية',
    'تطوير المهارات اللغوية والتقنية',
    'البحث عن فرص التدريب أو الخبرة العملية',
    'إعداد خطة دراسية منظمة'
  ];
}

function generateLongTermActions(orientation1, orientation2, userProfile) {
  return [
    'التخطيط للدراسات العليا',
    'بناء شبكة علاقات مهنية',
    'متابعة التطورات في المجال المختار',
    'تطوير مهارات ريادة الأعمال'
  ];
}

function generateRecommendationReasoning(orientation1, orientation2, userProfile) {
  return [
    'تحليل معدلاتك الأكاديمية ومتطلبات التخصصات',
    'دراسة فرص العمل المستقبلية',
    'مراعاة ميولك واهتماماتك الشخصية',
    'تقييم مستوى الصعوبة والتحدي المطلوب'
  ];
}

export { generateDetailedAnalysis };
