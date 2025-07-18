'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { User, MapPin, GraduationCap, BookOpen, Calendar, Trophy, School, Clock, Edit3, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trackData, calculateMG, calculateFS, getScoreLevel } from '@/utils/calculations';
import { createOrUpdateUserProfile } from '@/actions/profile-actions';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import FloatingNexie from '@/components/FloatingNexie';


export default function ReviewPage() {
  const router = useRouter();
  const { isRedirecting, isReady, userProfile, isSignedIn } = useAuthRedirect({
    requireAuth: true,
    requireProfile: false // Allow access even without profile to create one
  });

  // Initialize with empty data, will be populated from localStorage or database
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
      optional: ''
    },
    birthday: null,
    gender: '',
    governorate: '',
    session: '',
    optionalSubject: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [tempData, setTempData] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Manual score override states
  const [manualScores, setManualScores] = useState({
    mg: null,
    fs: null,
    useManual: false
  });

  // Save profile to database
  const saveProfileToDatabase = async () => {
    try {
      setIsSaving(true);
      
      // Calculate final scores
      const { mg, fs } = calculateScores();
      
      // Validate scores before saving
      if (!mg || !fs || mg < 0 || fs < 0 || mg > 20 || fs > 999) {
        alert('خطأ: النقاط غير صحيحة. تأكد من إدخال جميع الدرجات بشكل صحيح.');
        return;
      }
      
      // Validate required fields
      if (!formData.filiere || !formData.governorate || !formData.gender || !formData.session) {
        alert('خطأ: يرجى ملء جميع الحقول المطلوبة.');
        return;
      }
      
      // Prepare profile data for database
      const profileData = {
        filiere: formData.filiere,
        wilaya: formData.governorate,
        birthDate: formData.birthday,
        gender: formData.gender,
        session: formData.session,
        mgScore: parseFloat(mg.toFixed(2)),
        fsScore: parseFloat(fs.toFixed(2)),
        finalScore: parseFloat(fs.toFixed(2)), // Use FS as final score
        grades: formData.notes, // Store all grades as JSON
        preferredRegions: [], // Can be added later
        careerInterests: [] // Can be added later
      };

      const result = await createOrUpdateUserProfile(profileData);
      
      if (result.success) {
        // Clear localStorage after successful save
        localStorage.removeItem('stepperFormData');
        // Navigate to comparison page
        router.push('/comparison');
      } else {
        alert('خطأ في حفظ البيانات: ' + result.error);
      }
    } catch (error) {
      alert('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    // Validate grade inputs (notes fields)
    if (field.includes('notes.')) {
      const numValue = parseFloat(value);
      // Allow empty string for clearing the input
      if (value !== '' && (isNaN(numValue) || numValue < 0 || numValue > 20)) {
        // Invalid grade input - ignore the change
        return;
      }
    }
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setTempData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setTempData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Save changes and recalculate scores
  const saveChanges = () => {
    const updatedData = { ...formData, ...tempData };
    setFormData(updatedData);
    localStorage.setItem('stepperFormData', JSON.stringify(updatedData));
    setIsEditing(false);
    setEditingSection(null);
    setTempData({});
  };

  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
    setEditingSection(null);
    setTempData({});
  };

  // Start editing
  const startEdit = (section) => {
    setIsEditing(true);
    setEditingSection(section);
    setTempData(formData);
  };


  useEffect(() => {
    const loadData = async () => {
      if (!isReady || isRedirecting) return;
      
      try {
        // First, try to load data from localStorage (recent stepper data)
        const savedData = localStorage.getItem('stepperFormData');
        let loadedData = null;
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          // Convert birthday string back to Date object if it exists
          if (parsedData.birthday) {
            try {
              parsedData.birthday = new Date(parsedData.birthday);
              // Ensure it's a valid date
              if (isNaN(parsedData.birthday.getTime())) {
                parsedData.birthday = null;
              }
            } catch (error) {
              parsedData.birthday = null;
            }
          }
          loadedData = parsedData;
        }
        
        // If no localStorage data and user has a profile, load from database
        if (!loadedData && userProfile) {
          loadedData = {
            filiere: userProfile.filiere || '',
            notes: userProfile.grades || {
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
              optional: ''
            },
            birthday: userProfile.birthDate ? new Date(userProfile.birthDate) : null,
            gender: userProfile.gender || '',
            governorate: userProfile.wilaya || '',
            session: userProfile.session || '',
            optionalSubject: ''
          };
          
          // Also load manual scores if they exist
          if (userProfile.hasManualScores) {
            setManualScores({
              mg: userProfile.manualMgScore || userProfile.mgScore || '',
              fs: userProfile.manualFsScore || userProfile.fsScore || '',
              useManual: true
            });
          }
        }
        
        // Set the loaded data
        if (loadedData) {
          setFormData(loadedData);
        }
        
      } catch (error) {
        // Handle error silently
      } finally {
        setIsLoading(false);
        setIsVisible(true);
      }
    };
    
    loadData();
  }, [isReady, isRedirecting, userProfile]);



  const filieres = {
    'math': { name: 'رياضيات', icon: '📐', color: 'cyan' },
    'science': { name: 'علوم تجريبية', icon: '🔬', color: 'blue' },
    'info': { name: 'علوم إعلامية', icon: '💻', color: 'purple' },
    'tech': { name: 'تقنية', icon: '⚙️', color: 'green' },
    'eco': { name: 'إقتصاد وتصرف', icon: '📈', color: 'orange' },
    'lettres': { name: 'آداب', icon: '📚', color: 'pink' },
    'sport': { name: 'رياضة', icon: '🏃', color: 'red' }
  };

  // Map form grades to calculation format
  const mapGradesToCalculationFormat = (notes, filiere) => {
    const mappedGrades = {};
    
    // Common subject mappings
    if (notes.mathematics) mappedGrades.math = parseFloat(notes.mathematics);
    if (notes.physics) mappedGrades.physics = parseFloat(notes.physics);
    if (notes.chemistry) mappedGrades.chemistry = parseFloat(notes.chemistry);
    if (notes.biology) mappedGrades.svt = parseFloat(notes.biology);
    if (notes.french) mappedGrades.french = parseFloat(notes.french);
    if (notes.arabic) mappedGrades.arabic = parseFloat(notes.arabic);
    if (notes.english) mappedGrades.english = parseFloat(notes.english);
    if (notes.philosophy) mappedGrades.philosophy = parseFloat(notes.philosophy);
    if (notes.history) mappedGrades.hg = parseFloat(notes.history);
    if (notes.geography && !mappedGrades.hg) mappedGrades.hg = parseFloat(notes.geography);
    
    // Track-specific mappings
    switch (filiere) {
      case 'info':
        if (notes.optional) mappedGrades.algo = parseFloat(notes.optional);
        break;
      case 'tech':
        if (notes.optional) mappedGrades.technique = parseFloat(notes.optional);
        break;
      case 'eco':
        if (notes.optional) mappedGrades.eco = parseFloat(notes.optional);
        break;
      case 'sport':
        if (notes.optional) mappedGrades.sportPractical = parseFloat(notes.optional);
        break;
    }
    
    return mappedGrades;
  };

  // Calculate scores
  const calculateScores = () => {
    if (!formData.filiere || !trackData[formData.filiere]) {
      return { mg: 0, fs: 0, scoreLevel: getScoreLevel(0), isManual: false };
    }
    
    // Use manual scores if user has overridden them
    if (manualScores.useManual && manualScores.mg !== null && manualScores.fs !== null) {
      const scoreLevel = getScoreLevel(manualScores.fs);
      return { 
        mg: parseFloat(manualScores.mg), 
        fs: parseFloat(manualScores.fs), 
        scoreLevel,
        isManual: true 
      };
    }
    
    const mappedGrades = mapGradesToCalculationFormat(formData.notes, formData.filiere);
    
    const track = { id: formData.filiere, name: trackData[formData.filiere].name };
    
    const mg = calculateMG(mappedGrades, track);
    const fs = calculateFS(mappedGrades, track, mg);
    const scoreLevel = getScoreLevel(fs);
    
    return { mg, fs, scoreLevel, isManual: false };
  };

  const { mg, fs, scoreLevel, isManual } = calculateScores();
  
  // Handle manual score editing
  const toggleManualScores = () => {
    if (manualScores.useManual) {
      // Disable manual mode - revert to calculated scores
      setManualScores({
        mg: null,
        fs: null,
        useManual: false
      });
    } else {
      // Enable manual mode - initialize with current calculated scores
      setManualScores({
        mg: mg.toFixed(2),
        fs: fs.toFixed(2),
        useManual: true
      });
    }
  };
  
  const updateManualScore = (field, value) => {
    // Allow empty string for clearing
    if (value === '') {
      setManualScores(prev => ({
        ...prev,
        [field]: null
      }));
      return;
    }
    
    const numValue = parseFloat(value);
    // Validate score range: 0-999 for university scores (can be higher than 200)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 999) {
      setManualScores(prev => ({
        ...prev,
        [field]: numValue
      }));
    }
    // If invalid, don't update the state (ignore the input)
  };

  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
            مراجعة وتعديل البيانات
          </h1>
          <p className="text-gray-300 text-lg mb-4">
            راجع بياناتك وقم بتعديلها إذا لزم الأمر قبل الحصول على نتائج التوجه الجامعي
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Edit3 className="w-4 h-4" />
            <span>انقر على أي قسم للتعديل</span>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className={`bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} relative group hover:border-cyan-400/50 transition-colors`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <User className="w-6 h-6 text-cyan-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">المعلومات الشخصية</h2>
              </div>
              <div className="flex items-center gap-2">
                {editingSection === 'personal' ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={saveChanges}
                      className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEdit}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit('personal')}
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Filiere */}
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <Label className="text-gray-300 text-sm mb-2 block">الشعبة</Label>
                {editingSection === 'personal' ? (
                  <Select 
                    value={tempData.filiere || formData.filiere} 
                    onValueChange={(value) => handleInputChange('filiere', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-600/50 border-gray-600 text-white">
                      <SelectValue placeholder="اختر الشعبة" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(filieres).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center">
                            <span className="mr-2">{value.icon}</span>
                            {value.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center text-cyan-400 font-medium">
                    <span className="mr-2">{filieres[formData.filiere]?.icon}</span>
                    {filieres[formData.filiere]?.name || 'غير محدد'}
                  </div>
                )}
              </div>
              
              {/* Gender */}
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <Label className="text-gray-300 text-sm mb-2 block">الجنس</Label>
                {editingSection === 'personal' ? (
                  <Select 
                    value={tempData.gender || formData.gender} 
                    onValueChange={(value) => handleInputChange('gender', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-600/50 border-gray-600 text-white">
                      <SelectValue placeholder="اختر الجنس" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">
                        <div className="flex items-center">
                          <span className="mr-2">👨</span>
                          ذكر
                        </div>
                      </SelectItem>
                      <SelectItem value="female">
                        <div className="flex items-center">
                          <span className="mr-2">👩</span>
                          أنثى
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center text-cyan-400 font-medium">
                    <span className="mr-2">{formData.gender === 'male' ? '👨' : formData.gender === 'female' ? '👩' : '❓'}</span>
                    {formData.gender === 'male' ? 'ذكر' : formData.gender === 'female' ? 'أنثى' : 'غير محدد'}
                  </div>
                )}
              </div>
              
              {/* Governorate */}
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <Label className="text-gray-300 text-sm mb-2 block">الولاية</Label>
                {editingSection === 'personal' ? (
                  <Input
                    value={tempData.governorate || formData.governorate}
                    onChange={(e) => handleInputChange('governorate', e.target.value)}
                    className="bg-gray-600/50 border-gray-600 text-white"
                    placeholder="أدخل الولاية"
                  />
                ) : (
                  <div className="flex items-center text-cyan-400 font-medium">
                    <span className="mr-2">🏛️</span>
                    {formData.governorate || 'غير محدد'}
                  </div>
                )}
              </div>
              
              {/* Session */}
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <Label className="text-gray-300 text-sm mb-2 block">نوع الدورة</Label>
                {editingSection === 'personal' ? (
                  <Select 
                    value={tempData.session || formData.session} 
                    onValueChange={(value) => handleInputChange('session', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-600/50 border-gray-600 text-white">
                      <SelectValue placeholder="اختر نوع الدورة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="principal">
                        <div className="flex items-center">
                          <span className="mr-2">🎯</span>
                          الدورة الرئيسية
                        </div>
                      </SelectItem>
                      <SelectItem value="controle">
                        <div className="flex items-center">
                          <span className="mr-2">🔄</span>
                          دورة المراقبة
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center text-cyan-400 font-medium">
                    <span className="mr-2">{formData.session === 'principal' ? '🎯' : '🔄'}</span>
                    {formData.session === 'principal' ? 'الدورة الرئيسية' : 
                     formData.session === 'controle' ? 'دورة المراقبة' : 'غير محدد'}
                  </div>
                )}
              </div>

              {/* Optional Subject */}
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <Label className="text-gray-300 text-sm mb-2 block">المادة الاختيارية</Label>
                {editingSection === 'personal' ? (
                  <Input
                    value={tempData.optionalSubject || formData.optionalSubject}
                    onChange={(e) => handleInputChange('optionalSubject', e.target.value)}
                    className="bg-gray-600/50 border-gray-600 text-white"
                    placeholder="أدخل المادة الاختيارية"
                  />
                ) : (
                  <div className="flex items-center text-cyan-400 font-medium">
                    <span className="mr-2">📋</span>
                    {formData.optionalSubject || 'غير محدد'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grades */}
          <div className={`bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} relative group hover:border-cyan-400/50 transition-colors`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <BookOpen className="w-6 h-6 text-cyan-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">النقاط</h2>
              </div>
              <div className="flex items-center gap-2">
                {editingSection === 'grades' ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={saveChanges}
                      className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEdit}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit('grades')}
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                // Get subjects relevant to the current track
                const currentTrackSubjects = trackData[formData.filiere]?.subjects || {};
                const relevantSubjects = Object.keys(currentTrackSubjects);
                
                // Map calculation subjects back to form subjects
                const subjectMapping = {
                  math: 'mathematics',
                  physics: 'physics',
                  svt: 'biology',
                  french: 'french',
                  arabic: 'arabic',
                  english: 'english',
                  philosophy: 'philosophy',
                  hg: 'history',
                  algo: 'optional',
                  technique: 'optional',
                  eco: 'optional',
                  sportPractical: 'optional',
                  chemistry: 'chemistry'
                };

                const subjectNames = {
                  mathematics: 'الرياضيات',
                  physics: 'الفيزياء',
                  chemistry: 'الكيمياء',
                  biology: 'علوم الطبيعة والحياة',
                  french: 'الفرنسية',
                  arabic: 'العربية',
                  english: 'الإنجليزية',
                  philosophy: 'الفلسفة',
                  history: 'التاريخ',
                  geography: 'الجغرافيا',
                  optional: 'المادة الاختيارية'
                };

                const subjectIcons = {
                  mathematics: '📐',
                  physics: '⚛️',
                  chemistry: '🧪',
                  biology: '🔬',
                  french: '🇫🇷',
                  arabic: '🇹🇳',
                  english: '🇬🇧',
                  philosophy: '🤔',
                  history: '📜',
                  geography: '🌍',
                  optional: '📋'
                };

                // Show subjects relevant to the current track
                const subjectsToShow = relevantSubjects.map(calcSubject => {
                  const formSubject = subjectMapping[calcSubject] || calcSubject;
                  return {
                    key: formSubject,
                    name: currentTrackSubjects[calcSubject]?.name || subjectNames[formSubject],
                    icon: subjectIcons[formSubject],
                    coefficient: currentTrackSubjects[calcSubject]?.coef || 1,
                    grade: formData.notes[formSubject] || ''
                  };
                });

                return subjectsToShow.map(({ key, name, icon, coefficient, grade }) => {
                  const currentGrade = (editingSection === 'grades' ? tempData.notes?.[key] : grade) || grade;
                  
                  return (
                    <div key={key} className="p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{icon}</span>
                          <Label className="text-gray-300 text-sm">
                            {name}
                          </Label>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                          معامل {coefficient}
                        </span>
                      </div>
                      
                      {editingSection === 'grades' ? (
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            step="0.25"
                            value={currentGrade}
                            onChange={(e) => handleInputChange(`notes.${key}`, e.target.value)}
                            className="bg-gray-600/50 border-gray-600 text-white text-center text-lg font-medium"
                            placeholder="0.00"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                            /20
                          </span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className={`font-medium text-2xl ${
                            parseFloat(currentGrade) >= 16 ? 'text-green-400' :
                            parseFloat(currentGrade) >= 12 ? 'text-yellow-400' :
                            parseFloat(currentGrade) >= 10 ? 'text-orange-400' : 
                            parseFloat(currentGrade) > 0 ? 'text-red-400' : 'text-gray-500'
                          }`}>
                            {currentGrade ? `${currentGrade}/20` : 'غير محدد'}
                          </span>
                          {parseFloat(currentGrade) > 0 && (
                            <div className="mt-1">
                              <div className={`w-full bg-gray-600 rounded-full h-2 ${
                                parseFloat(currentGrade) >= 16 ? 'bg-green-900' :
                                parseFloat(currentGrade) >= 12 ? 'bg-yellow-900' :
                                parseFloat(currentGrade) >= 10 ? 'bg-orange-900' : 'bg-red-900'
                              }`}>
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    parseFloat(currentGrade) >= 16 ? 'bg-green-400' :
                                    parseFloat(currentGrade) >= 12 ? 'bg-yellow-400' :
                                    parseFloat(currentGrade) >= 10 ? 'bg-orange-400' : 'bg-red-400'
                                  }`}
                                  style={{ width: `${(parseFloat(currentGrade) / 20) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Summary & Next Steps */}
          <div className={`lg:col-span-2 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Summary Stats */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Trophy className="w-6 h-6 text-cyan-400 mr-3" />
                    <h2 className="text-xl font-semibold text-white">ملخص الدرجات</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isManual && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30">
                        نقاط مُعدّلة يدوياً
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleManualScores}
                      className={`text-xs ${
                        manualScores.useManual 
                          ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30' 
                          : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
                      }`}
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      {manualScores.useManual ? 'استخدام الحساب التلقائي' : 'تعديل النقاط يدوياً'}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* MG Score */}
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-cyan-500/20">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📊</span>
                      <span className="text-gray-300 font-medium">المعدل العام (MG)</span>
                    </div>
                    {manualScores.useManual ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="20"
                          value={manualScores.mg || ''}
                          onChange={(e) => updateManualScore('mg', e.target.value)}
                          className="w-20 text-center bg-gray-600/50 border-gray-600 text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="text-gray-400 text-sm">/20</span>
                      </div>
                    ) : (
                      <span className={`font-bold text-2xl ${
                        mg >= 16 ? 'text-green-400' :
                        mg >= 12 ? 'text-yellow-400' :
                        mg >= 10 ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {mg.toFixed(2)}/20
                      </span>
                    )}
                  </div>
                  
                  {/* FS Score */}
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-blue-500/20">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🎯</span>
                      <span className="text-gray-300 font-medium">النقطة الخاصة (FS)</span>
                    </div>
                    {manualScores.useManual ? (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="999"
                        value={manualScores.fs || ''}
                        onChange={(e) => updateManualScore('fs', e.target.value)}
                        className="w-24 text-center bg-gray-600/50 border-gray-600 text-white text-sm"
                        placeholder="0.00"
                      />
                    ) : (
                      <span className={`font-bold text-2xl`} style={{ color: scoreLevel.color }}>
                        {fs.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-purple-500/20">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">⭐</span>
                      <span className="text-gray-300 font-medium">التقييم</span>
                    </div>
                    <span 
                      className="font-bold text-lg px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: scoreLevel.color }}
                    >
                      {scoreLevel.text}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-500/20">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🏫</span>
                      <span className="text-gray-300 font-medium">الشعبة</span>
                    </div>
                    <span className="font-bold text-lg text-cyan-400">
                      {trackData[formData.filiere]?.name || 'غير محدد'}
                    </span>
                  </div>
                  
                  {/* Manual Scores Help Text */}
                  {manualScores.useManual && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-start">
                        <span className="text-yellow-400 mr-2">⚠️</span>
                        <div className="text-sm text-yellow-200">
                          <p className="font-medium mb-1">تعديل النقاط يدوياً</p>
                          <p className="text-yellow-300">
                            يمكنك تعديل النقاط يدوياً إذا كانت حساباتنا غير صحيحة. 
                            المعدل العام (0-20)، النقطة الخاصة (0-999).
                            تأكد من إدخال النقاط الصحيحة لضمان دقة التوصيات.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Steps */}
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-cyan-300 mb-3">
                  جاهز لاكتشاف توجهك الجامعي؟
                </h3>
                <p className="text-gray-300 mb-6">
                  سنقوم الآن بتحليل بياناتك وحساب أفضل التوجهات المناسبة لك بناءً على درجاتك وتخصصك
                </p>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    onClick={saveProfileToDatabase}
                    disabled={isEditing || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <School className="w-5 h-5 mr-2" />
                        احسب التوجهات المناسبة
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => window.location.href = '/stepper'}
                  >
                    العودة إلى النموذج
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FloatingNexie Assistant */}
      <FloatingNexie currentStep={7} isVisible={isVisible} />
    </div>
  );
}