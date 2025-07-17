'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Heart, MapPin, GraduationCap, Building2, Star, TrendingUp, BookOpen, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import finaleData from '@/data/finale-data.json';
import { addToFavoritesByCode, removeFromFavoritesByCode, getUserFavoritesByCode } from '@/actions/favorites-actions';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function GuidePage() {
  const router = useRouter();
  const { isRedirecting, isReady, userProfile, isSignedIn, user } = useAuthRedirect({
    requireAuth: false,
    requireProfile: false
  });
  
  // State management
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    field_of_study: '',
    university_name: '',
    bac_type_name: '',
    table_location: '',
    table_institution: '',
    table_specialization: '',
    seven_percent: '',
    search: '',
    showFavoritesOnly: false,
    sortBy: 'latest_score'
  });

  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      if (isReady && !isRedirecting) {
        setIsLoading(true);
        await loadProgramsData();
        await loadUserFavorites();
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [isReady, isRedirecting]);

  // Apply filters when filters or programs change
  useEffect(() => {
    applyFilters();
  }, [filters, programs, favorites]);

  // Load programs data
  const loadProgramsData = async () => {
    try {
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter out entries with missing essential data
      const validPrograms = finaleData.filter(program => 
        program.ramz_code && 
        program.table_specialization && 
        program.university_name
      );
      setPrograms(validPrograms);
      setFilteredPrograms(validPrograms);
    } catch (error) {
      console.error('Error loading programs data:', error);
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

  // Handle favorites toggle with database
  const handleFavoriteToggle = async (orientationCode) => {
    if (!isSignedIn) {
      alert('يجب تسجيل الدخول لإضافة المفضلة');
      return;
    }

    console.log('🔍 Toggling favorite for:', orientationCode);
    setLoadingFavorites(prev => ({ ...prev, [orientationCode]: true }));

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
      setLoadingFavorites(prev => ({ ...prev, [orientationCode]: false }));
    }
  };

  // Check if program is favorite
  const isFavorite = (ramz_code) => {
    return favorites.includes(ramz_code);
  };

  // Get latest non-zero score
  const getLatestScore = (historical_scores) => {
    if (!historical_scores) return null;
    
    // Check years from 2024 backwards
    for (let year = 2024; year >= 2011; year--) {
      const score = historical_scores[year.toString()];
      if (score && score > 0) {
        return { score, year };
      }
    }
    return null;
  };

  // Get unique values for filter dropdowns
  const getUniqueValues = (field) => {
    const values = programs.map(program => program[field]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...programs];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(program =>
        program.table_specialization?.toLowerCase().includes(searchTerm) ||
        program.table_institution?.toLowerCase().includes(searchTerm) ||
        program.university_name?.toLowerCase().includes(searchTerm) ||
        program.table_location?.toLowerCase().includes(searchTerm) ||
        program.ramz_code?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply dropdown filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && key !== 'search' && key !== 'showFavoritesOnly' && key !== 'sortBy') {
        filtered = filtered.filter(program => program[key] === filters[key]);
      }
    });

    // Apply favorites filter
    if (filters.showFavoritesOnly) {
      filtered = filtered.filter(program => favorites.includes(program.ramz_code));
    }

    // Apply sorting
    filtered = sortPrograms(filtered, filters.sortBy);

    setFilteredPrograms(filtered);
  };

  // Sort programs
  const sortPrograms = (programsToSort, sortBy) => {
    const sorted = [...programsToSort];
    
    switch (sortBy) {
      case 'latest_score':
        return sorted.sort((a, b) => {
          const scoreA = getLatestScore(a.historical_scores);
          const scoreB = getLatestScore(b.historical_scores);
          if (!scoreA && !scoreB) return 0;
          if (!scoreA) return 1;
          if (!scoreB) return -1;
          return scoreB.score - scoreA.score;
        });
      
      case 'alphabetical':
        return sorted.sort((a, b) => 
          a.table_specialization.localeCompare(b.table_specialization, 'ar')
        );
      
      case 'university':
        return sorted.sort((a, b) => 
          a.university_name.localeCompare(b.university_name, 'ar')
        );
      
      case 'location':
        return sorted.sort((a, b) => 
          a.table_location.localeCompare(b.table_location, 'ar')
        );
      
      default:
        return sorted;
    }
  };

  // Filter options
  const filterOptions = useMemo(() => ({
    fieldOfStudy: getUniqueValues('field_of_study'),
    universities: getUniqueValues('university_name'),
    institutions: getUniqueValues('table_institution'),
    locations: getUniqueValues('table_location'),
    bacTypes: getUniqueValues('bac_type_name'),
    specializations: getUniqueValues('table_specialization')
  }), [programs]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
            
            {/* Middle rotating ring */}
            <div className="absolute inset-2 rounded-full border-3 border-transparent border-t-blue-400 animate-spin animation-delay-150" style={{ animationDirection: 'reverse' }}></div>
            
            {/* Inner rotating ring */}
            <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-purple-400 animate-spin animation-delay-300"></div>
            
            {/* Center icon */}
            <div className="absolute inset-6 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">جاري تحميل دليل البرامج</h2>
            <p className="text-gray-400">جاري تحميل بيانات البرامج الجامعية...</p>
            
            {/* Loading progress dots */}
            <div className="flex justify-center space-x-1 pt-4">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-150"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-300"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              العودة
            </button>
            <div className="w-20"></div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                دليل البرامج الجامعية
              </h1>
              <p className="text-gray-400 mt-2">
                اكتشف {filteredPrograms.length} برنامج جامعي من {programs.length} برنامج متاح
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Filter className="w-4 h-4 mr-2" />
                فلترة ({Object.values(filters).filter(v => v && v !== 'latest_score').length})
              </Button>
              <Button
                variant="outline"
                onClick={() => setFilters(prev => ({ ...prev, showFavoritesOnly: !prev.showFavoritesOnly }))}
                className={`border-slate-600 text-white hover:bg-slate-600 ${
                  filters.showFavoritesOnly ? 'bg-red-500/20 border-red-500/30' : 'bg-slate-700'
                }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${filters.showFavoritesOnly ? 'fill-red-400 text-red-400' : ''}`} />
                المفضلة ({favorites.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-800/50 border-b border-slate-700 p-4">
          <div className="max-w-7xl mx-auto">
            {/* First row of filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative xl:col-span-2">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في البرامج والجامعات..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pr-10 pl-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right"
                />
              </div>

              {/* Sort */}
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="latest_score">ترتيب حسب النقاط</option>
                <option value="alphabetical">ترتيب أبجدي</option>
                <option value="university">ترتيب حسب الجامعة</option>
                <option value="location">ترتيب حسب المنطقة</option>
              </select>

              {/* Seven Percent */}
              <select
                value={filters.seven_percent}
                onChange={(e) => setFilters(prev => ({ ...prev, seven_percent: e.target.value }))}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">جميع البرامج</option>
                <option value="yes">برامج الـ 7% فقط</option>
                <option value="no">برامج عادية فقط</option>
              </select>
            </div>

            {/* Second row of filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-4">
              {/* Field of Study */}
              <select
                value={filters.field_of_study}
                onChange={(e) => setFilters(prev => ({ ...prev, field_of_study: e.target.value }))}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">جميع مجالات الدراسة ({filterOptions.fieldOfStudy.length})</option>
                {filterOptions.fieldOfStudy.map(field => (
                  <option key={field} value={field}>
                    {field.length > 40 ? field.substring(0, 40) + '...' : field}
                  </option>
                ))}
              </select>

              {/* University */}
              <select
                value={filters.university_name}
                onChange={(e) => setFilters(prev => ({ ...prev, university_name: e.target.value }))}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">جميع الجامعات ({filterOptions.universities.length})</option>
                {filterOptions.universities.map(university => (
                  <option key={university} value={university}>{university}</option>
                ))}
              </select>

              {/* BAC Type */}
              <select
                value={filters.bac_type_name}
                onChange={(e) => setFilters(prev => ({ ...prev, bac_type_name: e.target.value }))}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">جميع شعب الباكالوريا ({filterOptions.bacTypes.length})</option>
                {filterOptions.bacTypes.map(bacType => (
                  <option key={bacType} value={bacType}>{bacType}</option>
                ))}
              </select>

              {/* Location */}
              <select
                value={filters.table_location}
                onChange={(e) => setFilters(prev => ({ ...prev, table_location: e.target.value }))}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">جميع المناطق ({filterOptions.locations.length})</option>
                {filterOptions.locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>

              {/* Institution */}
              <select
                value={filters.table_institution}
                onChange={(e) => setFilters(prev => ({ ...prev, table_institution: e.target.value }))}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">جميع المؤسسات ({filterOptions.institutions.length})</option>
                {filterOptions.institutions.map(institution => (
                  <option key={institution} value={institution}>
                    {institution.length > 40 ? institution.substring(0, 40) + '...' : institution}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  field_of_study: '',
                  university_name: '',
                  bac_type_name: '',
                  table_location: '',
                  table_institution: '',
                  table_specialization: '',
                  seven_percent: '',
                  search: '',
                  showFavoritesOnly: false,
                  sortBy: 'latest_score'
                })}
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
        {/* Results Grid */}
        {filteredPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <ProgramCard
                key={program.ramz_id}
                program={program}
                isFavorite={isFavorite(program.ramz_code)}
                onToggleFavorite={() => handleFavoriteToggle(program.ramz_code)}
                onViewDetails={() => router.push(`/guide/${program.ramz_id}`)}
                getLatestScore={getLatestScore}
                loadingFavorites={loadingFavorites[program.ramz_code]}
              />
            ))}
          </div>
        ) : (
          <EmptyState filters={filters} onClearFilters={() => setFilters({
            field_of_study: '',
            university_name: '',
            bac_type_name: '',
            table_location: '',
            table_institution: '',
            table_specialization: '',
            seven_percent: '',
            search: '',
            showFavoritesOnly: false,
            sortBy: 'latest_score'
          })} />
        )}
      </div>
    </div>
  );
}

