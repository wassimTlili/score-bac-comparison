import finaleData from '@/data/finale-data.json';

// Updated data access using finale-data.json
export function getStaticOrientationsData() {
  // Transform finale-data.json to match the expected interface
  const orientations = finaleData.map(item => {
    // Ensure all required properties exist with fallbacks
    const orientation = {
      id: item.ramz_code || 'unknown',
      name: item.table_specialization || 'Non spécifiée',
      nameAr: item.table_specialization || 'غير محددة',
      code: item.ramz_code || 'unknown',
      ramzId: item.ramz_id || '',
      ramzLink: item.ramz_link || '',
      hub: item.table_location || 'غير محدد',
      university: item.university_name || 'غير محددة',
      institution: item.table_institution || 'غير محددة',
      criteria: item.table_criteria || '',
      sevenPercent: item.seven_percent === 'yes',
      category: getCategoryFromField(item.field_of_study || ''),
      fieldOfStudy: item.field_of_study || '',
      bacType: item.bac_type_name || '',
      bacTypeId: item.bac_type_id || '',
      universityId: item.university_id || '',
      minScore: getMinScoreFromHistorical(item.historical_scores || {}),
      historicalScores: item.historical_scores || {},
      description: `${item.table_specialization || 'Non spécifiée'} - ${item.table_institution || 'Non spécifiée'}`,
      duration: getDurationFromSpecialization(item.table_specialization || ''),
      degree: getDegreeFromSpecialization(item.table_specialization || ''),
      skills: getSkillsFromSpecialization(item.table_specialization || ''),
      careers: getCareersFromSpecialization(item.table_specialization || ''),
      institutes: [item.table_institution || 'غير محددة'],
      governorates: [getGovernorateFromLocation(item.table_location || '')]
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
  if (!orientation) return false;
  
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

// Helper functions for finale-data.json
function getCategoryFromField(fieldOfStudy) {
  if (fieldOfStudy.includes('الطب') || fieldOfStudy.includes('الصحة')) {
    return 'الطب والصحة';
  }
  if (fieldOfStudy.includes('الهندسة') || fieldOfStudy.includes('التكنولوجيا')) {
    return 'الهندسة والتكنولوجيا';
  }
  if (fieldOfStudy.includes('الإعلامية') || fieldOfStudy.includes('الحاسوب')) {
    return 'علوم الحاسوب والإعلامية';
  }
  if (fieldOfStudy.includes('الاقتصاد') || fieldOfStudy.includes('التصرف')) {
    return 'الاقتصاد والتصرف';
  }
  if (fieldOfStudy.includes('الآداب') || fieldOfStudy.includes('اللغات')) {
    return 'الآداب واللغات';
  }
  if (fieldOfStudy.includes('الرياضة') || fieldOfStudy.includes('البدنية')) {
    return 'التربية البدنية والرياضة';
  }
  if (fieldOfStudy.includes('الثقافة') || fieldOfStudy.includes('الفنون')) {
    return 'الثقافة والفنون';
  }
  return 'العلوم';
}

function getMinScoreFromHistorical(historicalScores) {
  if (!historicalScores || typeof historicalScores !== 'object') {
    return 120; // Default minimum score
  }
  
  let minScore = Infinity;
  for (const year in historicalScores) {
    const score = historicalScores[year];
    if (score > 0 && score < minScore) {
      minScore = score;
    }
  }
  return minScore === Infinity ? 120 : minScore;
}

function getDurationFromSpecialization(specialization) {
  if (specialization.includes('الطب العام') || specialization.includes('الصيدلة')) {
    return '6 سنوات';
  }
  if (specialization.includes('طب الأسنان')) {
    return '5 سنوات';
  }
  if (specialization.includes('الهندسة') || specialization.includes('هندسة')) {
    return '5 سنوات';
  }
  if (specialization.includes('الماجستير') || specialization.includes('ماجستير')) {
    return '5 سنوات';
  }
  return '3 سنوات';
}

function getDegreeFromSpecialization(specialization) {
  if (specialization.includes('الطب العام')) {
    return 'دكتوراه في الطب';
  }
  if (specialization.includes('الصيدلة')) {
    return 'دكتوراه في الصيدلة';
  }
  if (specialization.includes('طب الأسنان')) {
    return 'دكتوراه في طب الأسنان';
  }
  if (specialization.includes('الهندسة') || specialization.includes('هندسة')) {
    return 'دبلوم مهندس';
  }
  if (specialization.includes('الماجستير') || specialization.includes('ماجستير')) {
    return 'ماجستير';
  }
  return 'إجازة';
}

function getSkillsFromSpecialization(specialization) {
  if (specialization.includes('الإعلامية') || specialization.includes('الحاسوب')) {
    return ['البرمجة', 'قواعد البيانات', 'الخوارزميات', 'الشبكات'];
  }
  if (specialization.includes('الهندسة')) {
    return ['التصميم الهندسي', 'التحليل التقني', 'إدارة المشاريع', 'الابتكار'];
  }
  if (specialization.includes('الطب')) {
    return ['التشخيص', 'العلاج', 'التواصل مع المرضى', 'البحث الطبي'];
  }
  if (specialization.includes('الاقتصاد')) {
    return ['التحليل المالي', 'إدارة الأعمال', 'التخطيط الاستراتيجي', 'التفاوض'];
  }
  if (specialization.includes('الآداب') || specialization.includes('اللغات')) {
    return ['التحليل الأدبي', 'الترجمة', 'التواصل', 'الكتابة'];
  }
  return ['التحليل', 'التواصل', 'حل المشاكل', 'العمل الجماعي'];
}

function getCareersFromSpecialization(specialization) {
  if (specialization.includes('الإعلامية') || specialization.includes('الحاسوب')) {
    return ['مطور برمجيات', 'مهندس نظم', 'محلل بيانات', 'مدير مشاريع تقنية'];
  }
  if (specialization.includes('الهندسة')) {
    return ['مهندس مشاريع', 'مهندس استشاري', 'مدير تقني', 'باحث هندسي'];
  }
  if (specialization.includes('الطب')) {
    return ['طبيب عام', 'طبيب مختص', 'باحث طبي', 'أستاذ جامعي'];
  }
  if (specialization.includes('الاقتصاد')) {
    return ['محلل مالي', 'مستشار اقتصادي', 'مدير أعمال', 'محاسب'];
  }
  if (specialization.includes('الآداب') || specialization.includes('اللغات')) {
    return ['أستاذ', 'مترجم', 'صحافي', 'كاتب'];
  }
  return ['موظف', 'مستشار', 'أستاذ', 'باحث'];
}

function getGovernorateFromLocation(location) {
  // Map location names to governorate IDs
  const locationMap = {
    'تونس': 'tunis',
    'أريانة': 'ariana', 
    'بن عروس': 'ben_arous',
    'منوبة': 'manouba',
    'نابل': 'nabeul',
    'زغوان': 'zaghouan',
    'بنزرت': 'bizerte',
    'باجة': 'beja',
    'جندوبة': 'jendouba',
    'الكاف': 'kef',
    'سليانة': 'siliana',
    'سوسة': 'sousse',
    'المنستير': 'monastir',
    'المهدية': 'mahdia',
    'صفاقس': 'sfax',
    'القيروان': 'kairouan',
    'القصرين': 'kasserine',
    'سيدي بوزيد': 'sidi_bouzid',
    'قفصة': 'gafsa',
    'توزر': 'tozeur',
    'قبلي': 'kebili',
    'قابس': 'gabes',
    'مدنين': 'medenine',
    'تطاوين': 'tataouine'
  };
  
  return locationMap[location] || 'tunis';
}
