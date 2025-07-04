'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ComparisonView from '@/components/ComparisonView';
import ChatBot from '@/components/ChatBot';
import AIAnalysisLoader from '@/components/AIAnalysisLoader';
import { getComparison, generateAiAnalysis } from '@/actions/comparison-actions';

export default function ComparisonResults() {
  const params = useParams();
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null); // 'analysis' or 'chat' or null

  useEffect(() => {
    async function loadComparison() {
      try {
        setIsLoading(true);
        setError(null);

        // Get comparison data
        const comparisonData = await getComparison(params.id);
        
        if (!comparisonData) {
          setError('Comparison not found');
          return;
        }

        setComparison(comparisonData);

        // If no AI analysis yet, generate it
        if (!comparisonData.aiAnalysis) {
          setIsGeneratingAI(true);
          const aiResult = await generateAiAnalysis(params.id);
          
          if (aiResult.success) {
            // Refetch updated comparison
            const updatedComparison = await getComparison(params.id);
            setComparison(updatedComparison);
          } else {
            console.error('AI Analysis failed:', aiResult.error);
          }
          setIsGeneratingAI(false);
        }
      } catch (err) {
        console.error('Error loading comparison:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      loadComparison();
    }
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-[#e5e7eb]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-red-900/30 border border-red-500/50 rounded-lg p-8 max-w-md">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-white text-lg font-medium mb-2">Erreur</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.href = '/comparison'}
              className="bg-[#1581f3] hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Retour à la comparaison
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e5e7eb]">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white mb-1">
                Résultats de comparaison
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <span>📊</span>
                  Score: {comparison?.userProfile?.score}/200
                </span>
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  {comparison?.userProfile?.location}
                </span>
                <span className="flex items-center gap-1">
                  <span>📅</span>
                  {comparison?.createdAt && new Date(comparison.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            <div className="mt-3 sm:mt-0">
              <button 
                onClick={() => window.location.href = '/comparison'}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Nouvelle comparaison
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Header */}
      <div className="border-b border-slate-700 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Orientation 1 */}
            <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">
                {comparison?.orientation1?.licence || comparison?.orientation1?.name || 'Orientation 1'}
              </h3>
              <p className="text-sm text-gray-300 mb-2">{comparison?.orientation1?.university || 'Université non spécifiée'}</p>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Code: {comparison?.orientation1?.code || 'Non défini'}</div>
                <div>Hub: {comparison?.orientation1?.hub || 'Non défini'}</div>
                <div>Seuil: {comparison?.orientation1?.bacScores?.[0]?.score2024 || comparison?.orientation1?.seuil || 'Non défini'}/200</div>
              </div>
            </div>

            {/* Orientation 2 */}
            <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">
                {comparison?.orientation2?.licence || comparison?.orientation2?.name || 'Orientation 2'}
              </h3>
              <p className="text-sm text-gray-300 mb-2">{comparison?.orientation2?.university || 'Université non spécifiée'}</p>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Code: {comparison?.orientation2?.code || 'Non défini'}</div>
                <div>Hub: {comparison?.orientation2?.hub || 'Non défini'}</div>
                <div>Seuil: {comparison?.orientation2?.bacScores?.[0]?.score2024 || comparison?.orientation2?.seuil || 'Non défini'}/200</div>
              </div>
            </div>
          </div>

          {/* VS Indicator */}
          <div className="flex justify-center -mt-3 relative">
            <div className="bg-[#1581f3] text-white px-6 py-2 rounded-full text-sm font-bold border border-blue-400 shadow-lg">
              VS
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid gap-8 ${expandedSection ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} ${expandedSection ? 'h-[calc(100vh-200px)]' : 'h-[calc(100vh-300px)]'}`}>
          {/* Left: Comparison Analysis */}
          <div className={`bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden ${expandedSection === 'chat' ? 'hidden' : ''}`}>
            <div className="h-full">
              {!comparison ? (
                <AIAnalysisLoader comparisonId={params.id} />
              ) : (
                <ComparisonView 
                  comparison={comparison} 
                  onExpand={setExpandedSection}
                  isExpanded={expandedSection === 'analysis'}
                />
              )}
            </div>
          </div>

          {/* Right: Chatbot */}
          <div className={`bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden ${expandedSection === 'analysis' ? 'hidden' : ''}`}>
            <div className="h-full">
              {!comparison?.aiAnalysis ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h3 className="text-white text-lg font-medium mb-2">Chargement du chatbot...</h3>
                    <p className="text-gray-400 text-sm">
                      Le chatbot sera activé une fois l'analyse IA terminée
                    </p>
                  </div>
                </div>
              ) : (
                <ChatBot 
                  comparison={comparison} 
                  onExpand={setExpandedSection}
                  isExpanded={expandedSection === 'chat'}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 bg-slate-800/30 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-400">
            <p>
              Analyse générée par IA • Score BAC Tunisien • 
              <span className="ml-2">
                ID: {comparison?.id?.slice(-8)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
