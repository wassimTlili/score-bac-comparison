import orientationsData from '@/data/orientations.json';

// Static data access (fallback for development)
export function getStaticOrientationsData() {
  // Transform the new data structure to match the old interface
  const orientations = orientationsData.map(item => {
    // Ensure all required properties exist with fallbacks
    const orientation = {
      id: item.code || 'unknown',
      name: item.licence || 'Non spécifiée',
      nameAr: item.licence || 'غير محددة',
      code: item.code || 'unknown',
      hub: item.hub || 'غير محدد',
      university: item.university || 'غير محددة',
      category: getCategoryFromLicence(item.licence || ''),
      minScore: getMinScoreFromBacScores(item.bacScores || []),
      bacScores: item.bacScores || [],
      description: `${item.licence || 'Non spécifiée'} - ${item.university || 'Non spécifiée'}`,
      duration: getDurationFromLicence(item.licence || ''),
      degree: getDegreeFromLicence(item.licence || ''),
      skills: getSkillsFromLicence(item.licence || ''),
      careers: getCareersFromLicence(item.licence || ''),
      institutes: [item.university || 'غير محددة'],
      governorates: [getGovernorateFromHub(item.hub || '')]
    };
    
    return orientation;
  });

  const governorates = [
    {
      id: "tunis",
      name: "تونس",
      nameAr: "تونس",
      region: "الشمال",
      universities: ["جامعة تونس"]
    },
    {
      id: "ariana",
      name: "أريانة",
      nameAr: "أريانة",
      region: "الشمال",
      universities: ["جامعة تونس"]
    },
    {
      id: "ben_arous",
      name: "بن عروس",
      nameAr: "بن عروس",
      region: "الشمال",
      universities: ["جامعة تونس"]
    },
    {
      id: "manouba",
      name: "منوبة",
      nameAr: "منوبة",
      region: "الشمال",
      universities: ["جامعة منوبة"]
    },
    {
      id: "nabeul",
      name: "نابل",
      nameAr: "نابل",
      region: "الشمال الشرقي",
      universities: ["جامعة قرطاج"]
    },
    {
      id: "zaghouan",
      name: "زغوان",
      nameAr: "زغوان",
      region: "الوسط",
      universities: ["جامعة تونس"]
    },
    {
      id: "bizerte",
      name: "بنزرت",
      nameAr: "بنزرت",
      region: "الشمال",
      universities: ["جامعة قرطاج"]
    },
    {
      id: "beja",
      name: "باجة",
      nameAr: "باجة",
      region: "الشمال الغربي",
      universities: ["جامعة جندوبة"]
    },
    {
      id: "jendouba",
      name: "جندوبة",
      nameAr: "جندوبة",
      region: "الشمال الغربي",
      universities: ["جامعة جندوبة"]
    },
    {
      id: "kef",
      name: "الكاف",
      nameAr: "الكاف",
      region: "الشمال الغربي",
      universities: ["جامعة جندوبة"]
    },
    {
      id: "siliana",
      name: "سليانة",
      nameAr: "سليانة",
      region: "الوسط الغربي",
      universities: ["جامعة القيروان"]
    },
    {
      id: "sousse",
      name: "سوسة",
      nameAr: "سوسة", 
      region: "الساحل",
      universities: ["جامعة سوسة"]
    },
    {
      id: "monastir",
      name: "المنستير",
      nameAr: "المنستير",
      region: "الساحل",
      universities: ["جامعة المنستير"]
    },
    {
      id: "mahdia",
      name: "المهدية",
      nameAr: "المهدية",
      region: "الساحل",
      universities: ["جامعة المنستير"]
    },
    {
      id: "kairouan",
      name: "القيروان",
      nameAr: "القيروان",
      region: "الوسط",
      universities: ["جامعة القيروان"]
    },
    {
      id: "kasserine",
      name: "القصرين",
      nameAr: "القصرين",
      region: "الوسط الغربي",
      universities: ["جامعة القيروان"]
    },
    {
      id: "sidi_bouzid",
      name: "سيدي بوزيد",
      nameAr: "سيدي بوزيد",
      region: "الوسط",
      universities: ["جامعة القيروان"]
    },
    {
      id: "sfax",
      name: "صفاقس", 
      nameAr: "صفاقس",
      region: "الجنوب",
      universities: ["جامعة صفاقس"]
    },
    {
      id: "gafsa",
      name: "قفصة",
      nameAr: "قفصة",
      region: "الجنوب الغربي",
      universities: ["جامعة قفصة"]
    },
    {
      id: "tozeur",
      name: "توزر",
      nameAr: "توزر",
      region: "الجنوب الغربي",
      universities: ["جامعة قفصة"]
    },
    {
      id: "kebili",
      name: "قبلي",
      nameAr: "قبلي",
      region: "الجنوب",
      universities: ["جامعة قفصة"]
    },
    {
      id: "gabes",
      name: "قابس",
      nameAr: "قابس",
      region: "الجنوب الشرقي",
      universities: ["جامعة قابس"]
    },
    {
      id: "medenine",
      name: "مدنين",
      nameAr: "مدنين",
      region: "الجنوب الشرقي",
      universities: ["جامعة قابس"]
    },
    {
      id: "tataouine",
      name: "تطاوين",
      nameAr: "تطاوين",
      region: "الجنوب",
      universities: ["جامعة قابس"]
    }
  ];

  return { orientations, governorates };
}

