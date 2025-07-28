// Temporary file to fix the recommendations cards section

{/* Recommendations Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredRecommendations.map((item) => {
    const category = getRecommendationCategory(item);
    const isFavorite = favorites.includes(item.ramz_code);
    const isLoadingFav = loadingFavorites[item.ramz_code];
    
    return (
      <div
        key={item.ramz_code}
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

        {/* Main Card Content */}
        <div 
          className="cursor-pointer mt-8"
          onClick={() => {
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
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
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

          {/* Details */}
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
            
            <div className="text-right">
              <div className="text-sm text-gray-400">نسبة التطابق</div>
              <div className="text-lg font-bold text-cyan-400">
                {category === 'accessible' ? '95%' : 
                 category === 'stretch' ? '75%' : '50%'}
              </div>
            </div>
          </div>

          {/* Action Hint */}
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-2">اضغط للمقارنة</p>
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#1581f3]" />
              <span className="text-[#1581f3] text-sm font-medium">مقارنة التخصص</span>
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>
