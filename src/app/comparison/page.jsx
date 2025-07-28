'use client';

import { useRouter } from 'next/navigation';
import { getComparisonStats } from '@/actions/enhanced-comparison-actions';
import { getUserFavoritesByCode } from '@/actions/favorites-actions';
import { useEffect, useState } from 'react';
import { trackData, calculateMG, calculateFS, getScoreLevel } from '@/utils/calculations';
import { useAuthRedirect, RedirectLoadingScreen } from '@/hooks/useAuthRedirect';
import { useTranslation } from '../i18n/client';

export default function ComparisonLandingPage() {
  const router = useRouter();
  const { isRedirecting, isReady, userProfile, isSignedIn, user } = useAuthRedirect({
    requireAuth: true,
    requireProfile: true
  });
  const { t, locale, loading: translationLoading } = useTranslation('common');

  const [stats, setStats] = useState(null);
  const [userData, setUserData] = useState(null);
  const [scores, setScores] = useState({ mg: 0, fs: 0, scoreLevel: { color: '#gray', text: t('undetermined') } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritesCount, setFavoritesCount] = useState(0);

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

  // Get bac type mapping
  const getBacTypeFromFiliere = (filiere) => {
    const bacTypeMap = {
      math: t('mathematics'),
      science: t('experimentalSciences'), 
      info: t('computerScience'),
      tech: t('technicalSciences'),
      eco: t('economicsManagement'),
      lettres: t('literature'),
      sport: t('sports')
    };
    return bacTypeMap[filiere] || filiere;
  };

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

    // Load comparison stats
    const loadStats = async () => {
      try {
        const result = await getComparisonStats();
        if (result.success) {
          setStats(result.stats);
        } else {
          console.error('❌ Stats loading failed:', result.error);
        }
      } catch (error) {
        console.error('❌ Error loading comparison stats:', error);
      }
    };

    // Load favorites count
    const loadFavoritesCount = async () => {
      try {
        const favoritesResult = await getUserFavoritesByCode();
        if (favoritesResult.success) {
          setFavoritesCount(favoritesResult.favorites.length);
        }
      } catch (error) {
        console.error('❌ Error loading favorites count:', error);
      }
    };

    const loadAllData = async () => {
      if (isReady && !isRedirecting && userProfile) {
        setLoading(true);
        await Promise.all([
          loadUserData(),
          loadStats(),
          loadFavoritesCount()
        ]);
        setLoading(false);
      } else if (isReady && !isRedirecting) {
        setLoading(false);
      }
    };

    loadAllData();
  }, [isReady, isRedirecting, userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold mb-2">{t('loadingData2')}</h3>
          <p className="text-gray-400">{t('pleaseWait')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center bg-red-500/20 border border-red-400/50 rounded-2xl p-12 max-w-md">
          <h3 className="text-2xl font-bold mb-4">{t('errorOccurred')}</h3>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-500 text-gray-900 px-6 py-2 rounded-lg hover:bg-cyan-400 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const navigateToRecommendations = () => {
    router.push('/recommendations');
  };

  const navigateToOrientationGuide = () => {
    router.push('/orientations');
  };

  const navigateToGuide = () => {
    router.push('/guide');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800" dir="rtl">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
            {t('universityDashboard')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {t('dashboardWelcome')}
          </p>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Recommendations Card */}
          <div 
            onClick={navigateToRecommendations}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-full p-3">
                <span className="text-2xl">💡</span>
              </div>
              <span className="text-sm bg-white/20 px-2 py-1 rounded-full">{t('new')}</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('recommendationsTitle')}</h3>
            <p className="text-blue-100 text-sm mb-4">{t('recommendationsSubtitle')}</p>
            <div className="text-right">
              <span className="text-3xl font-bold text-blue-200">→ {t('discoverMore')}</span>
            </div>
          </div>

          {/* Comparison Tool Card (restored) */}
          <div 
            onClick={() => router.push('/comparison/tool')}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-full p-3">
                <span className="text-2xl">⚖️</span>
              </div>
              <span className="text-sm bg-white/20 px-2 py-1 rounded-full">{t('compare')}</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('compareTitle')}</h3>
            <p className="text-purple-100 text-sm mb-4">{t('compareSubtitle')}</p>
            <div className="text-right">
              <span className="text-3xl font-bold text-purple-200">→ {t('discoverMore')}</span>
            </div>
          </div>

          {/* University Orientations Card */}
          <div 
            onClick={navigateToOrientationGuide}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-full p-3">
                <span className="text-2xl">🎓</span>
              </div>
              <span className="text-sm bg-white/20 px-2 py-1 rounded-full">{t('explore')}</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('exploreTitle')}</h3>
            <p className="text-green-100 text-sm mb-4">{t('exploreSubtitle')}</p>
            <div className="text-right">
              <span className="text-3xl font-bold text-green-200">→ {t('discoverMore')}</span>
            </div>
          </div>

          {/* Guide Card */}
          <div 
            onClick={navigateToGuide}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-full p-3">
                <span className="text-2xl">📖</span>
              </div>
              <span className="text-sm bg-white/20 px-2 py-1 rounded-full">{t('guideTitle')}</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('guideTitle')}</h3>
            <p className="text-orange-100 text-sm mb-4">{t('guideSubtitle')}</p>
            <div className="text-right">
              <span className="text-3xl font-bold text-orange-200">→ {t('discoverMore')}</span>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{t('personalInformation')}</h2>
            <button
              onClick={() => router.push('/stepper/review')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-lg transition-colors duration-200 flex items-center gap-1"
            >
              <span>✏️</span>
              {t('updateData')}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="text-gray-400">{t('branch')}:</span>
              <span className="text-white ml-2">
                {userData?.filiere ? getBacTypeFromFiliere(userData.filiere) : t('undetermined')}
              </span>
            </div>
            <div>
              <span className="text-gray-400">{t('governorate')}:</span>
              <span className="text-white ml-2">{userData?.wilaya || t('undetermined')}</span>
            </div>
            <div>
              <span className="text-gray-400">{t('overallGrade')}:</span>
              <span className="text-white ml-2">
                {scores.mg && scores.mg > 0 ? scores.mg.toFixed(2) : t('undetermined')}
              </span>
            </div>
            <div>
              <span className="text-gray-400">{t('points')}:</span>
              <span className="text-white ml-2">
                {scores.fs && scores.fs > 0 ? scores.fs.toFixed(2) : t('undetermined')}
              </span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
            <p className="text-blue-200 text-sm flex items-center gap-2">
              <span>💡</span>
              {t('updateDataMessage')}
              <button
                onClick={() => router.push('/stepper/review')}
                className="text-blue-400 hover:text-blue-300 underline decoration-dotted underline-offset-2 transition-colors"
              >
                {t('dataReviewPage')}
              </button>
              {t('ensureAccuracy')}
            </p>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            {t('quickStats')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats?.totalComparisons || 0}</div>
              <div className="text-gray-600 dark:text-gray-300">{t('comparisonsCount')}</div>
              <div className="text-sm text-gray-500">{t('forYou')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">{favoritesCount}</div>
              <div className="text-gray-600 dark:text-gray-300">{t('favoritesTitle')}</div>
              <div className="text-sm text-gray-500">{t('savedMajors')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {scores.scoreLevel?.text || t('undetermined')}
              </div>
              <div className="text-gray-600 dark:text-gray-300">{t('scoreLevel')}</div>
              <div className="text-sm text-gray-500">{scores.fs ? `${scores.fs.toFixed(1)} ${t('pointsUnit')}` : ''}</div>
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">{t('welcomeToPlatform')}</h2>
          <p className="text-blue-100 mb-6 text-lg">
            {t('startYourJourney')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl mb-2">1️⃣</div>
              <h4 className="font-semibold mb-1">{t('step1Title')}</h4>
              <p className="text-sm text-blue-100">{t('step1Desc')}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl mb-2">2️⃣</div>
              <h4 className="font-semibold mb-1">{t('step2Title')}</h4>
              <p className="text-sm text-blue-100">{t('step2Desc')}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl mb-2">3️⃣</div>
              <h4 className="font-semibold mb-1">{t('step3Title')}</h4>
              <p className="text-sm text-blue-100">{t('step3Desc')}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl mb-2">4️⃣</div>
              <h4 className="font-semibold mb-1">{t('step4Title')}</h4>
              <p className="text-sm text-blue-100">{t('step4Desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