// Legacy functions for compatibility
export function getAllOrientations() {
  return getStaticOrientationsData().orientations;
}

export function getAllGovernorates() {
  // Return just the governorate names as strings for the form
  return getStaticOrientationsData().governorates.map(gov => gov.name);
}

export function getAllGovernoratesDetailed() {
  // Return full governorate objects for detailed data
  return getStaticOrientationsData().governorates;
}

/**
 * Get orientation by ID
 * @param {string} id - The orientation ID
 * @returns {Object|null} Orientation object or null if not found
 */
export function getOrientationById(id) {
  const orientations = getAllOrientations();
  return orientations.find(orientation => orientation.id === id) || null;
}

/**
 * Get orientation by code
 * @param {string} code - The orientation code
 * @returns {Object|null} Orientation object or null if not found
 */
export function getOrientationByCode(code) {
  const orientations = getAllOrientations();
  return orientations.find(orientation => orientation.code === code) || null;
}

export function getGovernorateById(id) {
  const governorates = getAllGovernoratesDetailed();
  return governorates.find(governorate => governorate.id === id) || null;
}

export function getOrientationsByGovernorate(governorateId) {
  const orientations = getAllOrientations();
  // Handle both ID and name based lookups
  return orientations.filter(orientation => {
    if (!orientation.governorates) return false;
    return orientation.governorates.includes(governorateId) || 
           orientation.governorates.some(gov => gov === governorateId);
  });
}

export function filterOrientationsByScore(userScore) {
  const orientations = getAllOrientations();
  return orientations.filter(orientation => 
    orientation.minScore <= userScore
  );
}

/**
 * Get orientations by category
 * @param {string} category - The category to filter by
 * @returns {Array} Array of orientation objects
 */
export function getOrientationsByCategory(category) {
  const orientations = getAllOrientations();
  return orientations.filter(orientation => 
    orientation.category === category
  );
}

/**
 * Get all available categories
 * @returns {Array} Array of category names
 */
export function getAllCategories() {
  const orientations = getAllOrientations();
  const categories = orientations.map(orientation => orientation.category);
  return [...new Set(categories)].sort();
}

/**
 * Check if an orientation is available in a given governorate
 * @param {string} orientationId - The orientation ID
 * @param {string} governorateId - The governorate ID
 * @returns {boolean} True if available, false otherwise
 */
export function isOrientationAvailableInGovernorate(orientationId, governorateId) {
  const orientation = getOrientationById(orientationId);
  if (!orientation || !orientation.governorates) {
    return false;
  }
  return orientation.governorates.includes(governorateId);
}

/**
 * Get comparison data between two orientations
 * @param {string} orientation1Id - The first orientation ID
 * @param {string} orientation2Id - The second orientation ID
 * @returns {Object|null} Comparison data or null if not found
 */
export function getComparisonData(orientation1Id, orientation2Id) {
  const orientation1 = getOrientationById(orientation1Id);
  const orientation2 = getOrientationById(orientation2Id);
  
  if (!orientation1 || !orientation2) {
    return null;
  }
  
  return {
    orientation1,
    orientation2,
    comparison: {
      scoreDifference: Math.abs(orientation1.minScore - orientation2.minScore),
      commonGovernorates: orientation1.governorates.filter(gov => 
        orientation2.governorates.includes(gov)
      ),
      sameDuration: orientation1.duration === orientation2.duration,
      sameDegree: orientation1.degree === orientation2.degree,
      commonSkills: orientation1.skills.filter(skill =>
        orientation2.skills.includes(skill)
      )
    }
  };
}

export async function getGovernoratesFromDB() {
  try {
    // Database functionality removed to prevent client-side imports
    // Fallback to static data
    return getStaticOrientationsData().governorates;
  } catch (error) {
    console.error('Failed to fetch governorates from database:', error);
    return getStaticOrientationsData().governorates;
  }
}

// Helper functions
function getCategoryFromLicence(licence) {
  if (licence.includes('الطب') || licence.includes('الصيدلة') || licence.includes('طب الأسنان')) {
    return 'الطب والصحة';
  }
  if (licence.includes('العلاج') || licence.includes('التصوير') || licence.includes('البيولوجيا')) {
    return 'العلوم الطبية المساعدة';
  }
  return 'العلوم';
}

