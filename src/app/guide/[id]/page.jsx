'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Heart, ExternalLink, MapPin, GraduationCap, Building2, Calendar, TrendingUp, BarChart3, Award, Users, Star, BookOpen, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import finaleData from '@/data/finale-data.json';
import { addToFavoritesByCode, removeFromFavoritesByCode, getUserFavoritesByCode } from '@/actions/favorites-actions';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function ProgramDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id: ramz_id } = params;
  const { isRedirecting, isReady, userProfile, isSignedIn, user } = useAuthRedirect({
    requireAuth: false,
    requireProfile: false
  });
  
  const [program, setProgram] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [relatedPrograms, setRelatedPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      if (isReady && !isRedirecting) {
        setIsLoading(true);
        await loadProgramData();
        await loadUserFavorites();
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [ramz_id, isReady, isRedirecting]);

  useEffect(() => {
    if (program) {
      loadRelatedPrograms();
    }
  }, [program]);

  const loadProgramData = async () => {
    try {
      const foundProgram = finaleData.find(p => p.ramz_id === ramz_id);
      if (foundProgram) {
        setProgram(foundProgram);
      } else {
        console.error('Program not found');
      }
    } catch (error) {
      console.error('Error loading program data:', error);
    }
  };

  // Load user favorites from database
  const loadUserFavorites = async () => {
    if (!isSignedIn) {
      setFavorites([]);
      return;
    }
    
    try {
      const userFavorites = await getUserFavoritesByCode();
      if (userFavorites.success) {
        setFavorites(userFavorites.favorites.map(fav => fav.orientationCode));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadRelatedPrograms = () => {
    try {
      // Find related programs by same university and field
      const related = finaleData.filter(p => 
        p.ramz_id !== program.ramz_id && 
        (p.university_name === program.university_name || 
         p.field_of_study === program.field_of_study)
      ).slice(0, 6);
      setRelatedPrograms(related);
    } catch (error) {
      console.error('Error loading related programs:', error);
    }
  };

  // Handle favorites toggle with database
  const handleFavoriteToggle = async () => {
    if (!isSignedIn) {
      alert('يجب تسجيل الدخول لإضافة المفضلة');
      return;
    }

    const orientationCode = program?.ramz_code;
    if (!orientationCode) return;

    console.log('🔍 Toggling favorite for:', orientationCode);
    setLoadingFavorites(true);

    try {
      const isFavorite = favorites.includes(orientationCode);
      
      if (isFavorite) {
        console.log('🔍 Removing from favorites...');
        const result = await removeFromFavoritesByCode(orientationCode);
        if (result.success) {
          setFavorites(prev => prev.filter(code => code !== orientationCode));
          console.log('✅ Removed from favorites');
        } else {
          console.error('❌ Failed to remove from favorites:', result.error);
        }
      } else {
        console.log('🔍 Adding to favorites...');
        const result = await addToFavoritesByCode(orientationCode);
        if (result.success) {
          setFavorites(prev => [...prev, orientationCode]);
          console.log('✅ Added to favorites');
        } else {
          console.error('❌ Failed to add to favorites:', result.error);
        }
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const getHistoricalScoresData = () => {
    if (!program?.historical_scores) return [];
    
    const scores = [];
    for (let year = 2024; year >= 2011; year--) {
      const score = program.historical_scores[year.toString()];
      if (score && score > 0) {
        scores.push({ year, score });
      }
    }
    return scores.reverse(); // Show chronologically
  };

  const getLatestScore = () => {
    const scores = getHistoricalScoresData();
    return scores.length > 0 ? scores[scores.length - 1] : null;
  };

  const getAverageScore = () => {
    const scores = getHistoricalScoresData();
    if (scores.length === 0) return null;
    const total = scores.reduce((sum, item) => sum + item.score, 0);
    return (total / scores.length).toFixed(2);
  };

  const getScoreTrend = () => {
    const scores = getHistoricalScoresData();
    if (scores.length < 2) return 'stable';
    const recent = scores.slice(-3);
    const firstScore = recent[0].score;
    const lastScore = recent[recent.length - 1].score;
    const difference = lastScore - firstScore;
    
    if (difference > 1) return 'increasing';
    if (difference < -1) return 'decreasing';
    return 'stable';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-blue-400 animate-spin animation-delay-150"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">جاري تحميل تفاصيل البرنامج</h2>
          <p className="text-gray-400">جاري تحميل المعلومات...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">البرنامج غير موجود</h2>
          <p className="text-gray-400 mb-6">لم يتم العثور على البرنامج المطلوب</p>
          <Button
            onClick={() => router.push('/guide')}
            className="bg-[#1581f3] hover:bg-blue-600 text-white"
          >
            العودة إلى الدليل
          </Button>
        </div>
      </div>
    );
  }

  const historicalScores = getHistoricalScoresData();
  const latestScore = getLatestScore();
  const averageScore = getAverageScore();
  const trend = getScoreTrend();
  const programIsFavorite = program ? favorites.includes(program.ramz_code) : false;

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              العودة
            </button>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleFavoriteToggle}
                disabled={loadingFavorites}
                className={`border-slate-600 text-white hover:bg-slate-600 ${
                  programIsFavorite ? 'bg-red-500/20 border-red-500/30' : 'bg-slate-700'
                } ${loadingFavorites ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loadingFavorites ? (
                  <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart className={`w-4 h-4 mr-2 ${programIsFavorite ? 'fill-red-400 text-red-400' : ''}`} />
                )}
                {programIsFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
              </Button>
              {program.ramz_link && (
                <Button
                  variant="outline"
                  onClick={() => window.open(program.ramz_link, '_blank')}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  الموقع الرسمي
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Program Header */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-2">{program.table_specialization}</h1>
                  <p className="text-lg text-gray-300 mb-1">{program.table_institution}</p>
                  <p className="text-sm text-gray-400">{program.university_name}</p>
                </div>
                {program.seven_percent === 'yes' && (
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium border border-yellow-500/30">
                    برنامج الـ 7%
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <MapPin className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">المنطقة</p>
                  <p className="text-sm text-white font-medium">{program.table_location}</p>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">الشعبة المطلوبة</p>
                  <p className="text-sm text-white font-medium">{program.bac_type_name}</p>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">رمز البرنامج</p>
                  <p className="text-sm text-white font-medium">{program.ramz_code}</p>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">مجال الدراسة</p>
                  <p className="text-sm text-white font-medium">{program.field_of_study}</p>
                </div>
              </div>
            </div>

            {/* Admission Criteria */}
            {program.table_criteria && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Award className="w-5 h-5 text-yellow-400 mr-2" />
                  معايير القبول
                </h2>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-gray-300 leading-relaxed">{program.table_criteria}</p>
                </div>
              </div>
            )}

            {/* Historical Scores Chart */}
            {historicalScores.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 text-cyan-400 mr-2" />
                  نقاط القطع التاريخية
                </h2>
                
                {/* Chart Visualization */}
                <div className="mb-6">
                  <div className="flex items-end space-x-2 h-40 bg-slate-700/20 rounded-lg p-4">
                    {historicalScores.map((item, index) => {
                      const maxScore = Math.max(...historicalScores.map(s => s.score));
                      const height = (item.score / maxScore) * 100;
                      return (
                        <div key={item.year} className="flex-1 flex flex-col items-center">
                          <div
                            className="bg-gradient-to-t from-cyan-500 to-blue-400 rounded-t min-w-[20px] transition-all duration-300 hover:opacity-80"
                            style={{ height: `${height}%` }}
                          ></div>
                          <div className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-center">
                            {item.year}
                          </div>
                          <div className="text-xs text-white font-medium">
                            {item.score}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scores Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-right text-gray-400 py-2">السنة</th>
                        <th className="text-right text-gray-400 py-2">نقطة القطع</th>
                        <th className="text-right text-gray-400 py-2">التغيير</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicalScores.map((item, index) => {
                        const previousScore = index > 0 ? historicalScores[index - 1].score : null;
                        const change = previousScore ? item.score - previousScore : 0;
                        return (
                          <tr key={item.year} className="border-b border-slate-700/50">
                            <td className="py-2 text-white">{item.year}</td>
                            <td className="py-2 text-cyan-400 font-medium">{item.score}</td>
                            <td className="py-2">
                              {change !== 0 && (
                                <span className={`flex items-center ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  <TrendingUp className={`w-3 h-3 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
                                  {Math.abs(change).toFixed(1)}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Score Statistics */}
            {latestScore && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
                  إحصائيات النقاط
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-gray-400">آخر نقطة قطع</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-cyan-400">{latestScore.score}</span>
                      <span className="text-xs text-gray-500 block">({latestScore.year})</span>
                    </div>
                  </div>
                  
                  {averageScore && (
                    <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-gray-400">المتوسط العام</span>
                      <span className="text-lg font-bold text-blue-400">{averageScore}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-gray-400">الاتجاه</span>
                    <div className="flex items-center">
                      {trend === 'increasing' && (
                        <span className="text-green-400 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          متزايد
                        </span>
                      )}
                      {trend === 'decreasing' && (
                        <span className="text-red-400 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
                          متناقص
                        </span>
                      )}
                      {trend === 'stable' && (
                        <span className="text-yellow-400">مستقر</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Related Programs */}
            {relatedPrograms.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Users className="w-5 h-5 text-purple-400 mr-2" />
                  برامج ذات صلة
                </h3>
                
                <div className="space-y-3">
                  {relatedPrograms.slice(0, 4).map((relatedProgram) => (
                    <div
                      key={relatedProgram.ramz_id}
                      onClick={() => router.push(`/guide/${relatedProgram.ramz_id}`)}
                      className="p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/40 transition-all duration-200"
                    >
                      <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">
                        {relatedProgram.table_specialization}
                      </h4>
                      <p className="text-xs text-gray-400">{relatedProgram.university_name}</p>
                      <p className="text-xs text-gray-500">{relatedProgram.table_location}</p>
                    </div>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/guide')}
                  className="w-full mt-4 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  عرض المزيد
                </Button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">إجراءات سريعة</h3>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/comparison')}
                  className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <Star className="w-4 h-4 mr-2" />
                  مقارنة مع برامج أخرى
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/chatbot')}
                  className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  استشارة المساعد الذكي
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  طباعة التفاصيل
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
