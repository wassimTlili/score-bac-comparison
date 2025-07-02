import React, { useState, useMemo } from 'react';
import { scoresData } from '../data/scoresData';

export function RecommendationTable({ userScore, userBacType }) {
  const [selectedHub, setSelectedHub] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedLicence, setSelectedLicence] = useState('');

  // Get unique values for filters
  const hubs = useMemo(() => [...new Set(scoresData.map(r => r.hub))], []);
  const universities = useMemo(() => [...new Set(scoresData.map(r => r.university))], []);
  const licences = useMemo(() => [...new Set(scoresData.map(r => r.licence))], []);

  // Filter recommendations
  const recommendations = useMemo(() => {
    return scoresData.filter(r => {
      // Filter by user's BAC type
      if (r.bacType !== userBacType) return false;
      
      // Filter by user score (show programs they can potentially access)
      if (userScore < r.score2024 - 10) return false; // Show programs within 10 points
      
      // Apply additional filters
      if (selectedHub && r.hub !== selectedHub) return false;
      if (selectedUniversity && r.university !== selectedUniversity) return false;
      if (selectedLicence && r.licence !== selectedLicence) return false;
      
      return true;
    }).sort((a, b) => a.score2024 - b.score2024); // Sort by score ascending
  }, [userScore, userBacType, selectedHub, selectedUniversity, selectedLicence]);

  return (
    <div className="bg-[#1f2937] rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-6 text-center text-[#1581f3]">
        🎓 التوصيات حسب مجموعك ({userBacType})
      </h3>
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedHub}
          onChange={e => setSelectedHub(e.target.value)}
          className="rounded-lg shadow-sm border border-gray-300 focus:ring-2 focus:ring-[#1581f3] focus:border-[#1581f3] px-4 py-2 bg-[#1f2937] text-white transition w-full md:w-auto"
        >
          <option value="">كل الأقطاب الجامعية</option>
          {hubs.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <select
          value={selectedUniversity}
          onChange={e => setSelectedUniversity(e.target.value)}
          className="rounded-lg shadow-sm border border-gray-300 focus:ring-2 focus:ring-[#1581f3] focus:border-[#1581f3] px-4 py-2 bg-[#1f2937] text-white transition w-full md:w-auto"
        >
          <option value="">كل الجامعات</option>
          {universities.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select
          value={selectedLicence}
          onChange={e => setSelectedLicence(e.target.value)}
          className="rounded-lg shadow-sm border border-gray-300 focus:ring-2 focus:ring-[#1581f3] focus:border-[#1581f3] px-4 py-2 bg-[#1f2937] text-white transition w-full md:w-auto"
        >
          <option value="">كل الإجازات</option>
          {licences.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-[#1f2937] text-white rounded-lg">
          <thead>
            <tr className="bg-[#1581f3] text-white sticky top-0 z-10">
              <th className="py-3 px-4 text-sm font-semibold">الكود</th>
              <th className="py-3 px-4 text-sm font-semibold">القطب</th>
              <th className="py-3 px-4 text-sm font-semibold">الجامعة</th>
              <th className="py-3 px-4 text-sm font-semibold">الإجازة</th>
              <th className="py-3 px-4 text-sm font-semibold">نوع الباك</th>
              <th className="py-3 px-4 text-sm font-semibold">2024</th>
              <th className="py-3 px-4 text-sm font-semibold">2023</th>
              <th className="py-3 px-4 text-sm font-semibold">2022</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-[#1581f3] font-bold">
                  لا توجد نتائج مطابقة
                </td>
              </tr>
            )}
            {recommendations.map((r, i) => (
              <tr
                key={i}
                className={`transition hover:bg-[#22304a] ${
                  userScore >= r.score2024 ? 'bg-green-900/20' : 
                  userScore >= r.score2024 - 5 ? 'bg-yellow-900/20' : 
                  'bg-[#1f2937]'
                } ${i % 2 === 0 ? 'bg-[#1f2937]' : 'bg-[#232e41]'}`}
              >
                <td className="py-3 px-4 font-mono">{r.code}</td>
                <td className="py-3 px-4">{r.hub}</td>
                <td className="py-3 px-4">{r.university}</td>
                <td className="py-3 px-4">{r.licence}</td>
                <td className="py-3 px-4">{r.bacType}</td>
                <td className="py-3 px-4 font-bold text-[#10b981]">{r.score2024}</td>
                <td className="py-3 px-4">{r.score2023}</td>
                <td className="py-3 px-4">{r.score2022}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
