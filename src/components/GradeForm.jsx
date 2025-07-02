import React, { useState } from 'react';
import { ArrowLeftIcon, CalculatorIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { trackData, calculateScores } from '../lib/calculator';

export function GradeForm({ track, onBack, onSubmit }) {
  const { grades, setGrades, setResults } = useAppContext();
  const [localGrades, setLocalGrades] = useState(grades);
  const [errors, setErrors] = useState({});

  const trackInfo = trackData[track.id];
  const subjects = trackInfo.subjects;

  const handleGradeChange = (subjectId, value) => {
    const numValue = parseFloat(value);
    
    setLocalGrades(prev => ({
      ...prev,
      [subjectId]: value
    }));

    // Clear error if grade becomes valid
    if (numValue >= 0 && numValue <= 20) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[subjectId];
        return newErrors;
      });
    }
  };

  const validateGrades = () => {
    const newErrors = {};
    let hasErrors = false;

    Object.keys(subjects).forEach(subjectId => {
      const grade = parseFloat(localGrades[subjectId]);
      if (isNaN(grade) || grade < 0 || grade > 20) {
        newErrors[subjectId] = 'Note invalide (0-20)';
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form submitted!'); // Debug log
    
    if (!validateGrades()) {
      console.log('Validation failed'); // Debug log
      return;
    }

    // Convert grades to numbers
    const numericGrades = {};
    Object.keys(subjects).forEach(subjectId => {
      numericGrades[subjectId] = parseFloat(localGrades[subjectId]);
    });

    console.log('Numeric grades:', numericGrades); // Debug log

    // Calculate scores with correct parameter order: grades first, then trackId
    const results = calculateScores(numericGrades, track.id);
    
    console.log('Calculation results:', results); // Debug log
    
    if (!results) {
      console.error('Calculation failed');
      return;
    }

    // Update context
    setGrades(numericGrades);
    setResults(results);
    
    // Call parent callback
    onSubmit();
  };

  const isFormValid = () => {
    return Object.keys(subjects).every(subjectId => {
      const grade = parseFloat(localGrades[subjectId]);
      return !isNaN(grade) && grade >= 0 && grade <= 20;
    });
  };

  return (
    <div className="py-6">
      <button 
        onClick={onBack} 
        className="flex items-center text-[#e5e7eb] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeftIcon size={20} className="mr-2" />
        Retour
      </button>

      <div className="bg-[#1f2937] rounded-lg p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Saisie des notes - {track.name}
          </h2>
          <p className="text-[#9ca3af]">
            Entrez vos notes pour chaque matière (0 à 20)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(subjects).map(([subjectId, subject]) => (
              <div key={subjectId} className="space-y-2">
                <label className="block text-sm font-medium text-[#e5e7eb]">
                  {subject.name}
                  <span className="text-[#6b7280] ml-1">(Coef. {subject.coef})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.01"
                  value={localGrades[subjectId] || ''}
                  onChange={(e) => handleGradeChange(subjectId, e.target.value)}
                  className={`w-full px-4 py-3 bg-[#111827] border rounded-lg text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors[subjectId] 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-[#374151] hover:border-[#4b5563]'
                  }`}
                  placeholder="Ex: 15.5"
                />
                {errors[subjectId] && (
                  <p className="text-red-400 text-sm">{errors[subjectId]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`flex items-center px-8 py-3 rounded-lg font-medium transition-all ${
                isFormValid()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-[#374151] text-[#6b7280] cursor-not-allowed'
              }`}
            >
              <CalculatorIcon size={20} className="mr-2" />
              Calculer les résultats
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