function getMinScoreFromBacScores(bacScores) {
  if (!bacScores || !Array.isArray(bacScores) || bacScores.length === 0) {
    return 0;
  }
  
  let minScore = Infinity;
  bacScores.forEach(bs => {
    if (bs.score2024 && bs.score2024 < minScore) minScore = bs.score2024;
    if (bs.score2023 && bs.score2023 < minScore) minScore = bs.score2023;
    if (bs.score2022 && bs.score2022 < minScore) minScore = bs.score2022;
  });
  return minScore === Infinity ? 120 : minScore;
}

function getDurationFromLicence(licence) {
  if (licence.includes('الطب') && !licence.includes('طب الأسنان')) {
    return '7 سنوات';
  }
  if (licence.includes('طب الأسنان') || licence.includes('الصيدلة')) {
    return '6 سنوات';
  }
  return '3 سنوات';
}

function getDegreeFromLicence(licence) {
  if (licence.includes('الطب') || licence.includes('الصيدلة') || licence.includes('طب الأسنان')) {
    return 'دكتوراه';
  }
  return 'إجازة';
}

function getSkillsFromLicence(licence) {
  if (!licence || typeof licence !== 'string') {
    return ['التفكير النقدي', 'حل المشاكل', 'العمل الجماعي'];
  }
  
  if (licence.includes('الطب')) {
    return ['التشخيص الطبي', 'العلاج', 'البحث الطبي', 'التواصل مع المرضى'];
  }
  if (licence.includes('الصيدلة')) {
    return ['علم الأدوية', 'الكيمياء الصيدلانية', 'إدارة الصيدلية', 'الاستشارة الدوائية'];
  }
  if (licence.includes('طب الأسنان')) {
    return ['جراحة الفم', 'تقويم الأسنان', 'طب الأسنان التجميلي', 'الوقاية'];
  }
  if (licence.includes('العلاج الطبيعي')) {
    return ['التأهيل الحركي', 'العلاج اليدوي', 'استخدام الأجهزة الطبية'];
  }
  if (licence.includes('التبنيج')) {
    return ['التخدير', 'الرعاية المركزة', 'إدارة الألم'];
  }
  if (licence.includes('التصوير الطبي')) {
    return ['التصوير بالأشعة', 'تحليل الصور الطبية', 'استخدام المعدات المتقدمة'];
  }
  if (licence.includes('البيولوجيا الطبية')) {
    return ['التحاليل المخبرية', 'الفحوصات الطبية', 'البحث العلمي'];
  }
  return ['التفكير النقدي', 'حل المشاكل', 'العمل الجماعي'];
}

function getCareersFromLicence(licence) {
  if (!licence || typeof licence !== 'string') {
    return ['متخصص في المجال', 'باحث', 'مستشار'];
  }
  
  if (licence.includes('الطب')) {
    return ['طبيب عام', 'طبيب مختص', 'طبيب في المستشفى', 'طبيب خاص'];
  }
  if (licence.includes('الصيدلة')) {
    return ['صيدلي', 'مدير صيدلية', 'صيدلي مستشفى', 'باحث في الأدوية'];
  }
  if (licence.includes('طب الأسنان')) {
    return ['طبيب أسنان', 'جراح فم وأسنان', 'أخصائي تقويم'];
  }
  if (licence.includes('العلاج الطبيعي')) {
    return ['أخصائي علاج طبيعي', 'مدرب تأهيل', 'مستشار صحي'];
  }
  if (licence.includes('التبنيج')) {
    return ['أخصائي تخدير', 'طبيب عناية مركزة', 'أخصائي إدارة الألم'];
  }
  if (licence.includes('التصوير الطبي')) {
    return ['أخصائي أشعة', 'فني تصوير طبي', 'أخصائي تشخيص'];
  }
  if (licence.includes('البيولوجيا الطبية')) {
    return ['أخصائي مختبرات', 'باحث طبي', 'أخصائي تحاليل'];
  }
  return ['متخصص في المجال', 'باحث', 'مستشار'];
}

function getGovernorateFromHub(hubName) {
  if (!hubName || typeof hubName !== 'string') return 'other';
  if (hubName.includes('المنستير')) return 'المنستير';
  if (hubName.includes('صفاقس')) return 'صفاقس';
  if (hubName.includes('سوسة')) return 'سوسة';
  return 'أخرى';
}

function getGovernorateIdFromHub(hubName) {
  return getGovernorateFromHub(hubName);
}

function getGovernorateNameFromHub(hubName) {
  if (hubName.includes('المنستير')) return 'المنستير';
  if (hubName.includes('صفاقس')) return 'صفاقس';
  if (hubName.includes('سوسة')) return 'سوسة';
  return hubName;
}

function getRegionFromHub(hubName) {
  if (hubName.includes('المنستير') || hubName.includes('سوسة')) return 'الساحل';
  if (hubName.includes('صفاقس')) return 'الجنوب';
  return 'أخرى';
}
