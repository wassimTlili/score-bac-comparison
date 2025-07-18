'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Heart, ExternalLink, MapPin, GraduationCap, Building2,
  TrendingUp, BarChart3, Award, Star, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import finaleData from '@/data/finale-data.json';
import {
  addToFavoritesByCode, removeFromFavoritesByCode, getUserFavoritesByCode
} from '@/actions/favorites-actions';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

// Chart.js imports
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function ProgramDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id: ramz_id } = params;
  const { isRedirecting, isReady, isSignedIn } = useAuthRedirect({
    requireAuth: false,
    requireProfile: false
  });

  const [program, setProgram] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
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
    // eslint-disable-next-line
  }, [ramz_id, isReady, isRedirecting]);

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

  const handleFavoriteToggle = async () => {
    if (!isSignedIn) {
      alert('يجب تسجيل الدخول لإضافة المفضلة');
      return;
    }
    const orientationCode = program?.ramz_code;
    if (!orientationCode) return;
    setLoadingFavorites(true);
    try {
      const isFavorite = favorites.includes(orientationCode);
      if (isFavorite) {
        const result = await removeFromFavoritesByCode(orientationCode);
        if (result.success) {
          setFavorites(prev => prev.filter(code => code !== orientationCode));
        }
      } else {
        const result = await addToFavoritesByCode(orientationCode);
        if (result.success) {
          setFavorites(prev => [...prev, orientationCode]);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Only get the last 5 years of scores, most recent first
  const getHistoricalScoresData = () => {
    if (!program?.historical_scores) return [];
    const years = Object.keys(program.historical_scores)
      .map(Number)
      .filter(year => year <= 2024)
      .sort((a, b) => b - a)
      .slice(0, 5)
      .reverse();
    return years.map(year => ({
      year,
      score: program.historical_scores[year.toString()]
    })).filter(item => item.score && item.score > 0);
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
    const firstScore = scores[0].score;
    const lastScore = scores[scores.length - 1].score;
    const difference = lastScore - firstScore;
    if (difference > 1) return 'increasing';
    if (difference < -1) return 'decreasing';
    return 'stable';
  };

  // Chart.js data and options
  const historicalScores = getHistoricalScoresData();
  const getChartData = () => ({
    labels: historicalScores.map(item => item.year),
    datasets: [
      {
        label: 'نقطة القطع',
        data: historicalScores.map(item => item.score),
        fill: false,
        borderColor: '#06b6d4',
        backgroundColor: '#06b6d4',
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#0ea5e9',
      }
    ]
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: context => ` ${context.parsed.y}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#334155' },
        ticks: { color: '#cbd5e1', font: { family: 'Tajawal' } }
      },
      y: {
        grid: { color: '#334155' },
        ticks: { color: '#cbd5e1', font: { family: 'Tajawal' } }
      }
    }
  };

  const latestScore = getLatestScore();
  const averageScore = getAverageScore();
  const trend = getScoreTrend();
  const programIsFavorite = program ? favorites.includes(program.ramz_code) : false;

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
                  نقاط القطع التاريخية (آخر 5 سنوات)
                </h2>
                {/* Chart.js Line Chart */}
                <div className="mb-6">
                  <Line data={getChartData()} options={chartOptions} />
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
                            <td className={`py-2 font-medium ${index === historicalScores.length - 1 ? 'text-cyan-400' : 'text-white'}`}>{item.score}</td>
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
            {/* Quick Actions (no imprimer/print) */}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}