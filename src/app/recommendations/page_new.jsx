'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Search, Star, TrendingUp, MapPin, Award, ChevronDown, X, ArrowLeft, Target, Zap, Heart } from 'lucide-react';
import finaleData from '@/data/finale-data.json';
import { Button } from '@/components/ui/button';
import FloatingNexie from '@/components/FloatingNexie';
import ChatSidebar from '@/components/ChatSidebar';
import { trackData, calculateMG, calculateFS, getScoreLevel } from '@/utils/calculations';
import { addToFavoritesByCode, removeFromFavoritesByCode, getUserFavoritesByCode } from '@/actions/favorites-actions';
import { getUserProfile } from '@/actions/profile-actions';
import { useAuthRedirect, RedirectLoadingScreen } from '@/hooks/useAuthRedirect';

export default function RecommendationsPage() {
  const router = useRouter();
  const { isRedirecting, isReady, userProfile, isSignedIn, user } = useAuthRedirect({
    requireAuth: true,
    requireProfile: true
  });

  const [userData, setUserData] = useState(null);
  const [scores, setScores] = useState({ mg: 0, fs: 0, scoreLevel: { color: '#gray', text: 'غير محدد' } });
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    location: '',
    university: '',
    specialization: '',
    scoreRange: 'all',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Load user data from userProfile (already available from useAuthRedirect)
    const loadUserData = async () => {
      if (userProfile) {
        try {
          // Use userProfile directly from the hook
          const dbProfile = userProfile;
          
          const userData = {
            filiere: dbProfile.filiere,
            notes: dbProfile.grades || {},
            birthday: new Date(dbProfile.birthDate),
            gender: dbProfile.gender,
            governorate: dbProfile.wilaya,
            session: dbProfile.session,
            finalScore: dbProfile.finalScore,
            mgScore: dbProfile.mgScore,
            fsScore: dbProfile.fsScore,
            wilaya: dbProfile.wilaya
          };
          setUserData(userData);
          
          // Use pre-calculated scores from database if available
          if (dbProfile.mgScore && dbProfile.fsScore) {
            setScores({
              mg: dbProfile.mgScore,
              fs: dbProfile.fsScore,
              scoreLevel: getScoreLevel(dbProfile.fsScore)
            });
          } else {
            // Fallback to calculating scores
            if (dbProfile.filiere && trackData[dbProfile.filiere] && dbProfile.grades) {
              const mappedGrades = mapGradesToCalculationFormat(dbProfile.grades, dbProfile.filiere);
              const track = { id: dbProfile.filiere, name: trackData[dbProfile.filiere].name };
              
              const mg = calculateMG(mappedGrades, track);
              const fs = calculateFS(mappedGrades, track, mg);
              const scoreLevel = getScoreLevel(fs);
              
              setScores({ mg, fs, scoreLevel });
            }
          }
        } catch (error) {
          console.error('❌ Error loading user profile:', error);
        }
      }
    };

    // Load user favorites
    const loadUserFavorites = async () => {
      try {
        const userFavorites = await getUserFavoritesByCode();
        if (userFavorites.success) {
          setFavorites(userFavorites.favorites.map(fav => fav.orientationCode));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    const loadAllData = async () => {
      if (isReady && !isRedirecting && userProfile) {
        setIsLoading(true);
        await loadUserData();
        await loadUserFavorites();
        setIsLoading(false);
      } else if (isReady && !isRedirecting) {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [isReady, isRedirecting, userProfile]);

  // Handle favorites toggle
  const handleFavoriteToggle = async (orientationCode) => {
    if (!isSignedIn) {
      alert('يجب تسجيل الدخول لإضافة المفضلة');
      return;
    }

    setLoadingFavorites(prev => ({ ...prev, [orientationCode]: true }));

    try {
      const isFavorite = favorites.includes(orientationCode);
      
      if (isFavorite) {
        const result = await removeFromFavoritesByCode(orientationCode);
        if (result.success) {
          setFavorites(prev => prev.filter(code => code !== orientationCode));
        } else {
          console.error('❌ Failed to remove from favorites:', result.error);
        }
      } else {
        const result = await addToFavoritesByCode(orientationCode);
        if (result.success) {
          setFavorites(prev => [...prev, orientationCode]);
        } else {
          console.error('❌ Failed to add to favorites:', result.error);
        }
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
    } finally {
      setLoadingFavorites(prev => ({ ...prev, [orientationCode]: false }));
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
    
    // Track-specific mappings with new field names
    switch (filiere) {
      case 'info':
        if (notes.algorithmics) mappedGrades.algo = parseFloat(notes.algorithmics);
        if (notes.management) mappedGrades.gestion = parseFloat(notes.management);
        if (notes.economics) mappedGrades.eco = parseFloat(notes.economics);
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

  // Get bac type mapping
  const getBacTypeFromFiliere = (filiere) => {
    const bacTypeMap = {
      math: "رياضيات",
      science: "علوم تجريبية", 
      info: "علوم الإعلامية",
      tech: "العلوم التقنية",
      eco: "إقتصاد وتصرف",
      lettres: "آداب",
      sport: "رياضة"
    };
    return bacTypeMap[filiere] || filiere;
  };

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    // Get all unique locations, universities, and specializations from the data
    const locations = [...new Set(finaleData.map(r => r.table_location))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'ar'));
    
    const universities = [...new Set(finaleData.map(r => r.university_name))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'ar'));
    
    const specializations = [...new Set(finaleData.map(r => r.table_specialization))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'ar'));

    return {
      locations,
      universities,
      specializations
    };
  }, []);

  // Filter recommendations based on user score and filters
  const filteredRecommendations = useMemo(() => {
    if (!userData) {
      return [];
    }

    const userBacType = getBacTypeFromFiliere(userData.filiere);
    const userScore = scores.fs || 0;

    const filtered = finaleData.filter(item => {
      // Must have 2024 score
      const score2024 = item.historical_scores?.["2024"];
      if (!score2024 || score2024 <= 0) return false;
      
      // Score range filters
      if (filters.scoreRange !== 'all') {
        if (filters.scoreRange === 'accessible' && userScore < score2024) return false;
        if (filters.scoreRange === 'stretch' && (userScore < score2024 - 10 || userScore > score2024 + 5)) return false;
        if (filters.scoreRange === 'safety' && userScore < score2024 + 10) return false;
      }
      
      // Location filter
      if (filters.location && item.table_location !== filters.location) return false;
      
      // University filter  
      if (filters.university && item.university_name !== filters.university) return false;
      
      // Specialization filter
      if (filters.specialization && item.table_specialization !== filters.specialization) return false;
      
      // Search filter
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        return (
          item.table_specialization?.toLowerCase().includes(searchTerm) ||
          item.university_name?.toLowerCase().includes(searchTerm) ||
          item.table_location?.toLowerCase().includes(searchTerm) ||
          item.ramz_code?.toLowerCase().includes(searchTerm)
        );
      }
      
      return true;
    }).map(item => {
      const score2024 = item.historical_scores?.["2024"] || 0;
      const scoreDifference = userScore - score2024;
      
      // Determine admission chance
      let admissionChance, chanceColor, chanceIcon;
      if (scoreDifference >= 15) {
        admissionChance = 'عالية جداً';
        chanceColor = 'text-green-400';
        chanceIcon = '🎯';
      } else if (scoreDifference >= 5) {
        admissionChance = 'عالية';
        chanceColor = 'text-green-400';
        chanceIcon = '✅';
      } else if (scoreDifference >= -5) {
        admissionChance = 'متوسطة';
        chanceColor = 'text-yellow-400';
        chanceIcon = '⚠️';
      } else if (scoreDifference >= -15) {
        admissionChance = 'منخفضة';
        chanceColor = 'text-orange-400';
        chanceIcon = '⚡';
      } else {
        admissionChance = 'صعبة جداً';
        chanceColor = 'text-red-400';
        chanceIcon = '🔥';
      }

      return {
        ...item,
        score2024,
        scoreDifference,
        admissionChance,
        chanceColor,
        chanceIcon
      };
    }).sort((a, b) => Math.abs(a.scoreDifference) - Math.abs(b.scoreDifference));
  }, [userData, scores, filters]);

  // Get recommendation category for styling
  const getRecommendationCategory = (item) => {
    const userScore = scores.fs || 0;
    if (userScore >= item.score2024) return 'accessible';
    if (userScore >= item.score2024 - 10) return 'stretch';
    return 'reach';
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'accessible': return 'border-green-500 bg-green-50/5';
      case 'stretch': return 'border-yellow-500 bg-yellow-50/5';
      case 'reach': return 'border-red-500 bg-red-50/5';
      default: return 'border-gray-500 bg-gray-50/5';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'accessible': return <Target className="w-5 h-5 text-green-400" />;
      case 'stretch': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'reach': return <TrendingUp className="w-5 h-5 text-red-400" />;
      default: return <Star className="w-5 h-5 text-gray-400" />;
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'accessible': return 'متاح لك';
      case 'stretch': return 'محتمل';
      case 'reach': return 'تحدي';
      default: return 'غير محدد';
    }
  };

  // Show loading while redirecting
  if (isRedirecting || !isReady) {
    return <RedirectLoadingScreen message="جاري التحقق من ملفك الشخصي..." />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-blue-400 animate-spin animation-delay-150"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">جاري تحميل التوصيات</h2>
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce animation-delay-400"></div>
            </div>
            <p className="text-gray-400 max-w-md mx-auto">
              نحن نحلل درجاتك ونجهز أفضل التوصيات الجامعية المناسبة لك
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mt-12 space-y-3">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Zap className="w-4 h-4 mr-2 text-cyan-400" />
              <span>تحليل الدرجات والمعطيات</span>
            </div>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
              <span>حساب المعدلات والنقاط</span>
            </div>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Award className="w-4 h-4 mr-2 text-purple-400" />
              <span>إعداد التوصيات المخصصة</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no user data, show message to complete stepper
  if (!userData) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            {/* Animated Icon */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20 animate-pulse"></div>
              <div className="absolute inset-4 rounded-full border-2 border-blue-400/30 animate-ping"></div>
              <div className="absolute inset-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-white animate-bounce" />
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              مرحبا بك في صفحة التوصيات
            </h1>
            <div className="max-w-2xl mx-auto space-y-4 mb-12">
              <p className="text-gray-300 text-xl leading-relaxed">
                للحصول على توصيات جامعية مخصصة بناءً على درجاتك ومعدلك
              </p>
              <p className="text-gray-400 text-lg">
                يجب إكمال إدخال الدرجات في ملفك الشخصي أولاً
              </p>
            </div>

            {/* Benefits Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">تحليل دقيق</h3>
                <p className="text-gray-400 text-sm">تحليل شامل لدرجاتك ومعدلك لتقديم أفضل الخيارات</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <Award className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">توصيات مخصصة</h3>
                <p className="text-gray-400 text-sm">اقتراحات جامعية تناسب قدراتك وأهدافك الأكاديمية</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <Heart className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">إدارة المفضلة</h3>
                <p className="text-gray-400 text-sm">احفظ واتبع التخصصات التي تهتم بها</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/stepper')}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-10 py-4 text-lg rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Target className="w-5 h-5 mr-2" />
                إنشاء ملف شخصي جديد
              </Button>
              {isSignedIn && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-700/50 px-10 py-4 text-lg rounded-xl font-semibold transition-all duration-200"
                >
                  <Search className="w-5 h-5 mr-2" />
                  إعادة تحميل البيانات
                </Button>
              )}
            </div>
          </div>
        </div>
        <FloatingNexie
          currentStep={1}
          isVisible={true}
          showChatPrompt={true}
          onChatOpen={() => setIsChatOpen(true)}
        />
        <ChatSidebar
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          userData={{
            mg: scores.mg,
            fs: scores.fs,
            wilaya: userData?.wilaya,
            filiere: userData?.filiere,
            context: 'recommendations'
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                التوصيات المخصصة لك
              </h1>
              {userData && (
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    معدل: {scores.mg ? scores.mg.toFixed(2) : '0.00'}/20
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    نقطة: {scores.fs ? scores.fs.toFixed(2) : '0.00'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {userData?.wilaya || 'غير محدد'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    شعبة: {userData?.filiere || 'غير محدد'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Filter className="w-4 h-4 mr-2" />
                فلترة
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                رجوع
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Rest of the component... continuing with filters and content */}
      {showFilters && (
        <div className="bg-slate-800/50 border-b border-slate-700 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في التخصصات..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Score Range */}
              <select
                value={filters.scoreRange}
                onChange={(e) => setFilters(prev => ({ ...prev, scoreRange: e.target.value }))}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">جميع النتائج</option>
                <option value="accessible">متاح (معدلك كافي)</option>
                <option value="stretch">محتمل (قريب من معدلك)</option>
                <option value="safety">آمن (أقل من معدلك)</option>
              </select>

              {/* Location Filter */}
              <select
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">كل المناطق ({filterOptions.locations.length})</option>
                {filterOptions.locations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>

              {/* University Filter */}
              <select
                value={filters.university}
                onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">كل الجامعات ({filterOptions.universities.length})</option>
                {filterOptions.universities.map(uni => (
                  <option key={uni} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>

              {/* Specialization Filter */}
              <select
                value={filters.specialization}
                onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">كل التخصصات ({filterOptions.specializations.length})</option>
                {filterOptions.specializations.map(spec => (
                  <option key={spec} value={spec} title={spec}>
                    {spec.length > 50 ? spec.substring(0, 47) + '...' : spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ location: '', university: '', specialization: '', scoreRange: 'all', searchTerm: '' })}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <X className="w-4 h-4 mr-2" />
                مسح الفلاتر
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">متاح لك</p>
                <p className="text-2xl font-bold text-green-400">
                  {filteredRecommendations.filter(item => getRecommendationCategory(item) === 'accessible').length}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm">محتمل</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {filteredRecommendations.filter(item => getRecommendationCategory(item) === 'stretch').length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm">تحدي</p>
                <p className="text-2xl font-bold text-red-400">
                  {filteredRecommendations.filter(item => getRecommendationCategory(item) === 'reach').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((item, index) => {
            const category = getRecommendationCategory(item);
            const isFavorite = favorites.includes(item.ramz_code);
            const isLoadingFav = loadingFavorites[item.ramz_code];
            
            return (
              <div
                key={item.ramz_id}
                className={`bg-slate-800/50 border-l-4 ${getCategoryStyle(category)} rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 relative group`}
              >
                {/* Favorites Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteToggle(item.ramz_code);
                  }}
                  disabled={isLoadingFav}
                  className={`absolute top-4 left-4 p-2 rounded-full transition-all duration-200 ${
                    isFavorite 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-red-400'
                  } ${isLoadingFav ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoadingFav ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  ) : (
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  )}
                </button>

                <div 
                  className="cursor-pointer"
                  onClick={() => {
                    // Store selected orientation for comparison
                    const orientationData = {
                      id: item.ramz_code,
                      name: item.table_specialization,
                      university: item.university_name,
                      location: item.table_location,
                      institution: item.table_institution,
                      score2024: item.score2024,
                      historical_scores: item.historical_scores,
                      bac_type_name: item.bac_type_name,
                      code: item.ramz_code,
                      field_of_study: item.field_of_study
                    };
                    localStorage.setItem('selectedOrientation', JSON.stringify(orientationData));
                    router.push('/comparison/tool');
                  }}
                >
                  <div className="flex items-start justify-between mb-4 mt-8">
                    <div className="flex items-center space-x-2 flex-1 pr-12">
                      {getCategoryIcon(category)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg leading-tight mb-1">
                          {item.table_specialization}
                        </h3>
                        <p className="text-sm text-gray-300 mb-1">{item.table_institution}</p>
                        <p className="text-xs text-gray-400">{item.university_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#1581f3]">
                        {item.score2024}
                      </div>
                      <div className="text-xs text-gray-400">2024</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">المنطقة:</span>
                      <span className="text-white">{item.table_location}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">الكود:</span>
                      <span className="text-white">{item.ramz_code}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">فرص القبول:</span>
                      <span className={`font-medium ${item.chanceColor}`}>
                        {item.chanceIcon} {item.admissionChance}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">الفارق من معدلك:</span>
                      <span className={`font-medium ${item.scoreDifference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {item.scoreDifference >= 0 ? '+' : ''}{item.scoreDifference.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      category === 'accessible' ? 'bg-green-500/20 text-green-400' :
                      category === 'stretch' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {getCategoryText(category)}
                    </span>
                    
                    {/* Match Percentage */}
                    <div className="text-right">
                      <div className="text-sm text-gray-400">نسبة التطابق</div>
                      <div className="text-lg font-bold text-cyan-400">
                        {category === 'accessible' ? '95%' : 
                         category === 'stretch' ? '75%' : '50%'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredRecommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">لا توجد نتائج</h3>
            <p className="text-gray-400 mb-6">جرب تغيير المرشحات أو معايير البحث</p>
            <Button
              onClick={() => setFilters({ location: '', university: '', specialization: '', scoreRange: 'all', searchTerm: '' })}
              className="bg-[#1581f3] hover:bg-blue-600 text-white"
            >
              إعادة تعيين المرشحات
            </Button>
          </div>
        )}
      </div>

      {/* FloatingNexie */}
      <FloatingNexie
        currentStep={1}
        isVisible={true}
        showChatPrompt={true}
        onChatOpen={() => setIsChatOpen(true)}
      />
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userData={{
          mg: scores.mg,
          fs: scores.fs,
          wilaya: userData?.wilaya,
          filiere: userData?.filiere,
          context: 'recommendations'
        }}
      />
    </div>
  );
}
