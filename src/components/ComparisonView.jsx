'use client';

import { useState } from 'react';
import AIAnalysisLoader from './AIAnalysisLoader';

export default function ComparisonView({ comparison, onExpand, isExpanded }) {
  const [activeTab, setActiveTab] = useState('overview');

  const { userProfile, orientation1, orientation2 } = comparison;

  // If no AI analysis, show basic comparison
  if (!comparison.aiAnalysis) {
    return (
      <div className="h-full flex flex-col rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-700/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#1581f3]/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-[#1581f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">مقارنة التخصصات</h3>
              <p className="text-xs text-gray-400">مقارنة أساسية</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onExpand(isExpanded ? null : 'analysis')}
              className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M20 12H4" : "M4 8h16M4 16h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Basic Comparison Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Comparison Table */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-4 flex items-center">
                <span className="mr-2">⚖️</span>
                مقارنة سريعة
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-right py-2 text-gray-400">المعيار</th>
                      <th className="text-center py-2 text-cyan-300">{orientation1?.name || orientation1?.licence}</th>
                      <th className="text-center py-2 text-cyan-300">{orientation2?.name || orientation2?.licence}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    <tr>
                      <td className="py-3 text-gray-300">الجامعة</td>
                      <td className="py-3 text-center text-white">{orientation1?.university || 'غير محدد'}</td>
                      <td className="py-3 text-center text-white">{orientation2?.university || 'غير محدد'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-300">القطب</td>
                      <td className="py-3 text-center text-white">{orientation1?.hub || 'غير محدد'}</td>
                      <td className="py-3 text-center text-white">{orientation2?.hub || 'غير محدد'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-300">النقاط المطلوبة 2024</td>
                      <td className="py-3 text-center text-white">{orientation1?.score2024 || orientation1?.seuil || 'غير محدد'}</td>
                      <td className="py-3 text-center text-white">{orientation2?.score2024 || orientation2?.seuil || 'غير محدد'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-300">النقاط المطلوبة 2023</td>
                      <td className="py-3 text-center text-white">{orientation1?.score2023 || 'غير محدد'}</td>
                      <td className="py-3 text-center text-white">{orientation2?.score2023 || 'غير محدد'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-300">فرصة القبول</td>
                      <td className="py-3 text-center">
                        {userProfile?.score >= (orientation1?.score2024 || orientation1?.seuil || 0) ? 
                          <span className="text-green-400">جيدة</span> : 
                          <span className="text-red-400">ضعيفة</span>
                        }
                      </td>
                      <td className="py-3 text-center">
                        {userProfile?.score >= (orientation2?.score2024 || orientation2?.seuil || 0) ? 
                          <span className="text-green-400">جيدة</span> : 
                          <span className="text-red-400">ضعيفة</span>
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Analysis Loading */}
            <div className="bg-slate-800/50 rounded-lg p-6">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h4 className="text-white font-medium mb-2">جاري إعداد التحليل الذكي...</h4>
                <p className="text-sm text-gray-400">
                  سيتم عرض تحليل مفصل وتوصيات مخصصة قريباً
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { aiAnalysis } = comparison;

  // Safety check for AI analysis structure
  if (!aiAnalysis.orientation1Analysis || !aiAnalysis.orientation2Analysis) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-medium">إنهاء التحليل الذكي...</p>
          <p className="text-sm text-gray-300 mt-2">جاري إعداد هيكل التحليل</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'orientations', label: 'المقارنة', icon: '⚖️' },
    { id: 'action-plan', label: 'خطة العمل', icon: '🎯' }
  ];

  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden">
      {/* Header with Expand Button */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-700/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#1581f3]/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-[#1581f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">التحليل الذكي</h3>
            <p className="text-xs text-gray-400">مقارنة تفصيلية</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Switch Button - only show when expanded */}
          {isExpanded && (
            <button
              onClick={() => onExpand && onExpand('chat')}
              className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors group"
              title="Basculer vers le chat IA"
            >
              <svg 
                className="w-4 h-4 text-gray-400 group-hover:text-[#1581f3] transition-colors duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          )}
          
          {/* Expand Button */}
          <button
            onClick={() => onExpand && onExpand(isExpanded ? null : 'analysis')}
            className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors group"
            title={isExpanded ? 'Réduire' : 'Agrandir'}
          >
            <svg 
              className={`w-4 h-4 text-gray-400 group-hover:text-[#1581f3] transition-all duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors duration-200 ${
              activeTab === tab.id
                ? 'bg-[#1581f3] text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overview Section */}
            <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
              <h3 className="font-semibold text-[#1581f3] mb-2">📋 Résumé de l'analyse</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {aiAnalysis.overview}
              </p>
            </div>

            {/* User Profile Analysis */}
            {aiAnalysis.userProfileAnalysis && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                  <h4 className="font-medium text-[#1581f3] mb-2">🎯 Évaluation de votre score</h4>
                  <p className="text-gray-300 text-sm">
                    {aiAnalysis.userProfileAnalysis.scoreAssessment}
                  </p>
                </div>

                <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                  <h4 className="font-medium text-[#1581f3] mb-2">📍 Avantages géographiques</h4>
                  <p className="text-gray-300 text-sm">
                    {aiAnalysis.userProfileAnalysis.locationAdvantages}
                  </p>
                </div>
              </div>
            )}

            {/* Recommendation */}
            {aiAnalysis.recommendation && (
              <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                <h3 className="font-semibold text-[#1581f3] mb-2">
                  ⭐ Recommandation: {aiAnalysis.recommendation.preferred}
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  {aiAnalysis.recommendation.reasoning}
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-[#1581f3]">Prochaines étapes:</h4>
                  <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                    {aiAnalysis.recommendation.actionSteps?.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orientations' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Orientation 1 Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2">
                {aiAnalysis.orientation1Analysis?.name || orientation1.name}
              </h3>
              
              <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                <h4 className="font-medium text-[#1581f3] mb-2">✅ Points forts</h4>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  {aiAnalysis.orientation1Analysis?.strengths?.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                <h4 className="font-medium text-red-400 mb-2">⚠️ Défis</h4>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  {aiAnalysis.orientation1Analysis?.challenges?.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>

              {aiAnalysis.orientation1Analysis?.suitabilityScore && (
                <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                  <h4 className="font-medium text-[#1581f3] mb-2">📊 Score d'adéquation</h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-slate-600 rounded-full h-3">
                      <div 
                        className="bg-[#1581f3] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(aiAnalysis.orientation1Analysis.suitabilityScore / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[#1581f3] font-bold">
                      {aiAnalysis.orientation1Analysis.suitabilityScore}/10
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Orientation 2 Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2">
                {aiAnalysis.orientation2Analysis?.name || orientation2.name}
              </h3>
              
              <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                <h4 className="font-medium text-[#1581f3] mb-2">✅ Points forts</h4>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  {aiAnalysis.orientation2Analysis?.strengths?.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                <h4 className="font-medium text-red-400 mb-2">⚠️ Défis</h4>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  {aiAnalysis.orientation2Analysis?.challenges?.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>

              {aiAnalysis.orientation2Analysis?.suitabilityScore && (
                <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                  <h4 className="font-medium text-[#1581f3] mb-2">📊 Score d'adéquation</h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-slate-600 rounded-full h-3">
                      <div 
                        className="bg-[#1581f3] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(aiAnalysis.orientation2Analysis.suitabilityScore / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[#1581f3] font-bold">
                      {aiAnalysis.orientation2Analysis.suitabilityScore}/10
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'action-plan' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">🎯 Plan d'action personnalisé</h3>
            
            {aiAnalysis.recommendation?.actionSteps && (
              <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                <h4 className="font-medium text-[#1581f3] mb-3">📋 Étapes recommandées</h4>
                <ol className="list-decimal list-inside text-gray-300 space-y-2">
                  {aiAnalysis.recommendation.actionSteps.map((step, index) => (
                    <li key={index} className="text-sm">{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {aiAnalysis.recommendation?.alternativeOptions && (
              <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                <h4 className="font-medium text-[#1581f3] mb-3">🔄 Options alternatives</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {aiAnalysis.recommendation.alternativeOptions.map((option, index) => (
                    <li key={index} className="text-sm">{option}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
              <h4 className="font-medium text-[#1581f3] mb-2">💡 Conseils supplémentaires</h4>
              <p className="text-gray-300 text-sm">
                N'hésitez pas à utiliser le chatbot pour poser des questions spécifiques sur votre plan d'action ou pour clarifier certains points de cette analyse.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
