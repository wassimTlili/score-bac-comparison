'use client';

import { useState } from 'react';
import AIAnalysisLoader from './AIAnalysisLoader';

export default function ComparisonView({ comparison }) {
  if (!comparison.aiAnalysis) {
    return <AIAnalysisLoader comparisonId={comparison.id} />;
  }

  const { aiAnalysis } = comparison;

  // Safety check for AI analysis structure
  if (!aiAnalysis.orientation1Analysis || !aiAnalysis.orientation2Analysis) {
    return (    <div className="p-6">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white font-medium">Finalisation de l'analyse IA...</p>
        <p className="text-sm text-gray-300 mt-2">Structure d'analyse en cours de génération</p>
      </div>
    </div>
    );
  }

  const getSuitabilityColor = (score) => {
    if (score >= 8) return 'text-green-100 bg-green-600/80 border border-green-400';
    if (score >= 6) return 'text-yellow-100 bg-yellow-600/80 border border-yellow-400';
    return 'text-red-100 bg-red-600/80 border border-red-400';
  };

  const getAdmissionDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'facile': return 'text-green-100 bg-green-600/80 border border-green-400';
      case 'moyenne': return 'text-yellow-100 bg-yellow-600/80 border border-yellow-400';
      case 'difficile': return 'text-red-100 bg-red-600/80 border border-red-400';
      default: return 'text-gray-100 bg-gray-600/80 border border-gray-400';
    }
  };

  return (
    <div className="p-6 pb-8 space-y-6 h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Analyse Complète
        </h3>
      </div>

      {/* Overview */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-cyan-500/30 rounded-lg p-4 shadow-lg">
        <h4 className="font-medium text-cyan-300 mb-3 text-lg">Vue d'ensemble</h4>
        <p className="text-gray-200 leading-relaxed text-base">{aiAnalysis.overview}</p>
      </div>

      {/* Orientations Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Orientation 1 */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-cyan-500/30 rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-cyan-300 text-lg">
              {comparison.orientation1.name}
            </h4>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSuitabilityColor(aiAnalysis.orientation1Analysis?.suitabilityScore || 0)}`}>
              {aiAnalysis.orientation1Analysis?.suitabilityScore || 0}/10
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-semibold text-green-300 mb-2 uppercase tracking-wide">✓ Forces</h5>
              <ul className="text-sm text-gray-200 space-y-2">
                {(aiAnalysis.orientation1Analysis.strengths || []).map((strength, index) => (
                  <li key={index} className="flex items-start bg-green-900/20 rounded p-2">
                    <span className="text-green-400 mr-3 mt-0.5">●</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-orange-300 mb-2 uppercase tracking-wide">⚠ Défis</h5>
              <ul className="text-sm text-gray-200 space-y-2">
                {(aiAnalysis.orientation1Analysis.challenges || []).map((challenge, index) => (
                  <li key={index} className="flex items-start bg-orange-900/20 rounded p-2">
                    <span className="text-orange-400 mr-3 mt-0.5">●</span>
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-blue-300 mb-2 uppercase tracking-wide">🎯 Débouchés</h5>
              <ul className="text-sm text-gray-200 space-y-2">
                {(aiAnalysis.orientation1Analysis.careerProspects || []).slice(0, 3).map((prospect, index) => (
                  <li key={index} className="flex items-start bg-blue-900/20 rounded p-2">
                    <span className="text-blue-400 mr-3 mt-0.5">●</span>
                    <span>{prospect}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Orientation 2 */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-cyan-500/30 rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-cyan-300 text-lg">
              {comparison.orientation2.name}
            </h4>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSuitabilityColor(aiAnalysis.orientation2Analysis?.suitabilityScore || 0)}`}>
              {aiAnalysis.orientation2Analysis?.suitabilityScore || 0}/10
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-semibold text-green-300 mb-2 uppercase tracking-wide">✓ Forces</h5>
              <ul className="text-sm text-gray-200 space-y-2">
                {(aiAnalysis.orientation2Analysis.strengths || []).map((strength, index) => (
                  <li key={index} className="flex items-start bg-green-900/20 rounded p-2">
                    <span className="text-green-400 mr-3 mt-0.5">●</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-orange-300 mb-2 uppercase tracking-wide">⚠ Défis</h5>
              <ul className="text-sm text-gray-200 space-y-2">
                {(aiAnalysis.orientation2Analysis.challenges || []).map((challenge, index) => (
                  <li key={index} className="flex items-start bg-orange-900/20 rounded p-2">
                    <span className="text-orange-400 mr-3 mt-0.5">●</span>
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-blue-300 mb-2 uppercase tracking-wide">🎯 Débouchés</h5>
              <ul className="text-sm text-gray-200 space-y-2">
                {(aiAnalysis.orientation2Analysis.careerProspects || []).slice(0, 3).map((prospect, index) => (
                  <li key={index} className="flex items-start bg-blue-900/20 rounded p-2">
                    <span className="text-blue-400 mr-3 mt-0.5">●</span>
                    <span>{prospect}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/50 rounded-lg p-5 shadow-lg">
        <h4 className="font-semibold text-cyan-300 mb-3 text-lg flex items-center">
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recommandation: <span className="text-white ml-2">{aiAnalysis.recommendation.preferred}</span>
        </h4>
        <p className="text-gray-200 mb-4 text-base leading-relaxed">{aiAnalysis.recommendation.reasoning}</p>
        
        <h5 className="text-sm font-semibold text-cyan-300 mb-3 uppercase tracking-wide">📋 Étapes recommandées:</h5>
        <ol className="text-sm text-gray-200 space-y-3">
          {(aiAnalysis.recommendation?.actionSteps || []).map((step, index) => (
            <li key={index} className="flex items-start bg-slate-800/50 rounded-lg p-3">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5 font-bold">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Universities Comparison */}
      {aiAnalysis.universitiesComparison && aiAnalysis.universitiesComparison.length > 0 && (
        <div>
          <h4 className="font-semibold text-cyan-300 mb-4 text-lg">🏛️ Comparaison des Universités</h4>
          <div className="space-y-4">
            {(aiAnalysis.universitiesComparison || []).map((uni, index) => (
              <div key={index} className="bg-gradient-to-r from-slate-800 to-slate-700 border border-cyan-500/30 rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-white text-lg">{uni.university}</h5>
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getAdmissionDifficultyColor(uni.admissionDifficulty)}`}>
                      {uni.admissionDifficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-900/30 text-cyan-300 border border-cyan-500/50">
                      {uni.reputation}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-200 space-y-2">
                  <p><strong className="text-cyan-300">Orientation:</strong> <span className="text-white">{uni.orientation}</span></p>
                  <p><strong>Localisation:</strong> {uni.location}</p>
                  <p><strong>Infrastructures:</strong> {uni.facilities}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Insights */}
      {aiAnalysis.scoreInsights && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Insights sur votre Score</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-yellow-800">
                <strong>Admissibilité:</strong>
              </p>
              <ul className="text-yellow-700 mt-1 space-y-1">
                <li>
                  {comparison.orientation1.name}: {aiAnalysis.scoreInsights.canApplyTo1 ? '✅ Éligible' : '❌ Score insuffisant'}
                </li>
                <li>
                  {comparison.orientation2.name}: {aiAnalysis.scoreInsights.canApplyTo2 ? '✅ Éligible' : '❌ Score insuffisant'}
                </li>
              </ul>
            </div>
            <div>
              <p className="text-yellow-800">
                <strong>Niveau de votre score:</strong> {aiAnalysis.scoreInsights.scoreAdvantage}
              </p>
              {aiAnalysis.scoreInsights.improvementNeeded > 0 && (
                <p className="text-yellow-700 mt-1">
                  Points à améliorer: +{aiAnalysis.scoreInsights.improvementNeeded.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-gray-500 border-t pt-4">
        <p>
          Analyse générée le {new Date(aiAnalysis.generatedAt).toLocaleString('fr-TN')}
          {aiAnalysis.isFallback && ' (analyse de secours)'}
        </p>
        {aiAnalysis.modelUsed && (
          <p>Modèle utilisé: {aiAnalysis.modelUsed}</p>
        )}
      </div>
    </div>
  );
}
