'use client';

import { useState } from 'react';
import { getAllOrientations } from '../lib/orientations';

export default function OrientationSearch({ onSelect, placeholder = "Rechercher une orientation..." }) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const orientations = getAllOrientations();

  const filteredOrientations = orientations.filter(orientation => {
    if (!query || query.length < 2) return false;
    
    const searchText = query.toLowerCase();
    return (
      orientation.name.toLowerCase().includes(searchText) ||
      orientation.university.toLowerCase().includes(searchText) ||
      orientation.code.includes(searchText) ||
      orientation.hub.toLowerCase().includes(searchText)
    );
  }).slice(0, 10); // Limit to 10 results

  const handleSelect = (orientation) => {
    onSelect(orientation);
    setQuery(`${orientation.code} - ${orientation.name}`);
    setShowResults(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      
      {showResults && filteredOrientations.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOrientations.map((orientation) => (
            <div
              key={orientation.code}
              onClick={() => handleSelect(orientation)}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{orientation.name}</p>
                  <p className="text-xs text-gray-600">{orientation.university}</p>
                  <p className="text-xs text-blue-600">Code: {orientation.code}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showResults && query.length >= 2 && filteredOrientations.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
          <p className="text-sm text-gray-500">Aucune orientation trouvée</p>
        </div>
      )}
    </div>
  );
}