// Program Card Component
function ProgramCard({ program, isFavorite, onToggleFavorite, onViewDetails, getLatestScore, loadingFavorites }) {
  const latestScore = getLatestScore(program.historical_scores);
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 relative group border border-slate-700">
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        disabled={loadingFavorites}
        className={`absolute top-4 left-4 p-2 rounded-full transition-all duration-200 ${
          isFavorite 
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-red-400'
        } ${loadingFavorites ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loadingFavorites ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        )}
      </button>

      {/* Seven Percent Badge */}
      {program.seven_percent === 'yes' && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium border border-yellow-500/30">
          7%
        </div>
      )}

      <div className="cursor-pointer mt-8" onClick={onViewDetails}>
        {/* Program Info */}
        <div className="mb-4">
          <h3 className="font-semibold text-white text-lg leading-tight mb-2">
            {program.table_specialization}
          </h3>
          <p className="text-sm text-gray-300 mb-1">{program.table_institution}</p>
          <p className="text-xs text-gray-400">{program.university_name}</p>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">المنطقة:</span>
            <span className="text-white">{program.table_location}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">الشعبة المطلوبة:</span>
            <span className="text-white">{program.bac_type_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">رمز البرنامج:</span>
            <span className="text-white">{program.ramz_code}</span>
          </div>
          {latestScore && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">آخر نقطة قطع:</span>
              <div className="text-right">
                <span className="text-cyan-400 font-bold">{latestScore.score}</span>
                <span className="text-gray-500 text-xs mr-1">({latestScore.year})</span>
              </div>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <Button
          className="w-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-200"
          variant="outline"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          عرض التفاصيل
        </Button>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ filters, onClearFilters }) {
  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'latest_score');
  
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-white mb-2">
        {hasActiveFilters ? 'لا توجد نتائج' : 'لا توجد برامج'}
      </h3>
      <p className="text-gray-400 mb-6">
        {hasActiveFilters 
          ? 'جرب تغيير المرشحات أو معايير البحث' 
          : 'لم يتم العثور على برامج جامعية'
        }
      </p>
      {hasActiveFilters && (
        <Button
          onClick={onClearFilters}
          className="bg-[#1581f3] hover:bg-blue-600 text-white"
        >
          إعادة تعيين المرشحات
        </Button>
      )}
    </div>
  );
}
