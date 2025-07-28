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
  const [isChatOpen, setIsChatOpen] = useState(false);
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

  const filterOptions = useMemo(() => {
    const locations = [...new Set(finaleData.map(r => r.table_location))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'ar'));
    const universities = [...new Set(finaleData.map(r => r.university_name))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'ar'));
    const specializations = [...new Set(finaleData.map(r => r.table_specialization))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'ar'));
    return { locations, universities, specializations };
  }, []);

  const filteredRecommendations = useMemo(() => {
    if (!userData) return [];

    const userScore = scores.fs || 0;
    return finaleData.filter(item => {
      const score2024 = item.historical_scores?.["2024"];
      if (!score2024 || score2024 <= 0) return false;
      
      if (filters.scoreRange !== 'all') {
        if (filters.scoreRange === 'accessible' && userScore < score2024) return false;
        if (filters.scoreRange === 'stretch' && (userScore < score2024 - 10 || userScore > score2024 + 5)) return false;
        if (filters.scoreRange === 'safety' && userScore < score2024 + 10) return false;
      }
      
      if (filters.location && item.table_location !== filters.location) return false;
      if (filters.university && item.university_name !== filters.university) return false;
      if (filters.specialization && item.table_specialization !== filters.specialization) return false;
      
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
      
      let admissionChance, chanceColor, chanceIcon;
      if (scoreDifference >= 15) {
        admissionChance = t('recommendations.veryHigh'); chanceColor = 'text-green-400'; chanceIcon = '🎯';
      } else if (scoreDifference >= 5) {
        admissionChance = t('recommendations.high'); chanceColor = 'text-green-400'; chanceIcon = '✅';
      } else if (scoreDifference >= -5) {
        admissionChance = t('recommendations.average'); chanceColor = 'text-yellow-400'; chanceIcon = '⚠️';
      } else if (scoreDifference >= -15) {
        admissionChance = t('recommendations.low'); chanceColor = 'text-orange-400'; chanceIcon = '⚡';
      } else {
        admissionChance = t('recommendations.veryDifficult'); chanceColor = 'text-red-400'; chanceIcon = '🔥';
      }

      return { ...item, score2024, scoreDifference, admissionChance, chanceColor, chanceIcon };
    }).sort((a, b) => Math.abs(a.scoreDifference) - Math.abs(b.scoreDifference));
  }, [userData, scores, filters, t]);

  const getRecommendationCategory = (item) => {
    const userScore = scores.fs || 0;
    if (userScore >= item.score2024) return 'accessible';
    if (userScore >= item.score2024 - 10) return 'stretch';
    return 'reach';
  };

  const getCategoryStyle = (category) => ({
    'accessible': 'border-green-500 bg-green-50/5',
    'stretch': 'border-yellow-500 bg-yellow-50/5',
    'reach': 'border-red-500 bg-red-50/5'
  }[category] || 'border-gray-500 bg-gray-50/5');

  const getCategoryIcon = (category) => ({
    'accessible': <Target className="w-5 h-5 text-green-400" />,
    'stretch': <Zap className="w-5 h-5 text-yellow-400" />,
    'reach': <TrendingUp className="w-5 h-5 text-red-400" />
  }[category] || <Star className="w-5 h-5 text-gray-400" />);

  const getCategoryText = (category) => ({
    'accessible': t('recommendations.accessible'),
    'stretch': t('recommendations.stretch'),
    'reach': t('recommendations.reach')
  }[category] || t('recommendations.notSpecified'));

  if (isRedirecting || !isReady) return <RedirectLoadingScreen message={t('recommendations.checkingProfile')} />;

  if (isLoading) return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-50 animate-ping"></div>
          <div className="absolute inset-2 bg-slate-800 rounded-full"></div>
          <div className="absolute inset-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">{t('recommendations.loadingRecommendations')}</h2>
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
            {[...Array(3)].map((_, i) => <div key={i} className={`w-2 h-2 bg-cyan-400 rounded-full animate-bounce animation-delay-${i * 200}`}></div>)}
          </div>
          <p className="text-gray-400 max-w-md mx-auto">{t('recommendations.analyzingData')}</p>
        </div>
        <div className="mt-12 space-y-3">
          <div className="flex items-center justify-center text-sm text-gray-500"><Zap className="w-4 h-4 mr-2 text-cyan-400" /><span>{t('recommendations.analyzingGrades')}</span></div>
          <div className="flex items-center justify-center text-sm text-gray-500"><TrendingUp className="w-4 h-4 mr-2 text-blue-400" /><span>{t('recommendations.calculatingScores')}</span></div>
          <div className="flex items-center justify-center text-sm text-gray-500"><Award className="w-4 h-4 mr-2 text-purple-400" /><span>{t('recommendations.preparingCustomRecs')}</span></div>
        </div>
      </div>
    </div>
  );

  if (!userData) return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-50 animate-ping"></div>
            <div className="absolute inset-4 bg-slate-800 rounded-full"></div>
            <div className="absolute inset-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-white animate-bounce" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{t('recommendations.welcomeToRecommendations')}</h1>
          <div className="max-w-2xl mx-auto space-y-4 mb-12">
            <p className="text-gray-300 text-xl leading-relaxed">{t('recommendations.getCustomRecs')}</p>
            <p className="text-gray-400 text-lg">{t('recommendations.completeProfileFirst')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{t('recommendations.detailedAnalysis')}</h3>
              <p className="text-gray-400 text-sm">{t('recommendations.comprehensiveAnalysis')}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <Award className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{t('recommendations.customRecommendations')}</h3>
              <p className="text-gray-400 text-sm">{t('recommendations.universitySuggestions')}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <Heart className="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{t('recommendations.manageFavorites')}</h3>
              <p className="text-gray-400 text-sm">{t('recommendations.saveAndFollow')}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.push('/stepper')} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-10 py-4 text-lg rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200">
              <Target className="w-5 h-5 mr-2" />{t('recommendations.createNewProfile')}
            </Button>
            {isSignedIn && (
              <Button onClick={() => window.location.reload()} variant="outline" className="border-slate-600 text-white hover:bg-slate-700/50 px-10 py-4 text-lg rounded-xl font-semibold transition-all duration-200">
                <Search className="w-5 h-5 mr-2" />{t('recommendations.reloadData')}
              </Button>
            )}
          </div>
        </div>
        </div>
        <FloatingNexie onChatToggle={setIsChatOpen} />
      </div>
    );  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100">
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{t('recommendations.yourCustomRecommendations')}</h1>
              {userData && (
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
                  <span className="flex items-center gap-1"><Star className="w-4 h-4" />{t('recommendations.averageGrade')}: {scores.mg ? scores.mg.toFixed(2) : '0.00'}/20</span>
                  <span className="flex items-center gap-1"><Award className="w-4 h-4" />{t('recommendations.points')}: {scores.fs ? scores.fs.toFixed(2) : '0.00'}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{userData?.wilaya || t('recommendations.notSpecified')}</span>
                  <span className="flex items-center gap-1"><Target className="w-4 h-4" />{t('recommendations.branch')}: {userData?.filiere ? getBacTypeFromFiliere(userData.filiere) : t('recommendations.notSpecified')}</span>
                </div>
              )}
            </div>
            <div className="mt-4 sm:mt-0">
              <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="border-slate-600 text-white hover:bg-slate-700/50">
                <Filter className="w-4 h-4 mr-2" />{showFilters ? t('recommendations.hideFilters') : t('recommendations.showFilters')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showFilters && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2"><Search className="w-4 h-4 inline-block mr-1" />{t('recommendations.searchByNameOrCode')}</label>
                <input type="text" id="search" value={filters.searchTerm} onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder={t('recommendations.searchByNameOrCode')} />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2"><MapPin className="w-4 h-4 inline-block mr-1" />{t('recommendations.filterByLocation')}</label>
                <select id="location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option value="">{t('recommendations.allLocations')}</option>
                  {filterOptions.locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-300 mb-2"><Award className="w-4 h-4 inline-block mr-1" />{t('recommendations.filterByUniversity')}</label>
                <select id="university" value={filters.university} onChange={(e) => setFilters({ ...filters, university: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option value="">{t('recommendations.allUniversities')}</option>
                  {filterOptions.universities.map(uni => <option key={uni} value={uni}>{uni}</option>)}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-300 mb-2"><Star className="w-4 h-4 inline-block mr-1" />{t('recommendations.filterBySpecialization')}</label>
                <select id="specialization" value={filters.specialization} onChange={(e) => setFilters({ ...filters, specialization: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option value="">{t('recommendations.allSpecializations')}</option>
                  {filterOptions.specializations.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="scoreRange" className="block text-sm font-medium text-gray-300 mb-2"><TrendingUp className="w-4 h-4 inline-block mr-1" />{t('recommendations.filterByScore')}</label>
                <select id="scoreRange" value={filters.scoreRange} onChange={(e) => setFilters({ ...filters, scoreRange: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option value="all">{t('recommendations.all')}</option>
                  <option value="accessible">{t('recommendations.accessible')}</option>
                  <option value="stretch">{t('recommendations.stretch')}</option>
                  <option value="safety">{t('recommendations.reach')}</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={() => setFilters({ location: '', university: '', specialization: '', scoreRange: 'all', searchTerm: '' })} variant="ghost" className="w-full text-white hover:bg-slate-700">
                  <X className="w-4 h-4 mr-2" />{t('recommendations.resetFilters')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {filteredRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((item) => {
              const category = getRecommendationCategory(item);
              const isFavorite = favorites.includes(item.ramz_code);
              const isLoadingFavorite = loadingFavorites[item.ramz_code];

              return (
                <div key={item.ramz_code} className={`bg-slate-800/50 border rounded-lg shadow-lg transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-500/50 ${getCategoryStyle(category)}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {getCategoryIcon(category)}
                          <span className="ml-2 text-sm font-semibold">{getCategoryText(category)}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">{item.table_specialization}</h3>
                        <p className="text-sm text-gray-400">{item.university_name}</p>
                      </div>
                      <Button onClick={() => handleFavoriteToggle(item.ramz_code)} variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" disabled={isLoadingFavorite}>
                        {isLoadingFavorite ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : ''}`} />}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-slate-700/50 px-6 py-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center"><p className="text-gray-400">{t('recommendations.score2024')}</p><p className="font-bold text-white">{item.score2024}</p></div>
                      <div className="text-center"><p className="text-gray-400">{t('recommendations.yourScore')}</p><p className="font-bold text-white">{scores.fs.toFixed(2)}</p></div>
                      <div className="text-center"><p className="text-gray-400">{t('recommendations.difference')}</p><p className={`font-bold ${item.scoreDifference >= 0 ? 'text-green-400' : 'text-red-400'}`}>{item.scoreDifference.toFixed(2)}</p></div>
                      <div className="text-center"><p className="text-gray-400">{t('recommendations.admissionChance')}</p><p className={`font-bold ${item.chanceColor}`}>{item.admissionChance}</p></div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/50 flex justify-end">
                    <Button onClick={() => { localStorage.setItem('selectedOrientation', JSON.stringify(item)); router.push('/comparison/tool'); }} variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-500/10">
                      {t('recommendations.compare')} <ArrowLeft className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{t('recommendations.noMatchingRecommendations')}</h3>
            <p className="text-gray-400 mb-6">{t('recommendations.tryAdjustingFilters')}</p>
            <Button onClick={() => setFilters({ location: '', university: '', specialization: '', scoreRange: 'all', searchTerm: '' })} className="bg-cyan-500 hover:bg-cyan-600 text-white">
              {t('recommendations.showAllRecommendations')}
            </Button>
          </div>
        )}
      </div>
      
      <FloatingNexie onChatToggle={setIsChatOpen} />
    </div>
  );
}
