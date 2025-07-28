'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { CalendarIcon, CalendarDays, MapPin, GraduationCap, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllGovernorates } from '../../lib/orientations';
import { trackData } from '@/utils/calculations';
import { useTranslation } from '../i18n/client';
import { useAuthRedirect, RedirectLoadingScreen } from '@/hooks/useAuthRedirect';
import dynamic from 'next/dynamic';

// Dynamically import the 3D Nexie with error boundary
const FloatingNexie = dynamic(() => import('@/components/FloatingNexie'), {
  ssr: false,
  loading: () => (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
      </div>
    </div>
  )
});

export default function StepperPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { isRedirecting, isReady, authState } = useAuthRedirect({
    requireAuth: false, // Allow unauthenticated users to see this page
    redirectIfHasProfile: true // But redirect authenticated users who already have a profile
  });

  // Get auth variables from authState for compatibility
  const isLoaded = authState?.isLoaded || isReady;
  const isSignedIn = authState?.isSignedIn || false;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    filiere: '',
    notes: {
      mathematics: '',
      physics: '',
      chemistry: '',
      biology: '',
      french: '',
      arabic: '',
      english: '',
      philosophy: '',
      history: '',
      geography: '',
      algorithmics: '',
      technique: '',
      economics: '',
      management: '',
      sportTheory: '',
      sportPractical: '',
      ict: '',
      database: '',
      physicalEducation: '',
      sport: ''
    },
    birthday: null,
    gender: '',
    governorate: '',
    session: '',
    optionalSubject: ''
  });
  const [isVisible, setIsVisible] = useState(true);

  const governorates = getAllGovernorates();

  const filieres = [
    { id: 'math', name: t('stepper.branches.math', 'رياضيات'), icon: '📐', color: 'cyan' },
    { id: 'science', name: t('stepper.branches.science', 'علوم تجريبية'), icon: '🔬', color: 'blue' },
    { id: 'info', name: t('stepper.branches.info', 'علوم إعلامية'), icon: '💻', color: 'purple' },
    { id: 'tech', name: t('stepper.branches.tech', 'تقنية'), icon: '⚙️', color: 'green' },
    { id: 'eco', name: t('stepper.branches.eco', 'إقتصاد وتصرف'), icon: '📈', color: 'orange' },
    { id: 'lettres', name: t('stepper.branches.lettres', 'آداب'), icon: '📚', color: 'pink' },
    { id: 'sport', name: t('stepper.branches.sport', 'رياضة'), icon: '🏃', color: 'red' }
  ];

  const optionalSubjects = [
    { id: 'italian', name: t('stepper.optionalSubjects.italian', 'الإيطالية'), icon: '🇮🇹', flag: '🇮🇹' },
    { id: 'german', name: t('stepper.optionalSubjects.german', 'الألمانية'), icon: '🇩🇪', flag: '🇩🇪' },
    { id: 'spanish', name: t('stepper.optionalSubjects.spanish', 'الإسبانية'), icon: '🇪🇸', flag: '🇪🇸' },
    { id: 'english', name: t('stepper.optionalSubjects.english', 'الإنجليزية'), icon: '🇬🇧', flag: '🇬🇧' },
    { id: 'russian', name: t('stepper.optionalSubjects.russian', 'الروسية'), icon: '🇷🇺', flag: '🇷🇺' },
    { id: 'chinese', name: t('stepper.optionalSubjects.chinese', 'الصينية'), icon: '🇨🇳', flag: '🇨🇳' }
  ];

  const steps = [
    { 
      id: 1, 
      title: t('stepper.chooseBranch', 'اختر الشعبة'), 
      icon: GraduationCap, 
      description: t('stepper.chooseBranchDesc', 'اختر شعبة البكالوريا الخاصة بك'),
      message: t('stepper.branchImportantMessage', 'الشعبة مهمة جداً لتحديد التوجهات المناسبة لك! 🎯')
    },
    { 
      id: 2, 
      title: t('stepper.enterGrades', 'النقاط'), 
      icon: '📊', 
      description: t('stepper.enterGradesDesc', 'أدخل نقاطك في المواد المختلفة'),
      message: t('stepper.accurateGradesMessage', 'النقاط الدقيقة تساعد في حساب معدلك النهائي! 🎯')
    },
    { 
      id: 3, 
      title: t('stepper.birthday', 'تاريخ الميلاد'), 
      icon: CalendarDays, 
      description: t('stepper.personalInfoDesc', 'أدخل تاريخ ميلادك'),
      message: t('stepper.birthdayMessage', 'العمر مهم في بعض التخصصات مثل الطيران والأمن! ⏰')
    },
    { 
      id: 4, 
      title: t('stepper.gender', 'الجنس'), 
      icon: '👤', 
      description: t('stepper.genderDesc', 'اختر جنسك'),
      message: t('stepper.genderMessage', 'الجنس مهم في بعض التخصصات مثل الأمن والعسكرية! 🔒')
    },
    { 
      id: 5, 
      title: t('stepper.governorate', 'الولاية'), 
      icon: MapPin, 
      description: t('stepper.governorateDesc', 'اختر ولايتك'),
      message: t('stepper.governorateMessage', 'الولاية تؤثر على خياراتك الجامعية المتاحة! 🏛️')
    },
    { 
      id: 6, 
      title: t('stepper.session', 'نوع الدورة'), 
      icon: '🎓', 
      description: t('stepper.sessionDesc', 'اختر نوع الدورة'),
      message: t('stepper.sessionMessage', 'الدورة الرئيسية لها أولوية في القبول! 📝')
    },
    { 
      id: 7, 
      title: t('stepper.selectOptionalSubject', 'المادة الاختيارية'), 
      icon: Languages, 
      description: t('stepper.optionalSubjectDesc', 'اختر المادة الاختيارية'),
      message: t('stepper.optionalSubjectMessage', 'المادة الاختيارية تضيف نقاط إضافية لمعدلك! ⭐')
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step completed, navigate to review page with data
      navigateToReview();
    }
  };

  const navigateToReview = () => {
    // Store data in localStorage for the review page
    localStorage.setItem('stepperFormData', JSON.stringify(formData));
    
    // Navigate to review page
    router.push('/stepper/review');
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎓</div>
              <h2 className="text-3xl font-bold text-cyan-300 mb-2">{t('stepper.chooseBranch', 'اختر شعبة البكالوريا')}</h2>
              <p className="text-gray-300">{t('stepper.chooseBranchDesc', 'اختر الشعبة التي تدرس بها')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filieres.map((filiere) => (
                <div
                  key={filiere.id}
                  onClick={() => setFormData(prev => ({ ...prev, filiere: filiere.id }))}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    formData.filiere === filiere.id
                      ? 'border-cyan-400 bg-cyan-400/20 shadow-lg shadow-cyan-400/25'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{filiere.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{filiere.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-3xl font-bold text-cyan-300 mb-2">{t('stepper.enterGrades', 'أدخل نقاطك')}</h2>
              <p className="text-gray-300">{t('stepper.enterGradesDesc', 'أدخل نقاطك في المواد المختلفة')}</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              {formData.filiere ? (
                (() => {
                  const currentTrackSubjects = trackData[formData.filiere]?.subjects || {};
                  
                  // Map calculation subjects to form fields and translated names
                  const subjectMapping = {
                    math: { field: 'mathematics', name: t('stepper.subjects.mathematics', 'الرياضيات'), icon: '📐' },
                    physics: { field: 'physics', name: t('stepper.subjects.physics', 'الفيزياء'), icon: '⚛️' },
                    svt: { field: 'biology', name: t('stepper.subjects.biology', 'علوم الطبيعة والحياة'), icon: '🔬' },
                    french: { field: 'french', name: t('stepper.subjects.french', 'الفرنسية'), icon: '🇫🇷' },
                    arabic: { field: 'arabic', name: t('stepper.subjects.arabic', 'العربية'), icon: '🇹🇳' },
                    english: { field: 'english', name: t('stepper.subjects.english', 'الإنجليزية'), icon: '🇬🇧' },
                    philosophy: { field: 'philosophy', name: t('stepper.subjects.philosophy', 'الفلسفة'), icon: '🤔' },
                    hg: { field: 'history', name: t('stepper.subjects.history', 'التاريخ والجغرافيا'), icon: '📜' },
                    algo: { field: 'algorithmics', name: t('stepper.subjects.algorithmics', 'الخوارزميات'), icon: '💻' },
                    technique: { field: 'technique', name: t('stepper.subjects.technique', 'التقنية'), icon: '⚙️' },
                    eco: { field: 'economics', name: t('stepper.subjects.economics', 'الإقتصاد'), icon: '📈' },
                    gestion: { field: 'management', name: t('stepper.subjects.management', 'التصرف'), icon: '📊' },
                    sportTheory: { field: 'sportTheory', name: t('stepper.subjects.sportTheory', 'الرياضة النظرية'), icon: '📚' },
                    sportPractical: { field: 'sportPractical', name: t('stepper.subjects.sportPractical', 'الرياضة التطبيقية'), icon: '🏃' },
                    tic: { field: 'ict', name: t('stepper.subjects.ict', 'تكنولوجيا المعلومات'), icon: '💻' },
                    bdd: { field: 'database', name: t('stepper.subjects.database', 'قواعد البيانات'), icon: '🗄️' },
                    ep: { field: 'physicalEducation', name: t('stepper.subjects.physicalEducation', 'التربية البدنية'), icon: '🏃' },
                    chemistry: { field: 'chemistry', name: t('stepper.subjects.chemistry', 'الكيمياء'), icon: '🧪' },
                    sport: { field: 'sport', name: t('stepper.subjects.sport', 'الرياضة'), icon: '🏃' }
                  };

                  const subjectsToShow = Object.entries(currentTrackSubjects).map(([calcSubject, subjectData]) => ({
                    calcSubject,
                    field: subjectMapping[calcSubject]?.field || calcSubject,
                    name: subjectMapping[calcSubject]?.name || subjectData.name,
                    icon: subjectMapping[calcSubject]?.icon || '📚',
                    coefficient: subjectData.coef
                  }));

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subjectsToShow.map(({ calcSubject, field, name, icon, coefficient }) => (
                        <div key={`subject-${calcSubject}-${field}`} className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <label htmlFor={`input-${calcSubject}-${field}`} className="text-sm font-medium text-white flex items-center">
                              <span className="mr-2">{icon}</span>
                              {name}
                            </label>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                              معامل {coefficient}
                            </span>
                          </div>
                          <input
                            id={`input-${calcSubject}-${field}`}
                            type="number"
                            min="0"
                            max="20"
                            step="0.25"
                            value={formData.notes[field] || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              notes: { ...prev.notes, [field]: e.target.value }
                            }))}
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="0-20"
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">{t('stepper.pleaseSelectBranchFirst', 'الرجاء اختيار الشعبة أولاً')}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-3xl font-bold text-cyan-300 mb-2">{t('stepper.birthdateTitle', 'تاريخ الميلاد')}</h2>
              <p className="text-gray-300">{t('stepper.birthdateDescription', 'أدخل تاريخ ميلادك')}</p>
            </div>
            
            <div className="flex justify-center">
              <div className="w-80 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {/* Day */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('stepper.day', 'اليوم')}</label>
                    <select
                      value={formData.birthday ? formData.birthday.getDate() : ''}
                      onChange={(e) => {
                        const day = parseInt(e.target.value);
                        if (day && formData.birthday) {
                          const newDate = new Date(formData.birthday);
                          newDate.setDate(day);
                          setFormData(prev => ({ ...prev, birthday: newDate }));
                        } else if (day) {
                          const newDate = new Date();
                          newDate.setDate(day);
                          newDate.setMonth(0); // January
                          newDate.setFullYear(2000); // Default year
                          setFormData(prev => ({ ...prev, birthday: newDate }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      <option value="">{t('stepper.selectDay', 'اليوم')}</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  {/* Month */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('stepper.month', 'الشهر')}</label>
                    <select
                      value={formData.birthday ? formData.birthday.getMonth() + 1 : ''}
                      onChange={(e) => {
                        const month = parseInt(e.target.value) - 1; // Months are 0-indexed
                        if (month >= 0 && formData.birthday) {
                          const newDate = new Date(formData.birthday);
                          newDate.setMonth(month);
                          setFormData(prev => ({ ...prev, birthday: newDate }));
                        } else if (month >= 0) {
                          const newDate = new Date();
                          newDate.setMonth(month);
                          newDate.setDate(1);
                          newDate.setFullYear(2000); // Default year
                          setFormData(prev => ({ ...prev, birthday: newDate }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      <option value="">{t('stepper.selectMonth', 'الشهر')}</option>
                      {[
                        t('stepper.months.january', 'جانفي'), t('stepper.months.february', 'فيفري'), t('stepper.months.march', 'مارس'), 
                        t('stepper.months.april', 'أفريل'), t('stepper.months.may', 'ماي'), t('stepper.months.june', 'جوان'),
                        t('stepper.months.july', 'جويلية'), t('stepper.months.august', 'أوت'), t('stepper.months.september', 'سبتمبر'), 
                        t('stepper.months.october', 'أكتوبر'), t('stepper.months.november', 'نوفمبر'), t('stepper.months.december', 'ديسمبر')
                      ].map((month, index) => (
                        <option key={index + 1} value={index + 1}>{month}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('stepper.year', 'السنة')}</label>
                    <select
                      value={formData.birthday ? formData.birthday.getFullYear() : ''}
                      onChange={(e) => {
                        const year = parseInt(e.target.value);
                        if (year && formData.birthday) {
                          const newDate = new Date(formData.birthday);
                          newDate.setFullYear(year);
                          setFormData(prev => ({ ...prev, birthday: newDate }));
                        } else if (year) {
                          const newDate = new Date();
                          newDate.setFullYear(year);
                          newDate.setMonth(0); // January
                          newDate.setDate(1);
                          setFormData(prev => ({ ...prev, birthday: newDate }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      <option value="">{t('stepper.selectYear', 'السنة')}</option>
                      {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - 15 - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Display selected date */}
                {formData.birthday && (
                  <div className="text-center p-3 bg-cyan-500/20 border border-cyan-400/30 rounded-xl">
                    <div className="text-cyan-300 font-medium">
                      {t('stepper.selectedDate', 'التاريخ المختار:')} {formData.birthday.toLocaleDateString('ar-DZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">👤</div>
              <h2 className="text-3xl font-bold text-cyan-300 mb-2">{t('stepper.gender', 'الجنس')}</h2>
              <p className="text-gray-300">{t('stepper.genderDesc', 'اختر جنسك')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                className={`p-8 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  formData.gender === 'male'
                    ? 'border-blue-400 bg-blue-400/20 shadow-lg shadow-blue-400/25'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">👨</div>
                  <h3 className="text-xl font-semibold text-white">{t('stepper.male', 'ذكر')}</h3>
                </div>
              </div>
              
              <div
                onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                className={`p-8 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  formData.gender === 'female'
                    ? 'border-pink-400 bg-pink-400/20 shadow-lg shadow-pink-400/25'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">👩</div>
                  <h3 className="text-xl font-semibold text-white">{t('stepper.female', 'أنثى')}</h3>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏛️</div>
              <h2 className="text-3xl font-bold text-cyan-300 mb-2">{t('stepper.governorate', 'الولاية')}</h2>
              <p className="text-gray-300">{t('stepper.governorateDesc', 'اختر ولايتك')}</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <select
                value={formData.governorate}
                onChange={(e) => setFormData(prev => ({ ...prev, governorate: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="">{t('stepper.governorateDesc', 'اختر ولايتك')}</option>
                {governorates.map((gov, index) => (
                  <option key={index} value={gov} className="bg-gray-700 text-white">
                    {gov}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-3xl font-bold text-cyan-300 mb-2">{t('stepper.session', 'نوع الدورة')}</h2>
              <p className="text-gray-300">{t('stepper.sessionDesc', 'اختر نوع الدورة التي تريد التسجيل بها')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => setFormData(prev => ({ ...prev, session: 'principal' }))}
                className={`p-8 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  formData.session === 'principal'
                    ? 'border-green-400 bg-green-400/20 shadow-lg shadow-green-400/25'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-white">{t('stepper.sessionMain', 'الدورة الرئيسية')}</h3>
                  <p className="text-gray-300 mt-2">{t('stepper.admissionPriority', 'أولوية في القبول')}</p>
                </div>
              </div>
              
              <div
                onClick={() => setFormData(prev => ({ ...prev, session: 'controle' }))}
                className={`p-8 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  formData.session === 'controle'
                    ? 'border-orange-400 bg-orange-400/20 shadow-lg shadow-orange-400/25'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">🔄</div>
                  <h3 className="text-xl font-semibold text-white">{t('stepper.sessionControl', 'دورة المراقبة')}</h3>
                  <p className="text-gray-300 mt-2">{t('stepper.secondChance', 'فرصة ثانية')}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🌍</div>
              <h2 className="text-3xl font-bold text-cyan-300 mb-2">{t('stepper.selectOptionalSubject', 'المادة الاختيارية')}</h2>
              <p className="text-gray-300">{t('stepper.optionalSubjectDesc', 'اختر المادة الاختيارية التي تدرسها')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {optionalSubjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => setFormData(prev => ({ ...prev, optionalSubject: subject.id }))}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    formData.optionalSubject === subject.id
                      ? 'border-purple-400 bg-purple-400/20 shadow-lg shadow-purple-400/25'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{subject.flag}</div>
                    <h3 className="text-lg font-semibold text-white">{subject.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepData = steps[currentStep - 1];

  // Show loading while redirecting or not ready
  if (isRedirecting || !isReady) {
    return <RedirectLoadingScreen message={t('checkingProfile', 'جاري التحقق من ملفك الشخصي...')} />;
  }

  // Show sign-up prompt for unauthenticated users
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <GraduationCap className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('stepper.needSignUp', 'يجب تسجيل الدخول أولاً')}</h1>
            <p className="text-gray-400">
              {t('stepper.signUpToStart', 'لاستخدام نظام التوجيه الجامعي وحفظ بياناتك، يجب عليك تسجيل الدخول أولاً.')}
            </p>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/sign-in')}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              {t('signIn', 'تسجيل الدخول')}
            </Button>
            <Button 
              onClick={() => router.push('/sign-up')}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {t('register', 'إنشاء حساب جديد')}
            </Button>
            <Button 
              onClick={() => router.push('/')}
              variant="ghost"
              className="w-full text-gray-400 hover:text-gray-300"
            >
              {t('back', 'العودة للصفحة الرئيسية')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show redirect loading screen
  if (isRedirecting || !isReady) {
    return <RedirectLoadingScreen message={t('checkingProfile', 'جاري التحقق من ملفك الشخصي...')} />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-gray-800/50 p-4 border-b border-gray-700">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">{t('stepper.stepCounter', 'الخطوة {currentStep} من {totalSteps}').replace('{currentStep}', currentStep).replace('{totalSteps}', steps.length)}</span>
            <span className="text-sm text-gray-400">{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Step Indicator */}
          <div className="text-center mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 inline-block">
              <p className="text-cyan-400 font-medium">{currentStepData.message}</p>
            </div>
          </div>

          {/* Step Content */}
          <div className={`bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              <span>→</span>
              <span>{t('stepper.previousButton', 'السابق')}</span>
            </button>

            <div className="flex gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index + 1 === currentStep
                      ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50'
                      : index + 1 < currentStep
                      ? 'bg-green-400'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200"
            >
              <span>{currentStep === steps.length ? t('finish', 'إنهاء') : t('next', 'التالي')}</span>
              <span>←</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Nexie */}
      <FloatingNexie currentStep={currentStep} isVisible={true} />
    </div>
  );
}
