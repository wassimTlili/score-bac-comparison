'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Heart, X, Move, AlertCircle, CheckCircle, 
  Target, BarChart3, TrendingUp, ArrowLeft, Loader2,
  GraduationCap, MapPin, Building2, Award, Users, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import finaleData from '@/data/finale-data.json';
import { addToFavoritesByCode, removeFromFavoritesByCode, getUserFavoritesByCode } from '@/actions/favorites-actions';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { getUserProfile } from '@/actions/profile-actions';
import { trackData, calculateMG, calculateFS, getScoreLevel } from '@/utils/calculations';
import FloatingNexie from '@/components/FloatingNexie';

// Main orientation page component
function OrientationPageContent() {
  const router = useRouter();
  const { isRedirecting, isReady, userProfile, isSignedIn, user } = useAuthRedirect({
    requireAuth: true,
    requireProfile: true
  });

  // State management
  const [userData, setUserData] = useState(null);
  const [userChoices, setUserChoices] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loadingFavorites, setLoadingFavorites] = useState({});

  // Input states
  const [showAddChoice, setShowAddChoice] = useState(false);
  const [inputMethod, setInputMethod] = useState('search'); // 'search', 'code', 'favorites'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      if (isReady && !isRedirecting && userProfile) {
        setIsLoading(true);
        await loadUserData();
        await loadUserFavorites();
        await loadAvailablePrograms();
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [isReady, isRedirecting, userProfile]);

  // Load user data and calculate scores
  const loadUserData = async () => {
    if (!userProfile) return;

    try {
      const userData = {
        filiere: userProfile.filiere,
        notes: userProfile.grades || {},
        birthday: new Date(userProfile.birthDate),
        gender: userProfile.gender,
        governorate: userProfile.wilaya,
        session: userProfile.session,
        finalScore: userProfile.finalScore,
        mgScore: userProfile.mgScore,
        fsScore: userProfile.fsScore,
        wilaya: userProfile.wilaya
      };
      
      setUserData(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
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

  // Load available programs based on user's bac type
  const loadAvailablePrograms = async () => {
    if (!userProfile) return;

    try {
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

      const userBacType = getBacTypeFromFiliere(userProfile.filiere);
      
      const validPrograms = finaleData
        .filter(program => 
          program.ramz_code && 
          program.table_specialization && 
          program.university_name &&
          program.bac_type_name === userBacType &&
          program.historical_scores?.['2024'] > 0
        )
        .map(program => ({
          ramz_code: program.ramz_code,
          ramz_id: program.ramz_id,
          name: program.table_specialization,
          institution: program.table_institution,
          university: program.university_name,
          location: program.table_location,
          score2024: program.historical_scores?.['2024'] || 0,
          score2023: program.historical_scores?.['2023'] || 0,
          score2022: program.historical_scores?.['2022'] || 0,
          historical_scores: program.historical_scores,
          seven_percent: program.seven_percent,
          field_of_study: program.field_of_study,
          bac_type_name: program.bac_type_name
        }));

      setAvailablePrograms(validPrograms);
    } catch (error) {
      console.error('Error loading available programs:', error);
    }
  };

  // Search programs
  useEffect(() => {
    if (searchTerm.trim() && inputMethod === 'search') {
      const results = availablePrograms
        .filter(program =>
          program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          program.institution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          program.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
          program.location?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 10);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, availablePrograms, inputMethod]);

  // Add choice to list
  const addChoice = (program) => {
    if (userChoices.length >= 10) {
      alert('لا يمكن إضافة أكثر من 10 اختيارات');
      return;
    }

    if (userChoices.some(choice => choice.ramz_code === program.ramz_code)) {
      alert('هذا البرنامج موجود بالفعل في قائمة اختياراتك');
      return;
    }

    const newChoice = {
      rank: userChoices.length + 1,
      ramz_code: program.ramz_code,
      ramz_id: program.ramz_id,
      name: program.name,
      institution: program.institution,
      university: program.university,
      location: program.location,
      acceptanceRate: calculateAcceptanceRate(program),
      userWeight: 10,
      score2024: program.score2024,
      historical_scores: program.historical_scores
    };

    setUserChoices([...userChoices, newChoice]);
    setShowAddChoice(false);
    setSearchTerm('');
    setCodeInput('');
    setSelectedProgram(null);
  };

  // Calculate acceptance rate based on user score and program requirements
  const calculateAcceptanceRate = (program) => {
    if (!userData || !program.score2024) return 0;
    
    const userScore = userData.fsScore || userData.finalScore || 0;
    const programScore = program.score2024;
    
    if (userScore >= programScore + 2) return 95;
    if (userScore >= programScore + 1) return 85;
    if (userScore >= programScore) return 75;
    if (userScore >= programScore - 1) return 50;
    if (userScore >= programScore - 2) return 25;
    return 10;
  };

  // Remove choice
  const removeChoice = (ramz_code) => {
    const updatedChoices = userChoices
      .filter(choice => choice.ramz_code !== ramz_code)
      .map((choice, index) => ({ ...choice, rank: index + 1 }));
    setUserChoices(updatedChoices);
  };

  // Move choice up/down
  const moveChoice = (index, direction) => {
    const newChoices = [...userChoices];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newChoices.length) {
      [newChoices[index], newChoices[targetIndex]] = [newChoices[targetIndex], newChoices[index]];
      // Update ranks
      newChoices.forEach((choice, idx) => {
        choice.rank = idx + 1;
      });
      setUserChoices(newChoices);
    }
  };

  // Get latest score from historical data
  const getLatestScore = (historical_scores) => {
    if (!historical_scores) return null;
    
    // Check years from 2024 backwards
    for (let year = 2024; year >= 2015; year--) {
      const score = historical_scores[year.toString()];
      if (score && score > 0) {
        return { score, year };
      }
    }
    return null;
  };

  // Handle code input
  const handleCodeInput = () => {
    const program = availablePrograms.find(p => p.ramz_code === codeInput.trim());
    if (program) {
      addChoice(program);
    } else {
      alert('لم يتم العثور على برنامج بهذا الرمز');
    }
  };

  // Handle AI Analysis
  const handleAnalyzeChoices = async () => {
    if (userChoices.length < 6) {
      alert('يجب إضافة 6 اختيارات على الأقل لإجراء التحليل');
      return;
    }

    if (!userData || (!userData.fsScore && !userData.finalScore)) {
      alert('يجب إكمال بيانات الملف الشخصي أولاً لإجراء التحليل');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Use the most appropriate score for analysis
      const userGpa = userData.fsScore || userData.finalScore || userData.mgScore || 0;
      
      if (userGpa < 60) {
        alert('المعدل منخفض جداً لإجراء تحليل دقيق. يرجى التأكد من صحة البيانات.');
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch('/api/orientation/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userChoices: userChoices.map(choice => ({
            ...choice,
            acceptanceRate: calculateAcceptanceRate(choice),
            lastYearScore: getLatestScore(choice.historical_scores)?.score || 0
          })),
          userGpa,
          userProfile: userData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل في تحليل الاختيارات');
      }

      const result = await response.json();
      if (result.success) {
        setAnalysisResults(result.analysis);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error analyzing choices:', error);
      alert('حدث خطأ أثناء تحليل الاختيارات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      setLoadingFavorites(prev => ({ ...prev, [orientationCode]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-purple-400/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-3 border-transparent border-t-blue-400 animate-spin" style={{ animationDirection: 'reverse' }}></div>
            <div className="absolute inset-6 bg-gradient-to-br from-purple-400 via-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">جاري تحميل بيانات التوجيه</h2>
          <p className="text-gray-400">تحضير اختياراتك الجامعية...</p>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                العودة
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">جدول الاختيارات التوجيه</h1>
                <p className="text-gray-400">اختر 6-10 برامج واحصل على تحليل ذكي لزيادة فرص قبولك</p>
              </div>
            </div>
            
            {userChoices.length >= 6 && (
              <Button
                onClick={handleAnalyzeChoices}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 py-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    تحليل الاختيارات
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Choice Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Choice Input Section */}
            <ChoiceInputSection
              userChoices={userChoices}
              showAddChoice={showAddChoice}
              setShowAddChoice={setShowAddChoice}
              inputMethod={inputMethod}
              setInputMethod={setInputMethod}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              codeInput={codeInput}
              setCodeInput={setCodeInput}
              searchResults={searchResults}
              availablePrograms={availablePrograms}
              favorites={favorites}
              onAddChoice={addChoice}
              onRemoveChoice={removeChoice}
              onMoveChoice={moveChoice}
              onCodeInput={handleCodeInput}
              onFavoriteToggle={handleFavoriteToggle}
              loadingFavorites={loadingFavorites}
            />
          </div>

          {/* Right Column - Analysis Results */}
          <div className="space-y-6">
            {analysisResults ? (
              <AnalysisResults analysis={analysisResults} />
            ) : (
              <AnalysisPlaceholder choicesCount={userChoices.length} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Choice Input Section Component
function ChoiceInputSection({
  userChoices,
  showAddChoice,
  setShowAddChoice,
  inputMethod,
  setInputMethod,
  searchTerm,
  setSearchTerm,
  codeInput,
  setCodeInput,
  searchResults,
  availablePrograms,
  favorites,
  onAddChoice,
  onRemoveChoice,
  onMoveChoice,
  onCodeInput,
  onFavoriteToggle,
  loadingFavorites
}) {
  const favoritePrograms = availablePrograms.filter(program => 
    favorites.includes(program.ramz_code)
  );

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">جدول الاختيارات التوجيه</h2>
          <div className="text-sm text-purple-100">
            {userChoices.length}/10 اختيارات
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Guidance Message */}
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">نصيحة هامة للتوجيه الجامعي:</p>
              <p>يجب إضافة على الأقل <span className="font-bold text-blue-300">6 اختيارات</span> وبحد أقصى <span className="font-bold text-blue-300">10 اختيارات</span> للحصول على التحليل الذكي المكتمل من الذكاء الاصطناعي</p>
            </div>
          </div>
        </div>

        {/* Add Choice Button */}
        {userChoices.length < 10 && (
          <div className="mb-6">
            <Button
              onClick={() => setShowAddChoice(true)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              إضافة اختيار جديد
            </Button>
          </div>
        )}

        {/* Add Choice Modal */}
        {showAddChoice && (
          <AddChoiceModal
            inputMethod={inputMethod}
            setInputMethod={setInputMethod}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            codeInput={codeInput}
            setCodeInput={setCodeInput}
            searchResults={searchResults}
            favoritePrograms={favoritePrograms}
            onAddChoice={onAddChoice}
            onClose={() => setShowAddChoice(false)}
            onCodeInput={onCodeInput}
            onFavoriteToggle={onFavoriteToggle}
            loadingFavorites={loadingFavorites}
            favorites={favorites}
          />
        )}

        {/* Choices List */}
        <div className="space-y-3">
          {userChoices.map((choice, index) => (
            <ChoiceCard
              key={choice.ramz_code}
              choice={choice}
              index={index}
              totalChoices={userChoices.length}
              onRemove={() => onRemoveChoice(choice.ramz_code)}
              onMoveUp={() => onMoveChoice(index, 'up')}
              onMoveDown={() => onMoveChoice(index, 'down')}
            />
          ))}
        </div>

        {/* Empty State */}
        {userChoices.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">لم تضف أي اختيارات بعد</h3>
            <p className="text-gray-500 mb-6">ابدأ بإضافة اختياراتك الجامعية للحصول على التحليل الذكي</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Analysis Placeholder Component  
function AnalysisPlaceholder({ choicesCount }) {
  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <BarChart3 className="w-8 h-8 text-purple-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">التحليل الذكي</h3>
      <p className="text-gray-400 text-sm mb-4">
        أضف {Math.max(0, 6 - choicesCount)} اختيار{choicesCount < 5 ? 'ات' : ''} إضافية للحصول على التحليل
      </p>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, (choicesCount / 6) * 100)}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{choicesCount}/6</p>
    </div>
  );
}

// Add Choice Modal Component
function AddChoiceModal({
  inputMethod,
  setInputMethod,
  searchTerm,
  setSearchTerm,
  codeInput,
  setCodeInput,
  searchResults,
  favoritePrograms,
  onAddChoice,
  onClose,
  onCodeInput,
  onFavoriteToggle,
  loadingFavorites,
  favorites
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">إضافة اختيار جديد</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Input Method Tabs */}
          <div className="flex space-x-1 mb-6 bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setInputMethod('search')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                inputMethod === 'search'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              بحث
            </button>
            <button
              onClick={() => setInputMethod('code')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                inputMethod === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              رمز البرنامج
            </button>
            <button
              onClick={() => setInputMethod('favorites')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                inputMethod === 'favorites'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              المفضلة
            </button>
          </div>

          {/* Search Input */}
          {inputMethod === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن البرنامج أو الجامعة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((program) => (
                    <ProgramOption
                      key={program.ramz_code}
                      program={program}
                      onSelect={() => onAddChoice(program)}
                      onFavoriteToggle={() => onFavoriteToggle(program.ramz_code)}
                      isFavorite={favorites.includes(program.ramz_code)}
                      loadingFavorite={loadingFavorites[program.ramz_code]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Code Input */}
          {inputMethod === 'code' && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="أدخل رمز البرنامج..."
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <Button
                  onClick={onCodeInput}
                  disabled={!codeInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  إضافة
                </Button>
              </div>
            </div>
          )}

          {/* Favorites */}
          {inputMethod === 'favorites' && (
            <div className="space-y-4">
              {favoritePrograms.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {favoritePrograms.map((program) => (
                    <ProgramOption
                      key={program.ramz_code}
                      program={program}
                      onSelect={() => onAddChoice(program)}
                      onFavoriteToggle={() => onFavoriteToggle(program.ramz_code)}
                      isFavorite={true}
                      loadingFavorite={loadingFavorites[program.ramz_code]}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">لا توجد برامج في المفضلة</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Program Option Component
function ProgramOption({ program, onSelect, onFavoriteToggle, isFavorite, loadingFavorite }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
      <div className="flex-1 cursor-pointer" onClick={onSelect}>
        <h4 className="font-medium text-white">{program.name}</h4>
        <p className="text-sm text-gray-400">{program.institution}</p>
        <p className="text-xs text-gray-500">{program.university} • {program.location}</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
          {program.ramz_code}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          disabled={loadingFavorite}
          className={`p-2 rounded-lg transition-colors ${
            isFavorite
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-red-400'
          } ${loadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loadingFavorite ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          )}
        </button>
      </div>
    </div>
  );
}

// Choice Card Component
function ChoiceCard({ choice, index, totalChoices, onRemove, onMoveUp, onMoveDown }) {
  const getAcceptanceColor = (rate) => {
    if (rate >= 85) return 'text-green-400 bg-green-400/20';
    if (rate >= 70) return 'text-yellow-400 bg-yellow-400/20';
    if (rate >= 50) return 'text-orange-400 bg-orange-400/20';
    return 'text-red-400 bg-red-400/20';
  };

  const getAcceptanceLabel = (rate) => {
    if (rate >= 85) return 'ممتاز';
    if (rate >= 70) return 'جيد';
    if (rate >= 50) return 'متوسط';
    return 'ضعيف';
  };

  return (
    <div className="flex items-center space-x-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500 transition-colors">
      {/* Rank Circle */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {choice.rank}
        </div>
      </div>

      {/* Program Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white truncate">{choice.name}</h4>
        <p className="text-sm text-gray-400 truncate">{choice.institution}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-gray-500">{choice.university}</span>
          <span className="text-xs text-gray-600">•</span>
          <span className="text-xs text-gray-500">{choice.location}</span>
        </div>
      </div>

      {/* Acceptance Rate */}
      <div className="flex-shrink-0 text-center">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getAcceptanceColor(choice.acceptanceRate)}`}>
          {choice.acceptanceRate}%
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {getAcceptanceLabel(choice.acceptanceRate)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center space-x-1">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Move className="w-4 h-4 transform rotate-180" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === totalChoices - 1}
          className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Move className="w-4 h-4" />
        </button>
        <button
          onClick={onRemove}
          className="p-1 text-red-400 hover:text-red-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Analysis Results Component
function AnalysisResults({ analysis }) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isMostProbableExpanded, setIsMostProbableExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'details', label: 'التفاصيل', icon: '📋' },
    { id: 'recommendations', label: 'التوصيات', icon: '💡' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-1 backdrop-blur-sm">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-[1.02] ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/25 scale-[1.02]'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Overall Success Rate */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400 mb-3 drop-shadow-lg">
                  {analysis.overallAcceptanceRate}%
                </div>
                <div className="text-green-300 font-semibold mb-2 text-lg">
                  نسبة القبول المتوقعة الإجمالية
                </div>
                <div className="text-sm text-green-200 bg-green-500/20 rounded-full px-4 py-2 inline-block">
                  بناءً على معدلك واختياراتك الحالية
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Description - Collapsible */}
          {analysis.analysisDescription && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-700/30 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-white">التحليل الشامل لاستراتيجية الاختيارات</h3>
                    <p className="text-gray-400 text-sm">تحليل مفصل لنقاط القوة والضعف في اختياراتك</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400 bg-slate-700/50 px-3 py-1 rounded-full">
                    {isDescriptionExpanded ? 'إخفاء' : 'عرض'}
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDescriptionExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <div className={`transition-all duration-500 ease-in-out transform ${isDescriptionExpanded ? 'max-h-[500px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'} overflow-hidden`}>
                <div className="px-6 pb-6">
                  <div className="bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-lg p-5 border-l-4 border-blue-500 backdrop-blur-sm">
                    <div className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                      {analysis.analysisDescription}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Most Probable Choice - Collapsible */}
          {analysis.mostProbableChoice && (
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl overflow-hidden">
              <button
                onClick={() => setIsMostProbableExpanded(!isMostProbableExpanded)}
                className="w-full flex items-center justify-between p-6 hover:bg-amber-500/10 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-white">الاختيار الأكثر احتمالاً للقبول</h3>
                    <p className="text-gray-400 text-sm">التخصص الذي يحمل أعلى نسبة قبول متوقعة</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">
                      {analysis.mostProbableChoice.probability}%
                    </div>
                    <div className="text-xs text-amber-300">احتمالية</div>
                  </div>
                  <span className="text-sm text-gray-400 bg-amber-500/20 px-3 py-1 rounded-full">
                    {isMostProbableExpanded ? 'إخفاء' : 'عرض التفاصيل'}
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isMostProbableExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <div className={`transition-all duration-500 ease-in-out transform ${isMostProbableExpanded ? 'max-h-[500px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'} overflow-hidden`}>
                <div className="px-6 pb-6">
                  <div className="bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-lg p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                          {analysis.mostProbableChoice.rank}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-lg">{analysis.mostProbableChoice.name}</h4>
                          <p className="text-gray-400">{analysis.mostProbableChoice.university}</p>
                        </div>
                      </div>
                      <div className="text-center bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-xl p-4 border border-amber-500/30">
                        <div className="text-3xl font-bold text-amber-400">
                          {analysis.mostProbableChoice.probability}%
                        </div>
                        <div className="text-xs text-amber-300">احتمالية القبول</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-slate-600/40 to-slate-500/40 rounded-lg p-4 border-l-4 border-amber-500 backdrop-blur-sm">
                      <h5 className="text-amber-400 font-semibold mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        تحليل مفصل:
                      </h5>
                      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                        {analysis.mostProbableChoice.reasoning}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Choice Distribution */}
          {analysis.choiceDistribution && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              <h3 className="font-semibold text-white mb-6 text-xl flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                توزيع مستويات المخاطر
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-5 bg-green-500/20 rounded-xl border border-green-500/30 hover:bg-green-500/30 transition-colors duration-200">
                  <div className="text-4xl font-bold text-green-400 mb-2">{analysis.choiceDistribution.safe}</div>
                  <div className="text-sm text-green-300 font-medium">اختيارات آمنة</div>
                  <div className="text-xs text-green-200 mt-1">احتمالية عالية</div>
                </div>
                <div className="text-center p-5 bg-yellow-500/20 rounded-xl border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors duration-200">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">{analysis.choiceDistribution.moderate}</div>
                  <div className="text-sm text-yellow-300 font-medium">اختيارات متوسطة</div>
                  <div className="text-xs text-yellow-200 mt-1">احتمالية متوسطة</div>
                </div>
                <div className="text-center p-5 bg-red-500/20 rounded-xl border border-red-500/30 hover:bg-red-500/30 transition-colors duration-200">
                  <div className="text-4xl font-bold text-red-400 mb-2">{analysis.choiceDistribution.risky}</div>
                  <div className="text-sm text-red-300 font-medium">اختيارات مخاطرة</div>
                  <div className="text-xs text-red-200 mt-1">احتمالية منخفضة</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Improvement Suggestions */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
              <h3 className="font-semibold text-white text-lg flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                اقتراحات التحسين البديلة
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {analysis.improvements?.map((improvement, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 border border-slate-600/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {improvement.originalRank}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-lg">{improvement.suggestedProgram}</p>
                      <p className="text-gray-400 text-sm mt-1">{improvement.reasoning}</p>
                      {improvement.category && (
                        <span className="inline-block mt-2 px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                          {improvement.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">{improvement.improvementPercentage}%</div>
                    <div className="text-xs text-green-300">تحسين متوقع</div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-gray-400 text-lg">لا توجد اقتراحات تحسينية متاحة حالياً</p>
                  <p className="text-gray-500 text-sm mt-2">اختياراتك الحالية مناسبة جداً!</p>
                </div>
              )}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <h3 className="font-semibold text-white mb-6 text-xl flex items-center">
              <svg className="w-6 h-6 mr-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              تقييم المخاطر والنقاط
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                <span className="text-gray-400 font-medium">مستوى المخاطر العام:</span>
                <span className={`font-bold text-lg px-4 py-2 rounded-full ${
                  analysis.riskLevel === 'منخفض' ? 'text-green-400 bg-green-500/20' :
                  analysis.riskLevel === 'متوسط' ? 'text-yellow-400 bg-yellow-500/20' : 'text-red-400 bg-red-500/20'
                }`}>
                  {analysis.riskLevel || 'غير محدد'}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Risk Factors */}
                {analysis.riskFactors && analysis.riskFactors.length > 0 && (
                  <div className="bg-red-500/10 rounded-lg p-5 border border-red-500/20">
                    <h4 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      عوامل المخاطر
                    </h4>
                    <ul className="space-y-3">
                      {analysis.riskFactors.map((factor, index) => (
                        <li key={index} className="text-gray-300 flex items-start text-sm">
                          <span className="text-red-400 mr-3 text-lg">⚠️</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Strengths */}
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div className="bg-green-500/10 rounded-lg p-5 border border-green-500/20">
                    <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      نقاط القوة
                    </h4>
                    <ul className="space-y-3">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-300 flex items-start text-sm">
                          <span className="text-green-400 mr-3 text-lg">✅</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Strategic Recommendations */}
          {analysis.strategicRecommendations && analysis.strategicRecommendations.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h3 className="font-semibold text-white text-lg flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  التوصيات الاستراتيجية
                </h3>
                <p className="text-indigo-200 text-sm mt-2">خطوات عملية لتحسين فرص القبول</p>
              </div>
              <div className="p-6 space-y-4">
                {analysis.strategicRecommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 border border-slate-600/30">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 leading-relaxed">{recommendation}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-block w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Items */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 p-6">
            <h3 className="font-semibold text-white text-lg mb-4 flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              خطوات العمل التالية
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-medium mb-2">📋 قريب المدى</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• مراجعة ترتيب الأولويات</li>
                  <li>• التأكد من استكمال الوثائق</li>
                  <li>• متابعة تواريخ التسجيل</li>
                </ul>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-medium mb-2">🎯 طويل المدى</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• التواصل مع المستشارين</li>
                  <li>• إعداد خطة بديلة</li>
                  <li>• تطوير المهارات المطلوبة</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main page component
export default function OrientationPage() {
  return (
    <>
      <OrientationPageContent />
      
      {/* FloatingNexie Assistant */}
      <FloatingNexie 
        currentStep={0}
        isVisible={true}
        enableChat={true}
        showOnPages={['orientations']}
        showChatPrompt={true}
      />
    </>
  );
}
