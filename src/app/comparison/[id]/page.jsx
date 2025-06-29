import { notFound } from 'next/navigation';
import { getComparison, generateAiAnalysis } from '../../../actions/comparison-actions';
import ComparisonView from '../../../components/ComparisonView';
import ChatBot from '../../../components/ChatBot';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Suspense } from 'react';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const comparison = await getComparison(resolvedParams.id);
  
  if (!comparison) {
    return {
      title: 'Comparaison non trouvée',
    };
  }

  return {
    title: `Comparaison: ${comparison.orientation1.name || comparison.orientation1.licence} vs ${comparison.orientation2.name || comparison.orientation2.licence}`,
    description: `Analyse IA de la comparaison entre ${comparison.orientation1.name || comparison.orientation1.licence} et ${comparison.orientation2.name || comparison.orientation2.licence} pour un étudiant avec un score de ${comparison.userProfile.score}/200.`,
  };
}

export default async function ComparisonPage({ params }) {
  const { id } = await params;
  const comparison = await getComparison(id);

  if (!comparison) {
    notFound();
  }

  // Generate AI analysis if it doesn't exist - but don't wait for it during render
  if (!comparison.aiAnalysis) {
    // Don't await - let it generate in the background
    generateAiAnalysis(id).catch(console.error);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Comparaison d'Orientations
                </h1>
              </div>
              <p className="text-gray-300">
                {comparison.orientation1.name || comparison.orientation1.licence} vs {comparison.orientation2.name || comparison.orientation2.licence}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">
                Score: <span className="text-cyan-400 font-semibold">{comparison.userProfile.score}/200</span>
              </div>
              <div className="text-sm text-gray-400">
                Localisation: <span className="text-cyan-400">{comparison.userProfile.location}</span>
              </div>
              <div className="text-sm text-gray-400">
                Créé le: {new Date(comparison.createdAt).toLocaleDateString('fr-TN')}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Comparison Analysis */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 12rem)' }}>
            <div className="p-6 border-b border-slate-600 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex-shrink-0">
              <h2 className="text-xl font-semibold flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analyse IA
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <Suspense fallback={<LoadingSpinner message="Chargement de l'analyse..." />}>
                <ComparisonView comparison={comparison} />
              </Suspense>
            </div>
          </div>

          {/* Right Panel - Chat Assistant */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 12rem)' }}>
            <div className="p-6 border-b border-slate-600 bg-gradient-to-r from-green-600 to-blue-600 text-white flex-shrink-0">
              <h2 className="text-xl font-semibold flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Assistant IA
              </h2>
              <p className="text-sm opacity-90 mt-1">
                Posez vos questions sur cette comparaison
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <Suspense fallback={<LoadingSpinner message="Initialisation du chat..." />}>
                <ChatBot comparison={comparison} />
              </Suspense>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
