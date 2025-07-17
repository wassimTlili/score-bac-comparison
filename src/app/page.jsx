'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useAuthRedirect, RedirectLoadingScreen } from '@/hooks/useAuthRedirect';

export default function Home() {
  const router = useRouter();
  const { isRedirecting, isReady } = useAuthRedirect({
    redirectIfHasProfile: true
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  
  const welcomeTexts = [
    "مرحبا طالب! 👋",
    "اكتشف مستقبلك الأكاديمي! 🎓",
    "رحلتك الجامعية تبدأ هنا! ✨"
  ];

  // Auto-redirect logic (handled by useAuthRedirect hook now)

  useEffect(() => {
    if (isReady) {
      setIsVisible(true);
      let interval;
      if (isAutoPlay) {
        interval = setInterval(() => {
          setTextIndex((prev) => (prev + 1) % welcomeTexts.length);
        }, 3000);
      }
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, isReady]);

  const handleDotClick = (index) => {
    if (isRedirecting) return; // Prevent interaction while redirecting
    setTextIndex(index);
    setIsAutoPlay(false);
    // Resume auto-play after 5 seconds of inactivity
    setTimeout(() => setIsAutoPlay(true), 5000);
  };

  // Show redirecting screen while checking/redirecting
  if (isRedirecting || !isReady) {
    return <RedirectLoadingScreen message="مرحباً بعودتك! جاري توجيهك إلى الصفحة المناسبة..." />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        
        {/* Main Content Container */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left side - Speech Bubble */}
          <div className={`flex-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative">
              <div className="bg-gray-800 text-white rounded-3xl p-12 relative shadow-2xl border-2 border-cyan-400 max-w-lg">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-6 text-cyan-300 transition-all duration-500">
                    {welcomeTexts[textIndex]}
                  </h1>
                  <p className="text-xl opacity-90 leading-relaxed mb-8">
                    هل تريد معرفة التوجهات الجامعية المناسبة لنقاطك؟
                  </p>
                </div>
                
                {/* Navigation Dots */}
                <div className="flex justify-center gap-3 mt-6">
                  {welcomeTexts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                        index === textIndex 
                          ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' 
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                      aria-label={`Go to message ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Bubble tail pointing right */}
                <div className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 w-0 h-0 border-l-8 border-t-6 border-b-6 border-l-gray-800 border-t-transparent border-b-transparent"></div>
              </div>
              
              {/* Button under the bubble */}
              <div className="mt-8 text-center">
                <Link
                  href="/stepper"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-cyan-400/25 hover:scale-105"
                >
                  <span>ابدأ الآن</span>
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm">→</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Right side - Robot Image */}
          <div className={`flex-1 flex justify-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative">
              <img
                src="/robot-assistant.png"
                alt="Robot Assistant"
                className="w-96 h-96 object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              />
              
              {/* Floating elements around robot */}
              <div className="absolute -top-4 -right-4 w-6 h-6 bg-blue-400 rounded-full animate-bounce delay-1000"></div>
              <div className="absolute -bottom-4 -left-4 w-4 h-4 bg-purple-400 rounded-full animate-bounce delay-1500"></div>
              <div className="absolute top-1/2 -left-8 w-5 h-5 bg-cyan-400 rounded-full animate-bounce delay-2000"></div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-cyan-400 transition-all duration-300">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">دقة عالية</h3>
              <p className="text-gray-400">حسابات دقيقة لنقاطك</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-blue-400 transition-all duration-300">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold mb-2">سرعة فائقة</h3>
              <p className="text-gray-400">نتائج فورية ومباشرة</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-purple-400 transition-all duration-300">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="text-lg font-semibold mb-2">إرشاد ذكي</h3>
              <p className="text-gray-400">توصيات مخصصة لك</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}