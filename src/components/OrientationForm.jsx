'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createComparison } from '../actions/comparison-actions';
import { getAllOrientations, getAllGovernorates } from '../lib/orientations';

export default function OrientationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    orientation1: '',
    orientation2: '',
    score: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const orientations = getAllOrientations();
  const governorates = getAllGovernorates();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Client-side validation with specific error messages
      if (!formData.orientation1.trim()) {
        throw new Error('Veuillez entrer le code de la première orientation');
      }

      if (!formData.orientation2.trim()) {
        throw new Error('Veuillez entrer le code de la deuxième orientation');
      }

      if (formData.orientation1 === formData.orientation2) {
        throw new Error('Veuillez sélectionner deux orientations différentes');
      }

      // Validate that orientations exist
      const orientation1 = orientations.find(o => o.code === formData.orientation1);
      const orientation2 = orientations.find(o => o.code === formData.orientation2);
      
      if (!orientation1) {
        throw new Error(`Orientation avec le code ${formData.orientation1} non trouvée. Vérifiez le code.`);
      }
      
      if (!orientation2) {
        throw new Error(`Orientation avec le code ${formData.orientation2} non trouvée. Vérifiez le code.`);
      }

      if (!formData.score || isNaN(formData.score)) {
        throw new Error('Veuillez entrer votre score au baccalauréat');
      }

      const scoreNum = parseFloat(formData.score);
      if (scoreNum < 0 || scoreNum > 200) {
        throw new Error('Le score doit être entre 0 et 200 (système tunisien)');
      }

      if (!formData.location.trim()) {
        throw new Error('Veuillez sélectionner votre gouvernorat dans la liste déroulante');
      }

      // Create FormData object
      const submitData = new FormData();
      submitData.append('orientation1', formData.orientation1);
      submitData.append('orientation2', formData.orientation2);
      submitData.append('score', scoreNum.toString()); // Use the parsed number
      submitData.append('location', formData.location);

      // Submit using server action
      const result = await createComparison(submitData);

      if (result && !result.success) {
        throw new Error(result.error);
      }

      // Navigate to comparison page on success
      if (result && result.success && result.comparisonId) {
        router.push(`/comparison/${result.comparisonId}`);
      } else {
        throw new Error('Erreur lors de la création de la comparaison');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Première Orientation - Code Input */}
        <div>
          <label htmlFor="orientation1" className="block text-sm font-medium text-white mb-2">
            Code de la Première Orientation
          </label>
          <input
            type="text"
            id="orientation1"
            name="orientation1"
            value={formData.orientation1}
            onChange={handleChange}
            placeholder="Ex: 34701"
            required
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
          <p className="mt-1 text-sm text-gray-400">
            Entrez le code de l'orientation (5 chiffres)
          </p>
          {formData.orientation1 && (
            <div className="mt-2 p-2 bg-slate-700/50 border border-slate-600 rounded text-sm">
              {(() => {
                const orientation = orientations.find(o => o.code === formData.orientation1);
                return orientation ? (
                  <div>
                    <p className="font-medium text-cyan-300">{orientation.name}</p>
                    <p className="text-cyan-400">{orientation.university}</p>
                  </div>
                ) : (
                  <p className="text-red-400">Code non trouvé</p>
                );
              })()}
            </div>
          )}
        </div>

        {/* Deuxième Orientation - Code Input */}
        <div>
          <label htmlFor="orientation2" className="block text-sm font-medium text-white mb-2">
            Code de la Deuxième Orientation
          </label>
          <input
            type="text"
            id="orientation2"
            name="orientation2"
            value={formData.orientation2}
            onChange={handleChange}
            placeholder="Ex: 34702"
            required
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
          <p className="mt-1 text-sm text-gray-400">
            Entrez le code de l'orientation (5 chiffres)
          </p>
          {formData.orientation2 && (
            <div className="mt-2 p-2 bg-slate-700/50 border border-slate-600 rounded text-sm">
              {(() => {
                const orientation = orientations.find(o => o.code === formData.orientation2);
                return orientation ? (
                  <div>
                    <p className="font-medium text-cyan-300">{orientation.name}</p>
                    <p className="text-cyan-400">{orientation.university}</p>
                  </div>
                ) : (
                  <p className="text-red-400">Code non trouvé</p>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Score au Bac */}
        <div>
          <label htmlFor="score" className="block text-sm font-medium text-white mb-2">
            Score au Baccalauréat
          </label>
          <input
            type="number"
            id="score"
            name="score"
            value={formData.score}
            onChange={handleChange}
            min="0"
            max="200"
            step="0.01"
            placeholder="Ex: 167.305"
            required
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
          <p className="mt-1 text-sm text-gray-400">
            Note sur 200 (système baccalauréat tunisien)
          </p>
        </div>

        {/* Gouvernorat */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-white mb-2">
            Gouvernorat
          </label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option value="">Sélectionnez votre gouvernorat</option>
            {governorates.map((gov, index) => (
              <option key={`gov-${index}`} value={gov} className="bg-slate-700 text-white">
                {gov}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview des orientations sélectionnées */}
      {formData.orientation1 && formData.orientation2 && (
        <div className="bg-slate-700/50 border border-slate-600 rounded-md p-4">
          <h3 className="text-sm font-medium text-white mb-2">
            Orientations à comparer:
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              {(() => {
                const orientation = orientations.find(o => o.code === formData.orientation1);
                return orientation ? (
                  <div>
                    <p className="font-medium text-cyan-300">{orientation.name}</p>
                    <p className="text-cyan-400">{orientation.university}</p>
                    <p className="text-cyan-400">Code: {orientation.code}</p>
                  </div>
                ) : (
                  <p className="text-red-400">Orientation non trouvée</p>
                );
              })()}
            </div>
            <div>
              {(() => {
                const orientation = orientations.find(o => o.code === formData.orientation2);
                return orientation ? (
                  <div>
                    <p className="font-medium text-cyan-300">{orientation.name}</p>
                    <p className="text-cyan-400">{orientation.university}</p>
                    <p className="text-cyan-400">Code: {orientation.code}</p>
                  </div>
                ) : (
                  <p className="text-red-400">Orientation non trouvée</p>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-base font-medium rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Génération en cours...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Comparer les Orientations
            </>
          )}
        </button>
      </div>

      <div className="text-center text-sm text-gray-400">
        <p>
          L'analyse sera générée par IA et prendra quelques secondes.
        </p>
      </div>
    </form>
  );
}
