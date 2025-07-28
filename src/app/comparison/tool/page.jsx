'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { GitCompare, Loader2, AlertCircle, X, Search, Heart } from 'lucide-react';
import orientationsData from '@/data/finale-data.json';
import { Button } from '@/components/ui/button';
import FloatingNexie from '@/components/FloatingNexie';
import ChatSidebar from '@/components/ChatSidebar';
import { trackData, calculateMG, calculateFS } from '@/utils/calculations';
import { getUserProfile } from '@/actions/profile-actions';
import { getUserFavoritesByCode } from '@/actions/favorites-actions';
import { useTranslation } from '../../i18n/client';
export default function ComparisonToolPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { t, loading: translationLoading } = useTranslation('common');

  const [userData, setUserData] = useState(null);
  const [orientation1, setOrientation1] = useState(null);
  const [orientation2, setOrientation2] = useState(null);
  const [orientation1Code, setOrientation1Code] = useState('');
  const [orientation2Code, setOrientation2Code] = useState('');
  const [availableOrientations, setAvailableOrientations] = useState([]);
  const [favoriteOrientations, setFavoriteOrientations] = useState([]);
  const [codeSearchResults, setCodeSearchResults] = useState({ orientation1: null, orientation2: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [useCodeInput, setUseCodeInput] = useState(false);

  // Bac type mapping
  const getBacTypeFromFiliere = (filiere) => {
    const bacTypeMap = {
      math: t('branches.math'),
      science: t('branches.science'),
      info: t('branches.info'),
      tech: t('branches.tech'),
      eco: t('branches.eco'),
      lettres: t('branches.lettres'),
      sport: t('branches.sport')
    };
    return bacTypeMap[filiere] || filiere;
  };

  // Load user profile and available orientations
  useEffect(() => {
    const loadUserProfile = async () => {
      if (isLoaded && isSignedIn && user) {
        try {// Load user profile
          const result = await getUserProfile();if (result.success && result.profile) {
            // Convert database profile to expected format
            const dbProfile = result.profile;const userData = {
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
            };setUserData(userData);
            
            // Get user's bac type and filter orientations
            const userBacType = getBacTypeFromFiliere(userData.filiere);
            const orientations = orientationsData
              .filter(item => item.bac_type_name === userBacType && item.historical_scores?.['2024'] > 0)
              .map(item => ({
                id: item.ramz_code,
                name: item.table_specialization,
                university: item.university_name,
                hub: item.table_location,
                score2024: item.historical_scores?.['2024'] || 0,
                score2023: item.historical_scores?.['2023'] || 0,
                score2022: item.historical_scores?.['2022'] || 0,
                bacType: userBacType,
                code: item.ramz_code
              }));
            setAvailableOrientations(orientations);
            
            // Load user favorites
            try {const favoritesResult = await getUserFavoritesByCode();if (favoritesResult.success && favoritesResult.favorites?.length > 0) {
                const favoriteCodes = favoritesResult.favorites.map(fav => fav.orientationCode);// Get full orientation data for each favorite code from the main data source
                const favoriteOrientationsDetails = favoriteCodes.map(code => {
                  const orientation = orientationsData.find(o => o.ramz_code === code);
                  if (!orientation) return null;
                  return {
                    id: orientation.ramz_code,
                    name: orientation.table_specialization,
                    university: orientation.university_name,
                    hub: orientation.table_location,
                    score2024: orientation.historical_scores?.['2024'] || 0,
                    score2023: orientation.historical_scores?.['2023'] || 0,
                    score2022: orientation.historical_scores?.['2022'] || 0,
                    bacType: orientation.bac_type_name,
                    code: orientation.ramz_code
                  };
                }).filter(Boolean); // Filter out any nulls if an orientation wasn't foundsetFavoriteOrientations(favoriteOrientationsDetails);
              } else {setFavoriteOrientations([]);
              }
            } catch (favError) {
              console.error('❌ Error loading favorites:', favError);
              setFavoriteOrientations([]);
            }
            
            return;
          }setError(t('comparisonTool.profileNotFound'));
          
        } catch (error) {
          console.error('Error loading user profile:', error);
          setError(t('comparisonTool.dataLoadingError'));
        }
      }
    };
    loadUserProfile();

    // Load pre-selected orientation (from recommendations)
    const selectedData = localStorage.getItem('selectedOrientation');
    if (selectedData) {
      const orientation = JSON.parse(selectedData);
      setOrientation1(orientation);
      localStorage.removeItem('selectedOrientation');
    }
  }, [isLoaded, isSignedIn, user]);

  // Search orientation by code
  const searchOrientationByCode = (code) => {
    return orientationsData.find(orientation => orientation.ramz_code === code);
  };

  // Real-time code search (triggered on input change)
  useEffect(() => {
    if (orientation1Code.trim()) {
      const orientation = searchOrientationByCode(orientation1Code.trim());
      if (orientation) {
        const orientationData = {
          id: orientation.ramz_code,
          name: orientation.table_specialization,
          university: orientation.university_name,
          hub: orientation.table_location,
          score2024: orientation.historical_scores?.['2024'] || 0,
          score2023: orientation.historical_scores?.['2023'] || 0,
          score2022: orientation.historical_scores?.['2022'] || 0,
          bacType: orientation.bac_type_name,
          code: orientation.ramz_code
        };
        setCodeSearchResults(prev => ({ ...prev, orientation1: orientationData }));
        setError(null);
      } else {
        setCodeSearchResults(prev => ({ ...prev, orientation1: null }));
      }
    } else {
      setCodeSearchResults(prev => ({ ...prev, orientation1: null }));
    }
  }, [orientation1Code]);

  useEffect(() => {
    if (orientation2Code.trim()) {
      const orientation = searchOrientationByCode(orientation2Code.trim());
      if (orientation) {
        const orientationData = {
          id: orientation.ramz_code,
          name: orientation.table_specialization,
          university: orientation.university_name,
          hub: orientation.table_location,
          score2024: orientation.historical_scores?.['2024'] || 0,
          score2023: orientation.historical_scores?.['2023'] || 0,
          score2022: orientation.historical_scores?.['2022'] || 0,
          bacType: orientation.bac_type_name,
          code: orientation.ramz_code
        };
        setCodeSearchResults(prev => ({ ...prev, orientation2: orientationData }));
        setError(null);
      } else {
        setCodeSearchResults(prev => ({ ...prev, orientation2: null }));
      }
    } else {
      setCodeSearchResults(prev => ({ ...prev, orientation2: null }));
    }
  }, [orientation2Code]);

  // Handle code search
  const handleCodeSearch = (code, orientationNumber) => {
    const searchResult = orientationNumber === 1 ? codeSearchResults.orientation1 : codeSearchResults.orientation2;
    if (searchResult) {
      if (orientationNumber === 1) setOrientation1(searchResult);
      else setOrientation2(searchResult);
      setError(null);
    } else {
      setError(`${t('comparisonTool.orientationNotFound')} ${code}`);
    }
  };

  // Map form grades to calculation format
  const mapGradesToCalculationFormat = (notes, filiere) => {
    const mappedGrades = {};
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

  // Calculate user scores
  const calculateUserScores = () => {
    if (!userData) return { mg: 0, fs: 0 };
    if (userData.mgScore !== undefined && userData.fsScore !== undefined) {
      return { mg: userData.mgScore || 0, fs: userData.fsScore || 0 };
    }
    if (!userData.filiere || !userData.notes) return { mg: 0, fs: 0 };
    const mappedGrades = mapGradesToCalculationFormat(userData.notes, userData.filiere);
    const track = { id: userData.filiere, name: trackData[userData.filiere]?.name || userData.filiere };
    const mg = calculateMG(mappedGrades, track);
    const fs = calculateFS(mappedGrades, track, mg);
    return { mg, fs };
  };

  // Handle comparison creation via API
  const handleCompare = async () => {
    if (!orientation1 || !orientation2) {
      setError(t('comparisonTool.selectTwoOrientations'));
      return;
    }
    if (!userData) {
      setError(t('dataUnavailable'));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const userScores = calculateUserScores();const response = await fetch('/api/comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orientation1,
          orientation2,
          userProfile: {
            score: userScores.fs,
            mg: userScores.mg,
            location: userData.governorate || t('tunisia'),
            bacType: userData.filiere,
            birthDate: userData.birthday?.toISOString() || new Date().toISOString(),
            gender: userData.gender
          }
        })
      });const result = await response.json();if (result.success) {
        router.push(`/comparison/${result.comparisonId}`);
      } else {
        console.error('❌ API Error:', result.error);
        setError(result.error || t('comparisonTool.comparisonError'));
      }
    } catch (err) {
      setError(t('comparisonTool.comparisonErrorRetry'));
    } finally {
      setIsLoading(false);
    }
  };

  // UI rendering
  if (!isLoaded || translationLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <GitCompare className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('loginRequired')}</h1>
            <p className="text-gray-400">
              {t('comparisonTool.loginRequired')}
            </p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => router.push('/sign-in')}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              {t('signIn')}
            </Button>
            <Button onClick={() => router.push('/sign-up')}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
              {t('createAccount')}
            </Button>
            <Button onClick={() => router.push('/')}
              variant="ghost"
              className="w-full text-gray-400 hover:text-gray-300">
              {t('backToHome')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData && !error) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">{t('loadingData')}</p>
        </div>
      </div>
    );
  }

  if (!userData || error) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('userDataNotAvailable')}</h2>
          <p className="text-gray-400 mb-6">
            {error || t('comparisonTool.completeProfile')}
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/stepper')} 
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              {t('completeData')}
            </Button>
            <Button onClick={() => router.push('/comparison')} 
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
              {t('comparisonTool.backToComparison')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getUserScores = () => calculateUserScores();

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">{t('comparisonTool.personalInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <span className="text-gray-400">{t('branch')}:</span>
              <span className="text-white ml-2">{getBacTypeFromFiliere(userData.filiere)}</span>
            </div>
            <div>
              <span className="text-gray-400">{t('governorate')}:</span>
              <span className="text-white ml-2">{userData.wilaya}</span>
            </div>
            <div>
              <span className="text-gray-400">{t('overallGrade')}:</span>
              <span className="text-white ml-2">{userData.mgScore ? userData.mgScore.toFixed(2) : getUserScores().mg.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">{t('points')}:</span>
              <span className="text-white ml-2">{userData.fsScore ? userData.fsScore.toFixed(2) : getUserScores().fs.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">{t('favorites')}:</span>
              <span className="text-cyan-400 ml-2 flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {favoriteOrientations.length}
              </span>
            </div>
          </div>
        </div>

        {/* Input Method Toggle */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">{t('inputMethod')}</h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={() => setUseCodeInput(false)}
              variant={!useCodeInput ? "default" : "outline"}
              className={`${!useCodeInput ? 'bg-[#1581f3] text-white' : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'} flex items-center justify-center`}
            >
              <Heart className="w-4 h-4 mr-2" />
              {t('favoriteList')} ({favoriteOrientations.length})
            </Button>
            <Button
              onClick={() => setUseCodeInput(true)}
              variant={useCodeInput ? "default" : "outline"}
              className={`${useCodeInput ? 'bg-[#1581f3] text-white' : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'} flex items-center justify-center`}
            >
              <Search className="w-4 h-4 mr-2" />
              {t('comparisonTool.searchByCode')}
            </Button>
          </div>
          {!useCodeInput && favoriteOrientations.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
              <p className="text-yellow-300 text-sm">
                {t('comparisonTool.noFavorites')}
              </p>
            </div>
          )}
        </div>

        {/* Comparison Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Orientation 1 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-6 h-6 bg-[#1581f3] rounded-full flex items-center justify-center text-white text-sm mr-2">1</span>
              {t('firstOrientation')}
            </h3>
            {orientation1 ? (
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-cyan-300 mb-2">{orientation1.name}</h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div>{t('university')}: {orientation1.university}</div>
                      <div>{t('hub')}: {orientation1.hub}</div>
                      <div>{t('requiredScore2024')}: {orientation1.score2024}</div>
                      <div>{t('requiredScore2023')}: {orientation1.score2023}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOrientation1(null)}
                    className="bg-red-700 border-red-600 text-white hover:bg-red-600 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {/* Score Analysis */}
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">{t('admissionChance')}:</span>
                    <span className={`text-sm font-medium ${
                      getUserScores().fs >= orientation1.score2024 ? 'text-green-400' :
                      getUserScores().fs >= orientation1.score2024 - 10 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {getUserScores().fs >= orientation1.score2024 ? t('excellent') :
                        getUserScores().fs >= orientation1.score2024 - 10 ? t('good') :
                        t('poor')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-400">{t('difference')}:</span>
                    <span className={`text-sm font-medium ${
                      getUserScores().fs >= orientation1.score2024 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {getUserScores().fs >= orientation1.score2024 ? '+' : ''}{(getUserScores().fs - orientation1.score2024).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {useCodeInput ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('enterFirstOrientationCode')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={t('placeholder1')}
                        value={orientation1Code}
                        onChange={(e) => setOrientation1Code(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                    </div>
                    
                    {/* Real-time search result */}
                    {orientation1Code.trim() && (
                      <div className="mt-3">
                        {codeSearchResults.orientation1 ? (
                          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-green-300 text-sm">{codeSearchResults.orientation1.name}</h4>
                                <p className="text-xs text-gray-300">{codeSearchResults.orientation1.university}</p>
                                <p className="text-xs text-gray-400">{t('score2024')}: {codeSearchResults.orientation1.score2024}</p>
                              </div>
                              <Button
                                onClick={() => handleCodeSearch(orientation1Code, 1)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {t('select')}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                            <p className="text-red-300 text-sm">{t('orientationNotFoundCode')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Heart className="w-4 h-4 inline mr-1" />
                      {t('selectFromFavorites')}
                    </label>
                    {favoriteOrientations.length > 0 ? (
                      <select
                        onChange={(e) => {
                          const selected = favoriteOrientations.find(o => o.id === e.target.value);
                          setOrientation1(selected);
                        }}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">{t('selectFromFavorites2')}</option>
                        {favoriteOrientations.map(orientation => (
                          <option key={orientation.id} value={orientation.id}>
                            {orientation.code} - {orientation.name.substring(0, 50)}...
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 text-center">
                        <p className="text-gray-400 text-sm mb-2">{t('noFavoritesYet')}</p>
                        <Button
                          onClick={() => router.push('/recommendations')}
                          size="sm"
                          className="bg-[#1581f3] hover:bg-blue-600 text-white"
                        >
                          {t('addFavorites')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Orientation 2 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-6 h-6 bg-[#1581f3] rounded-full flex items-center justify-center text-white text-sm mr-2">2</span>
              {t('secondOrientation')}
            </h3>
            {orientation2 ? (
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-cyan-300 mb-2">{orientation2.name}</h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div>{t('university')}: {orientation2.university}</div>
                      <div>{t('hub')}: {orientation2.hub}</div>
                      <div>{t('requiredScore2024')}: {orientation2.score2024}</div>
                      <div>{t('requiredScore2023')}: {orientation2.score2023}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOrientation2(null)}
                    className="bg-red-700 border-red-600 text-white hover:bg-red-600 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {/* Score Analysis */}
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">{t('admissionChance')}:</span>
                    <span className={`text-sm font-medium ${
                      getUserScores().fs >= orientation2.score2024 ? 'text-green-400' :
                      getUserScores().fs >= orientation2.score2024 - 10 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {getUserScores().fs >= orientation2.score2024 ? t('excellent') :
                        getUserScores().fs >= orientation2.score2024 - 10 ? t('good') :
                        t('poor')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-400">{t('difference')}:</span>
                    <span className={`text-sm font-medium ${
                      getUserScores().fs >= orientation2.score2024 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {getUserScores().fs >= orientation2.score2024 ? '+' : ''}{(getUserScores().fs - orientation2.score2024).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {useCodeInput ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('enterSecondOrientationCode')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={t('placeholder2')}
                        value={orientation2Code}
                        onChange={(e) => setOrientation2Code(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                    </div>
                    
                    {/* Real-time search result */}
                    {orientation2Code.trim() && (
                      <div className="mt-3">
                        {codeSearchResults.orientation2 ? (
                          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-green-300 text-sm">{codeSearchResults.orientation2.name}</h4>
                                <p className="text-xs text-gray-300">{codeSearchResults.orientation2.university}</p>
                                <p className="text-xs text-gray-400">{t('score2024')}: {codeSearchResults.orientation2.score2024}</p>
                              </div>
                              <Button
                                onClick={() => handleCodeSearch(orientation2Code, 2)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {t('select')}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                            <p className="text-red-300 text-sm">{t('orientationNotFoundCode')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Heart className="w-4 h-4 inline mr-1" />
                      {t('selectFromFavorites')}
                    </label>
                    {favoriteOrientations.length > 0 ? (
                      <select
                        onChange={(e) => {
                          const selected = favoriteOrientations.find(o => o.id === e.target.value);
                          setOrientation2(selected);
                        }}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">{t('selectFromFavorites2')}</option>
                        {favoriteOrientations
                          .filter(o => !orientation1 || o.id !== orientation1.id)
                          .map(orientation => (
                            <option key={orientation.id} value={orientation.id}>
                              {orientation.code} - {orientation.name.substring(0, 50)}...
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 text-center">
                        <p className="text-gray-400 text-sm mb-2">{t('noFavoritesYet')}</p>
                        <Button
                          onClick={() => router.push('/recommendations')}
                          size="sm"
                          className="bg-[#1581f3] hover:bg-blue-600 text-white"
                        >
                          {t('addFavorites')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Comparison Preview */}
        {orientation1 && orientation2 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">{t('quickComparison')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-400">{t('score2024')}</div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-cyan-400">{orientation1.score2024}</span>
                  <span className="text-gray-400">vs</span>
                  <span className="text-cyan-400">{orientation2.score2024}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">{t('yourPoints')}</div>
                <div className="text-lg font-bold text-white">{getUserScores().fs.toFixed(1)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">{t('bestForYou')}</div>
                <div className="text-lg font-bold text-green-400">
                  {Math.abs(getUserScores().fs - orientation1.score2024) < Math.abs(getUserScores().fs - orientation2.score2024)
                    ? t('first') : t('second')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Compare Button */}
        <div className="text-center">
          <Button
            onClick={handleCompare}
            disabled={!orientation1 || !orientation2 || isLoading}
            className="bg-[#1581f3] hover:bg-blue-600 text-white px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t('comparing')}
              </>
            ) : (
              <>
                <GitCompare className="w-5 h-5 mr-2" />
                {t('startDetailedComparison')}
              </>
            )}
          </Button>
          {orientation1 && orientation2 && (
            <p className="text-sm text-gray-400 mt-2">
              {t('aiAnalysisDescription')}
            </p>
          )}
        </div>
      </div>
      {/* FloatingNexie with Chat */}
      <FloatingNexie
        currentStep={1}
        isVisible={true}
        showChatPrompt={true}
        onChatOpen={() => setIsChatOpen(true)}
      />
      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userData={{
          mg: getUserScores().mg,
          fs: getUserScores().fs,
          wilaya: userData?.wilaya,
          filiere: userData?.filiere,
          context: 'comparison'
        }}
      />
    </div>
  );
}