'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AIAnalysisLoader({ comparisonId }) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check every 3 seconds if analysis is ready
    if (seconds > 0 && seconds % 3 === 0) {
      router.refresh();
    }
  }, [seconds, router]);

  return (
    <div className="p-6">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Génération de l'analyse IA en cours...</p>
        <p className="text-sm text-gray-500 mt-2">
          Cela peut prendre quelques secondes ({seconds}s)
        </p>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, (seconds / 10) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
