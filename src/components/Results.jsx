import React, { useRef } from 'react';
import { ArrowLeftIcon, RefreshCwIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getScoreLevel } from '../lib/calculator';
import { RecommendationTable } from './RecommendationTable';

export function Results({ track, onReset, onBack, userBacType }) {
  const { results } = useAppContext();
  const resultsRef = useRef(null);

  if (!results) return null;

  const { mg, fb, fs, fg } = results;
  const scoreLevel = getScoreLevel(fg);

  return (
    <div className="py-6">
      <button onClick={onBack} className="flex items-center text-[#e5e7eb] hover:text-white mb-6">
        <ArrowLeftIcon size={20} className="mr-2" />
        Retour
      </button>
      <div ref={resultsRef} className="bg-[#1f2937] rounded-lg p-6 md:p-8 mb-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Résultats</h2>
          <p className="text-lg">{track.name}</p>
        </div>
        <div className="space-y-6">
          <div className="bg-[#111827] p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Moyenne Générale</h3>
            <p className="text-3xl font-bold">{mg.toFixed(2)} / 20</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111827] p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Formule de Base (FB)</h3>
              <p className="text-xl">4 × MG = {fb.toFixed(2)}</p>
            </div>
            <div className="bg-[#111827] p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Formule Spécifique (FS)</h3>
              <p className="text-xl">{fs.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-[#111827] p-6 rounded-lg text-center">
            <h3 className="text-xl font-medium mb-3">Score FG Total</h3>
            <p className="text-5xl font-bold mb-4">{fg.toFixed(2)}</p>
            <div
              className="inline-block px-4 py-2 rounded-full text-white font-medium"
              style={{ backgroundColor: scoreLevel.color }}
            >
              {scoreLevel.text}
            </div>
          </div>
         
        </div>
      </div>
     
      <div className="flex gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <ArrowLeftIcon size={16} className="mr-2" />
          Modifier les notes
        </button>
        <button
          onClick={onReset}
          className="flex items-center bg-[#1581f3] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <RefreshCwIcon size={16} className="mr-2" />
          Nouveau calcul
        </button>
      </div>

      {/* Recommendations Table */}
      <RecommendationTable userScore={fg} userBacType={userBacType} />
    </div>
  );
}
