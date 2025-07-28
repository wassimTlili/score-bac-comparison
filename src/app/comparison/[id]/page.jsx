'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { ArrowLeft, Brain, Award, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ChatSidebar from '@/components/ChatSidebar';
import { Button } from '@/components/ui/button';
import { getUserProfile } from '@/actions/profile-actions';
import { trackData, calculateMG, calculateFS } from '@/utils/calculations';

export default function ComparisonResults() {
  const params = useParams();
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useAuth();
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [expandedCriteria, setExpandedCriteria] = useState({});
  const [userData, setUserData] = useState(null);
  const [scores, setScores] = useState({ mg: 0, fs: 0 });

  // Helper function to extract location from university name
  const getLocationFromUniversity = (universityName) => {
    if (!universityName) return 'غير محدد';
    
    const locationMap = {
      'تونس': ['تونس', 'قرطاج', 'منوبة'],
      'سوسة': ['سوسة'],
      'صفاقس': ['صفاقس'],
      'المنستير': ['المنستير'],
      'قابس': ['قابس'],
      'قفصة': ['قفصة'],
      'القيروان': ['القيروان'],
      'جندوبة': ['جندوبة'],
      'قصرين': ['قصرين'],
      'الكاف': ['الكاف'],
      'بوزيد': ['بوزيد'],
      'مدنين': ['مدنين']
    };
    
    for (const [location, keywords] of Object.entries(locationMap)) {
      for (const keyword of keywords) {
        if (universityName.includes(keyword)) {
          return location;
        }
      }
    }
    
    return 'غير محدد';
  };

  useEffect(() => {
    // Redirect logic first
    const checkUserAndRedirect = async () => {
      if (isLoaded && !isSignedIn) {router.push('/');
        return false;
      }
      
      if (isLoaded && isSignedIn && user) {
        try {
          const result = await getUserProfile();
          if (!result.success || !result.profile) {router.push('/stepper');
            return false;
          }
        } catch (error) {
          console.error('❌ Error checking user profile:', error);
          router.push('/stepper');
          return false;
        }
      }
      
      return true; // OK to proceed
    };

    const initializePage = async () => {
      const canProceed = await checkUserAndRedirect();
      if (canProceed) {
        loadComparison();
        if (isSignedIn) {
          loadUserProfile();
        }
      }
    };

    initializePage();
  }, [params.id, isLoaded, isSignedIn, user, router]);

  const loadUserProfile = async () => {
    try {
      const result = await getUserProfile();
      if (result.success && result.profile) {
        const profile = result.profile;
        
        // Convert database profile to userData format
        const userData = {
          filiere: profile.filiere,
          wilaya: profile.wilaya,
          notes: profile.grades,
          birthDate: profile.birthDate,
          gender: profile.gender,
          session: profile.session
        };
        
        setUserData(userData);
        
        // Calculate or use pre-calculated scores
        if (profile.mgScore && profile.fsScore) {
          setScores({
            mg: profile.mgScore,
            fs: profile.fsScore
          });
        } else if (profile.filiere && trackData[profile.filiere] && profile.grades) {
          const mappedGrades = mapGradesToCalculationFormat(profile.grades, profile.filiere);
          const track = { id: profile.filiere, name: trackData[profile.filiere].name };
          
          const mg = calculateMG(mappedGrades, track);
          const fs = calculateFS(mappedGrades, track, mg);
          
          setScores({ mg, fs });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Map form grades to calculation format
  const mapGradesToCalculationFormat = (notes, filiere) => {
    const mappedGrades = {};
    
    // Common subject mappings
    if (notes.mathematics) mappedGrades.math = parseFloat(notes.mathematics);
    if (notes.physics) mappedGrades.physics = parseFloat(notes.physics);
    if (notes.chemistry) mappedGrades.chemistry = parseFloat(notes.chemistry);
    if (notes.biology) mappedGrades.svt = parseFloat(notes.biology);
    if (notes.french) mappedGrades.french = parseFloat(notes.french);
    if (notes.arabic) mappedGrades.arabic = parseFloat(notes.arabic);
    if (notes.english) mappedGrades.english = parseFloat(notes.english);
    if (notes.philosophy) mappedGrades.philosophy = parseFloat(notes.philosophy);
    if (notes.history) mappedGrades.hg = parseFloat(notes.history);
    if (notes.geography && !mappedGrades.hg) mappedGrades.hg = parseFloat(notes.geography);
    
    // Track-specific mappings
    switch (filiere) {
      case 'info':
        if (notes.algorithmics) mappedGrades.algo = parseFloat(notes.algorithmics);
        if (notes.ict) mappedGrades.tic = parseFloat(notes.ict);
        if (notes.database) mappedGrades.bdd = parseFloat(notes.database);
        break;
      case 'tech':
        if (notes.technique) mappedGrades.technique = parseFloat(notes.technique);
        break;
      case 'eco':
        if (notes.economics) mappedGrades.eco = parseFloat(notes.economics);
        if (notes.management) mappedGrades.gestion = parseFloat(notes.management);
        break;
      case 'sport':
        if (notes.sportPractical) mappedGrades.sportPractical = parseFloat(notes.sportPractical);
        if (notes.sportTheory) mappedGrades.sportTheory = parseFloat(notes.sportTheory);
        if (notes.physicalEducation) mappedGrades.ep = parseFloat(notes.physicalEducation);
        if (notes.sport) mappedGrades.sport = parseFloat(notes.sport);
        break;
    }
    
    return mappedGrades;
  };

  const loadComparison = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/comparison/${params.id}`);
      if (!response.ok) {
        setError('لم يتم العثور على المقارنة');
        return;
      }
      const comparisonData = await response.json();
      setComparison(comparisonData);
      setAiAnalysis(comparisonData.aiAnalysis);
      setIsLoading(false);
      
      if (!comparisonData.aiAnalysis) {
        generateAIAnalysis(comparisonData);
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const generateAIAnalysis = async (comparisonData) => {
    setIsGeneratingAI(true);
    try {
      // Import the real AI analysis system
      const { generateComparisonAnalysis } = await import('@/actions/ai-comparison');// Use the real AI analysis system
      const aiAnalysis = await generateComparisonAnalysis(comparisonData);
      
      // Update the comparison in the database
      const response = await fetch(`/api/comparison/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiAnalysis })
      });
      
      if (response.ok) {
        const updated = await response.json();
        setAiAnalysis(updated.aiAnalysis);
      } else {
        // If server update fails, still use the generated analysis
        setAiAnalysis(aiAnalysis);
      }
    } catch (error) {
      console.error('❌ Error generating AI analysis:', error);
      
      // Fallback: Use the existing detailed analysis system
      try {
        const { generateDetailedAnalysis } = await import('@/actions/ai-analysis-actions');
        const fallbackAnalysis = await generateDetailedAnalysis(
          comparisonData.orientation1, 
          comparisonData.orientation2, 
          comparisonData.userProfile
        );
        setAiAnalysis(fallbackAnalysis);
      } catch (fallbackError) {
        console.error('❌ Fallback analysis failed:', fallbackError);
        setError('فشل في إنشاء التحليل الذكي. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const toggleCriteriaExpansion = (criteria) => {
    setExpandedCriteria(prev => ({
      ...prev,
      [criteria]: !prev[criteria]
    }));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center bg-red-500/20 border border-red-400/50 rounded-2xl p-12 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">خطأ</h3>
          <p className="text-red-300 mb-6">{error}</p>
          <Button onClick={() => router.push('/comparison')} className="bg-cyan-500 text-gray-900 hover:bg-cyan-400">
            العودة للمقارنة
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold mb-2">جاري تحميل المقارنة...</h3>
          <p className="text-gray-400">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  if (comparison && !comparison.userProfile) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center bg-yellow-500/20 border border-yellow-400/50 rounded-2xl p-12 max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">بيانات المستخدم غير متوفرة</h3>
          <p className="text-yellow-300 mb-6">يرجى إعادة إدخال بياناتك الشخصية أو تحديثها</p>
          <Button onClick={() => router.push('/stepper')} className="bg-cyan-500 text-gray-900 hover:bg-cyan-400">
            إكمال البيانات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100" dir="rtl">
      <div className="relative z-10">
        <div className="container mx-auto px-6 pt-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push('/comparison')}
              className="flex items-center text-gray-300 hover:text-cyan-300 transition-colors text-lg"
            >
              <ArrowLeft className="w-5 h-5 ml-2" />
              العودة للمقارنة
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-cyan-300">مقارنة التخصصات</h1>
            <p className="text-gray-400">تحليل مفصل ومقارنة شاملة</p>
          </div>

          {comparison && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">🎓</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-cyan-300">
                      {comparison.orientation1?.licence || comparison.orientation1?.table_specialization || comparison.orientation1?.name || 'تخصص غير محدد'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {comparison.orientation1?.university || comparison.orientation1?.table_institution || comparison.orientation1?.Libelle_universite || comparison.orientation1?.institution || 'جامعة غير محددة'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">النقطة المطلوبة:</span>
                    <span className="font-medium text-cyan-300">
                      {comparison.orientation1?.historical_scores?.["2024"] || 
                       comparison.orientation1?.minimum_bac_average ||
                       (comparison.orientation1?.historical_scores && 
                        Object.values(comparison.orientation1.historical_scores).find(score => score > 0)) || 
                       'غير محدد'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">الولاية:</span>
                    <span className="font-medium text-cyan-300">
                      {comparison.orientation1?.table_location || 
                       getLocationFromUniversity(comparison.orientation1?.university_name)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">🎓</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-cyan-300">
                      {comparison.orientation2?.licence || comparison.orientation2?.table_specialization || comparison.orientation2?.name || 'تخصص غير محدد'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {comparison.orientation2?.university || comparison.orientation2?.table_institution || comparison.orientation2?.Libelle_universite || comparison.orientation2?.institution || 'جامعة غير محددة'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">النقطة المطلوبة:</span>
                    <span className="font-medium text-cyan-300">
                      {comparison.orientation2?.historical_scores?.["2024"] || 
                       comparison.orientation2?.minimum_bac_average ||
                       (comparison.orientation2?.historical_scores && 
                        Object.values(comparison.orientation2.historical_scores).find(score => score > 0)) || 
                       'غير محدد'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">الولاية:</span>
                    <span className="font-medium text-cyan-300">
                      {comparison.orientation2?.table_location || 
                       getLocationFromUniversity(comparison.orientation2?.university_name)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <Brain className="w-8 h-8 text-cyan-300 ml-3" />
              <h2 className="text-2xl font-bold text-cyan-300">التحليل الذكي</h2>
            </div>

            {isGeneratingAI ? (
              <div className="text-center py-16">
                <div className="animate-pulse">
                  <Brain className="w-16 h-16 text-cyan-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">جاري إعداد التحليل المتقدم...</h3>
                  <p className="text-gray-400 text-lg">يقوم الذكاء الاصطناعي بتحليل ملفك الأكاديمي ومقارنة التخصصات</p>
                </div>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-8">
                {/* Check if we have the new criteriaComparison format or the old format */}
                {aiAnalysis.criteriaComparison ? (
                  // New AI format with criteriaComparison
                  <>
                    {/* Overall Scores Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                      {/* Orientation 1 Score */}
                      <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-8 text-center border border-gray-600 shadow-xl">
                        <h4 className="font-bold text-2xl mb-6 text-cyan-300">
                          {aiAnalysis.overallScores?.orientation1?.name || comparison?.orientation1?.licence || comparison?.orientation1?.table_specialization || comparison?.orientation1?.name || 'التخصص الأول'}
                        </h4>
                        <div className="relative mb-6">
                          <div className="text-6xl font-bold text-blue-400 mb-3">
                            {aiAnalysis.overallScores?.orientation1?.percentage || 0}%
                          </div>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-4 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-400 h-4 rounded-full transition-all duration-2000 ease-out"
                            style={{ width: `${aiAnalysis.overallScores?.orientation1?.percentage || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Orientation 2 Score */}
                      <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-8 text-center border border-gray-600 shadow-xl">
                        <h4 className="font-bold text-2xl mb-6 text-cyan-300">
                          {aiAnalysis.overallScores?.orientation2?.name || comparison?.orientation2?.licence || comparison?.orientation2?.table_specialization || comparison?.orientation2?.name || 'التخصص الثاني'}
                        </h4>
                        <div className="relative mb-6">
                          <div className="text-6xl font-bold text-green-400 mb-3">
                            {aiAnalysis.overallScores?.orientation2?.percentage || 0}%
                          </div>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-4 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-400 h-4 rounded-full transition-all duration-2000 ease-out"
                            style={{ width: `${aiAnalysis.overallScores?.orientation2?.percentage || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Criteria Analysis */}
                    <div className="space-y-6">
                      <h3 className="text-3xl font-bold text-cyan-300 mb-8 text-center">التحليل التفصيلي للمعايير الستة</h3>
                      
                      {aiAnalysis.criteriaComparison && Object.entries(aiAnalysis.criteriaComparison).map(([criteria, comparison], index) => {
                        const score1 = comparison.orientation1?.score || 0;
                        const score2 = comparison.orientation2?.score || 0;
                        const note1 = comparison.orientation1?.note || '';
                        const note2 = comparison.orientation2?.note || '';
                        const details1 = comparison.orientation1?.details || '';
                        const details2 = comparison.orientation2?.details || '';
                        
                        const getGradientColor = (score) => {
                          if (score >= 85) return 'from-green-500 to-emerald-400';
                          if (score >= 70) return 'from-blue-500 to-cyan-400';
                          if (score >= 55) return 'from-yellow-500 to-orange-400';
                          return 'from-red-500 to-pink-400';
                        };

                        const getCriteriaIcon = (criteria) => {
                          const icons = {
                            'فرص القبول': '🎯',
                            'سوق العمل': '💼',
                            'المرتب المتوقع': '💰',
                            'صعوبة الدراسة': '📚',
                            'التطوير المهني': '📈',
                            'الاستقرار الوظيفي': '🛡️'
                          };
                          return icons[criteria] || '⭐';
                        };

                        return (
                          <div key={criteria} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl border border-gray-600 overflow-hidden shadow-xl">
                            <div 
                              className="p-8 cursor-pointer hover:bg-gray-600/20 transition-all duration-300"
                              onClick={() => toggleCriteriaExpansion(criteria)}
                            >
                              <div className="flex items-center justify-between mb-6">
                                <h4 className="text-2xl font-bold text-cyan-300 flex items-center">
                                  <span className="text-3xl ml-4">{getCriteriaIcon(criteria)}</span>
                                  <span>{criteria}</span>
                                  {expandedCriteria[criteria] ? 
                                    <ChevronUp className="w-6 h-6 ml-3 text-gray-400" /> : 
                                    <ChevronDown className="w-6 h-6 ml-3 text-gray-400" />
                                  }
                                </h4>
                              </div>
                              
                              {/* Main Comparison Display */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Orientation 1 */}
                                <div className="bg-gray-900/50 rounded-xl p-6 border border-blue-500/20">
                                  <div className="flex items-center justify-between mb-4">
                                    <h5 className="text-lg font-semibold text-blue-300">
                                      {aiAnalysis.overallScores?.orientation1?.name || comparison?.orientation1?.licence || comparison?.orientation1?.table_specialization || comparison?.orientation1?.name || 'التخصص الأول'}
                                    </h5>
                                    <div className="text-right">
                                      <div className="text-3xl font-bold text-blue-400">{score1}</div>
                                      <div className="text-sm text-gray-400">من 100</div>
                                    </div>
                                  </div>
                                  
                                  <div className="mb-4">
                                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                                      <div 
                                        className={`h-4 rounded-full bg-gradient-to-r ${getGradientColor(score1)} transition-all duration-1000 ease-out`}
                                        style={{ width: `${score1}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  <p className="text-gray-300 text-sm leading-relaxed bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                                    {note1}
                                  </p>
                                </div>

                                {/* Orientation 2 */}
                                <div className="bg-gray-900/50 rounded-xl p-6 border border-green-500/20">
                                  <div className="flex items-center justify-between mb-4">
                                    <h5 className="text-lg font-semibold text-green-300">
                                      {aiAnalysis.overallScores?.orientation2?.name || comparison?.orientation2?.licence || comparison?.orientation2?.table_specialization || comparison?.orientation2?.name || 'التخصص الثاني'}
                                    </h5>
                                    <div className="text-right">
                                      <div className="text-3xl font-bold text-green-400">{score2}</div>
                                      <div className="text-sm text-gray-400">من 100</div>
                                    </div>
                                  </div>
                                  
                                  <div className="mb-4">
                                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                                      <div 
                                        className={`h-4 rounded-full bg-gradient-to-r ${getGradientColor(score2)} transition-all duration-1000 ease-out`}
                                        style={{ width: `${score2}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  <p className="text-gray-300 text-sm leading-relaxed bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                                    {note2}
                                  </p>
                                </div>
                              </div>

                              {/* Winner Indicator */}
                              <div className="mt-6 text-center">
                                {score1 > score2 ? (
                                  <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 border border-blue-400/50 rounded-full">
                                    <span className="text-blue-300 font-semibold">🏆 الأفضل: {aiAnalysis.overallScores?.orientation1?.name || 'التخصص الأول'}</span>
                                  </div>
                                ) : score2 > score1 ? (
                                  <div className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-400/50 rounded-full">
                                    <span className="text-green-300 font-semibold">🏆 الأفضل: {aiAnalysis.overallScores?.orientation2?.name || 'التخصص الثاني'}</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center px-4 py-2 bg-yellow-500/20 border border-yellow-400/50 rounded-full">
                                    <span className="text-yellow-300 font-semibold">⚖️ متساويان في هذا المعيار</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedCriteria[criteria] && (
                              <div className="px-8 pb-8 border-t border-gray-600 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
                                <div className="mt-6">
                                  <h4 className="text-xl font-bold text-cyan-300 mb-6 text-center">تفاصيل التحليل المتعمق</h4>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Orientation 1 Details */}
                                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-6 border border-blue-500/20">
                                      <div className="flex items-center mb-4">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full ml-3"></div>
                                        <h5 className="font-bold text-blue-300 text-lg">
                                          {aiAnalysis.overallScores?.orientation1?.name || comparison?.orientation1?.table_specialization || 'التخصص الأول'}
                                        </h5>
                                        <div className="mr-auto bg-blue-500/20 px-3 py-1 rounded-full">
                                          <span className="text-blue-300 font-bold">{score1}/100</span>
                                        </div>
                                      </div>
                                      <div className="prose prose-invert max-w-none">
                                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                                          {details1}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Orientation 2 Details */}
                                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-6 border border-green-500/20">
                                      <div className="flex items-center mb-4">
                                        <div className="w-3 h-3 bg-green-400 rounded-full ml-3"></div>
                                        <h5 className="font-bold text-green-300 text-lg">
                                          {aiAnalysis.overallScores?.orientation2?.name || comparison?.orientation2?.table_specialization || 'التخصص الثاني'}
                                        </h5>
                                        <div className="mr-auto bg-green-500/20 px-3 py-1 rounded-full">
                                          <span className="text-green-300 font-bold">{score2}/100</span>
                                        </div>
                                      </div>
                                      <div className="prose prose-invert max-w-none">
                                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                                          {details2}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  // Legacy AI format support
                  <div className="bg-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-cyan-300 mb-4">تحليل ذكي متقدم</h3>
                    <div className="space-y-4">
                      {/* Display legacy format */}
                      {aiAnalysis.orientation1Analysis && (
                        <div className="bg-blue-500/10 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-300 mb-2">{aiAnalysis.orientation1Analysis.name}</h4>
                          <p className="text-sm text-gray-300 mb-2">
                            <strong>نقطة الملائمة:</strong> {aiAnalysis.orientation1Analysis.overallRating}/5
                          </p>
                          <p className="text-sm text-gray-300 mb-2">
                            <strong>فرص القبول:</strong> {aiAnalysis.orientation1Analysis.admissionChance?.text} ({aiAnalysis.orientation1Analysis.admissionChance?.percentage}%)
                          </p>
                          <div className="text-xs text-gray-400">
                            <p><strong>نقاط القوة:</strong> {aiAnalysis.orientation1Analysis.strengths?.join('، ')}</p>
                            <p><strong>التحديات:</strong> {aiAnalysis.orientation1Analysis.challenges?.join('، ')}</p>
                          </div>
                        </div>
                      )}
                      
                      {aiAnalysis.orientation2Analysis && (
                        <div className="bg-green-500/10 rounded-lg p-4">
                          <h4 className="font-semibold text-green-300 mb-2">{aiAnalysis.orientation2Analysis.name}</h4>
                          <p className="text-sm text-gray-300 mb-2">
                            <strong>نقطة الملائمة:</strong> {aiAnalysis.orientation2Analysis.overallRating}/5
                          </p>
                          <p className="text-sm text-gray-300 mb-2">
                            <strong>فرص القبول:</strong> {aiAnalysis.orientation2Analysis.admissionChance?.text} ({aiAnalysis.orientation2Analysis.admissionChance?.percentage}%)
                          </p>
                          <div className="text-xs text-gray-400">
                            <p><strong>نقاط القوة:</strong> {aiAnalysis.orientation2Analysis.strengths?.join('، ')}</p>
                            <p><strong>التحديات:</strong> {aiAnalysis.orientation2Analysis.challenges?.join('، ')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Final Recommendation */}
                {(aiAnalysis.finalRecommendation || aiAnalysis.summary) && (
                  <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-teal-500/20 rounded-2xl p-8 border border-cyan-400/30 mt-8">
                    <div className="text-center mb-6">
                      <Award className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-cyan-300">التوصية النهائية</h3>
                    </div>
                    
                    <div className="text-center mb-6">
                      <p className="text-gray-300 text-lg mb-2">التخصص الأنسب لك هو:</p>
                      <h4 className="text-3xl font-bold text-yellow-300 mb-4">
                        {aiAnalysis.finalRecommendation?.winner || aiAnalysis.summary?.recommendation || 'غير محدد'}
                      </h4>
                      <p className="text-gray-300 leading-relaxed max-w-4xl mx-auto">
                        {aiAnalysis.finalRecommendation?.reasoning || aiAnalysis.summary?.reasoning || 'لا يوجد تفسير متاح'}
                      </p>
                      {aiAnalysis.summary?.confidence && (
                        <div className="mt-4">
                          <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm">
                            مستوى الثقة: {aiAnalysis.summary.confidence}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-700/50 rounded-xl p-6">
                      <h4 className="font-bold text-cyan-300 mb-4 text-center">الخطوات التالية المقترحة:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(aiAnalysis.finalRecommendation?.nextSteps || aiAnalysis.actionPlan?.immediate || []).map((step, index) => (
                          <div key={index} className="flex items-start space-x-3 space-x-reverse">
                            <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-gray-900 font-bold text-sm">{index + 1}</span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <Brain className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">التحليل غير متوفر</h3>
                <Button 
                  onClick={() => comparison && generateAIAnalysis(comparison)}
                  className="bg-cyan-500 text-gray-900 hover:bg-cyan-400"
                >
                  إنشاء التحليل
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ChatSidebar 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        userData={{
          mg: scores.mg,
          fs: scores.fs,
          wilaya: userData?.wilaya,
          filiere: userData?.filiere,
          context: 'comparison-results'
        }}
        comparison={comparison} 
      />
    </div>
  );
}