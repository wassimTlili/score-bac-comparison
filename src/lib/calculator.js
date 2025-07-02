// Official Tunisian BAC Track definitions with correct subjects and coefficients
export const trackData = {
  math: {
    name: 'Mathématiques',
    description: 'Filière scientifique axée sur les mathématiques et la physique',
    icon: '📐',
    color: 'from-blue-600 to-indigo-600',
    subjects: {
      math: { name: 'Mathématiques', coef: 4 },
      physics: { name: 'Sciences Physiques', coef: 4 },
      svt: { name: 'Sciences de la Vie et de la Terre', coef: 2 },
      arabic: { name: 'Arabe', coef: 1 },
      french: { name: 'Français', coef: 1 },
      english: { name: 'Anglais', coef: 1 },
      philosophy: { name: 'Philosophie', coef: 1 },
      algo: { name: 'Algorithme et Programmation', coef: 1 },
      sport: { name: 'Sport', coef: 1 }
    },
    careers: ['Ingénieur', 'Mathématicien', 'Physicien', 'Actuaire', 'Analyste financier'],
    universities: ['ENIT', 'ESPRIT', 'Polytechnique', 'FST']
  },
  science: {
    name: 'Sciences Expérimentales',
    description: 'Filière dédiée aux sciences naturelles et expérimentales',
    icon: '🔬',
    color: 'from-green-600 to-emerald-600',
    subjects: {
      math: { name: 'Mathématiques', coef: 3 },
      physics: { name: 'Sciences Physiques', coef: 4 },
      svt: { name: 'Sciences de la Vie et de la Terre', coef: 4 },
      arabic: { name: 'Arabe', coef: 1 },
      french: { name: 'Français', coef: 1 },
      english: { name: 'Anglais', coef: 1 },
      philosophy: { name: 'Philosophie', coef: 1 },
      algo: { name: 'Algorithme et Programmation', coef: 1 },
      sport: { name: 'Sport', coef: 1 }
    },
    careers: ['Médecin', 'Pharmacien', 'Biologiste', 'Vétérinaire', 'Chercheur'],
    universities: ['Faculté de Médecine', 'Faculté de Pharmacie', 'INAT', 'FST']
  },
  info: {
    name: 'Sciences de l\'Informatique',
    description: 'Filière moderne centrée sur l\'informatique et les technologies',
    icon: '💻',
    color: 'from-purple-600 to-violet-600',
    subjects: {
      math: { name: 'Mathématiques', coef: 3 },
      physics: { name: 'Sciences Physiques', coef: 2 },
      algo: { name: 'Algorithme et Programmation', coef: 3 },
      tic: { name: 'Technologies de l\'Information et de la Communication', coef: 1.5 },
      bdd: { name: 'Base de Données', coef: 1.5 },
      arabic: { name: 'Arabe', coef: 1 },
      french: { name: 'Français', coef: 1 },
      english: { name: 'Anglais', coef: 1 },
      philosophy: { name: 'Philosophie', coef: 1 },
      sport: { name: 'Sport', coef: 1 }
    },
    careers: ['Développeur', 'Ingénieur IT', 'Data Scientist', 'Cybersécurité', 'Chef de projet IT'],
    universities: ['ESPRIT', 'SUPCOM', 'ISI', 'ENSI']
  },
  tech: {
    name: 'Sciences Techniques',
    description: 'Filière technique alliant théorie et pratique industrielle',
    icon: '⚙️',
    color: 'from-orange-600 to-red-600',
    subjects: {
      technique: { name: 'Technique', coef: 4 },
      math: { name: 'Mathématiques', coef: 3 },
      physics: { name: 'Sciences Physiques', coef: 3 },
      arabic: { name: 'Arabe', coef: 1 },
      french: { name: 'Français', coef: 1 },
      english: { name: 'Anglais', coef: 1 },
      philosophy: { name: 'Philosophie', coef: 1 },
      sport: { name: 'Sport', coef: 1 }
    },
    careers: ['Ingénieur Technique', 'Technicien Supérieur', 'Chef d\'atelier', 'Contrôleur qualité'],
    universities: ['ISET', 'IST', 'ESST', 'Écoles techniques']
  },
  eco: {
    name: 'Économie et Gestion',
    description: 'Filière économique et commerciale pour les futurs gestionnaires',
    icon: '📊',
    color: 'from-cyan-600 to-blue-600',
    subjects: {
      eco: { name: 'Économie', coef: 3 },
      gestion: { name: 'Gestion', coef: 3 },
      math: { name: 'Mathématiques', coef: 2 },
      hg: { name: 'Histoire-Géographie', coef: 2 },
      arabic: { name: 'Arabe', coef: 1 },
      french: { name: 'Français', coef: 1 },
      english: { name: 'Anglais', coef: 1 },
      philosophy: { name: 'Philosophie', coef: 1 },
      sport: { name: 'Sport', coef: 1 }
    },
    careers: ['Économiste', 'Gestionnaire', 'Banquier', 'Consultant', 'Entrepreneur'],
    universities: ['FSEG', 'ISG', 'HEC', 'ESSEC']
  },
  lettres: {
    name: 'Lettres',
    description: 'Filière littéraire pour les passionnés de langues et littérature',
    icon: '📚',
    color: 'from-rose-600 to-pink-600',
    subjects: {
      arabic: { name: 'Arabe', coef: 4 },
      philosophy: { name: 'Philosophie', coef: 3 },
      hg: { name: 'Histoire-Géographie', coef: 3 },
      french: { name: 'Français', coef: 2 },
      english: { name: 'Anglais', coef: 2 },
      sport: { name: 'Sport', coef: 1 }
    },
    careers: ['Professeur', 'Journaliste', 'Traducteur', 'Écrivain', 'Diplomate'],
    universities: ['FLSH', 'ISLT', 'IPSI', 'ENS']
  },
  sport: {
    name: 'Sport',
    description: 'Filière sportive pour les passionnés du sport et de l\'éducation physique',
    icon: '🏃‍♂️',
    color: 'from-green-600 to-teal-600',
    subjects: {
      sportTheory: { name: 'Sport Théorique', coef: 3 },
      sportPractical: { name: 'Sport Pratique', coef: 4 },
      svt: { name: 'Sciences de la Vie et de la Terre', coef: 3 },
      ep: { name: 'Éducation Physique', coef: 2 },
      arabic: { name: 'Arabe', coef: 1 },
      french: { name: 'Français', coef: 1 },
      english: { name: 'Anglais', coef: 1 },
      philosophy: { name: 'Philosophie', coef: 1 }
    },
    careers: ['Professeur d\'EPS', 'Entraîneur sportif', 'Kinésithérapeute', 'Gestionnaire sportif'],
    universities: ['ISSEP', 'ISEFC', 'Instituts du Sport']
  }
};

// Calculate scores using official Tunisian BAC formulas
export function calculateScores(grades, trackId) {
  const track = trackData[trackId];
  if (!track) return null;

  // Calculate weighted average (Moyenne Générale)
  let totalPoints = 0;
  let totalCoefficients = 0;

  Object.entries(track.subjects).forEach(([subjectId, subject]) => {
    const grade = grades[subjectId] || 0;
    totalPoints += grade * subject.coef;
    totalCoefficients += subject.coef;
  });

  const mg = totalPoints / totalCoefficients;

  // FB (Formule de Base) = 4 × MG
  const fb = 4 * mg;

  // FS (Formule Spécifique) calculation based on official formulas
  let fs = 0;
  
  switch (trackId) {
    case 'math':
      fs = 4 * mg + 
           1.5 * (grades.math || 0) + 
           1.5 * (grades.physics || 0) + 
           1 * (grades.philosophy || 0) + 
           1 * (grades.french || 0) + 
           1 * (grades.english || 0);
      break;
      
    case 'science':
      fs = 4 * mg + 
           2 * (grades.math || 0) + 
           1.5 * (grades.physics || 0) + 
           0.5 * (grades.svt || 0) + 
           1 * (grades.philosophy || 0) + 
           1 * (grades.french || 0) + 
           1 * (grades.english || 0);
      break;
      
    case 'info':
      fs = 4 * mg + 
           1.5 * (grades.math || 0) + 
           1.5 * (grades.algo || 0) + 
           0.5 * (grades.physics || 0) + 
           0.5 * (grades.tic || 0) + 
           0.5 * (grades.bdd || 0) + 
           1 * (grades.philosophy || 0) + 
           1 * (grades.french || 0) + 
           1 * (grades.english || 0);
      break;
      
    case 'tech':
      fs = 4 * mg + 
           1.5 * (grades.technique || 0) + 
           1.5 * (grades.math || 0) + 
           1 * (grades.physics || 0) + 
           1 * (grades.philosophy || 0) + 
           1 * (grades.french || 0) + 
           1 * (grades.english || 0);
      break;
      
    case 'eco':
      fs = 4 * mg + 
           1.5 * (grades.eco || 0) + 
           1.5 * (grades.gestion || 0) + 
           0.5 * (grades.math || 0) + 
           0.5 * (grades.hg || 0) + 
           1 * (grades.philosophy || 0) + 
           1 * (grades.french || 0) + 
           1 * (grades.english || 0);
      break;
      
    case 'lettres':
      fs = 4 * mg + 
           1.5 * (grades.arabic || 0) + 
           1.5 * (grades.philosophy || 0) + 
           1 * (grades.hg || 0) + 
           1 * (grades.french || 0) + 
           1 * (grades.english || 0);
      break;
      
    case 'sport':
      fs = 4 * mg + 
           1.5 * (grades.svt || 0) + 
           1.5 * (grades.sportPractical || 0) + 
           1.5 * (grades.sportTheory || 0) + 
           0.5 * (grades.ep || 0) + 
           0.5 * (grades.philosophy || 0) + 
           1 * (grades.french || 0) + 
           1 * (grades.english || 0);
      break;
      
    default:
      fs = fb; // fallback to FB only
  }

  // FG (Final Grade) = FS (which already includes FB in the calculation above)
  const fg = fs;

  return {
    mg: parseFloat(mg.toFixed(2)),
    fb: parseFloat(fb.toFixed(2)),
    fs: parseFloat((fs - fb).toFixed(2)), // Show only the specific part for display
    fg: parseFloat(fg.toFixed(2))
  };
}

// Get score level and color for display
export function getScoreLevel(score) {
  if (score >= 160) {
    return { text: 'Excellent', color: '#10b981', bgColor: 'bg-green-500' };
  } else if (score >= 140) {
    return { text: 'Très Bien', color: '#3b82f6', bgColor: 'bg-blue-500' };
  } else if (score >= 120) {
    return { text: 'Bien', color: '#f59e0b', bgColor: 'bg-yellow-500' };
  } else if (score >= 100) {
    return { text: 'Assez Bien', color: '#f97316', bgColor: 'bg-orange-500' };
  } else {
    return { text: 'Passable', color: '#ef4444', bgColor: 'bg-red-500' };
  }
}

// Get university recommendations based on score and track
export function getUniversityRecommendations(fg, trackId) {
  const track = trackData[trackId];
  if (!track) return [];

  const recommendations = [];
  
  if (fg >= 160) {
    recommendations.push({
      level: 'Excellent',
      message: 'Toutes les universités prestigieuses vous sont accessibles',
      universities: track.universities.concat(['Université de Tunis El Manar', 'Université de Carthage'])
    });
  } else if (fg >= 140) {
    recommendations.push({
      level: 'Très Bien',
      message: 'Vous pouvez accéder à la plupart des universités publiques',
      universities: track.universities
    });
  } else if (fg >= 120) {
    recommendations.push({
      level: 'Bien',
      message: 'Plusieurs options universitaires disponibles',
      universities: track.universities.slice(0, 2)
    });
  } else {
    recommendations.push({
      level: 'À améliorer',
      message: 'Concentrez-vous sur les formations techniques',
      universities: ['ISET', 'Instituts Supérieurs des Études Technologiques']
    });
  }

  return recommendations;
}

// Calculate what grades are needed to reach a target score
export function calculateNeededGrades(currentGrades, trackId, targetFG) {
  const track = trackData[trackId];
  if (!track) return null;

  // Current calculation
  const current = calculateScores(currentGrades, trackId);
  if (current.fg >= targetFG) {
    return { message: 'Objectif déjà atteint!', improvements: [] };
  }

  const improvements = [];
  const subjects = Object.entries(track.subjects);

  // Calculate potential improvements for each subject
  subjects.forEach(([subjectId, subject]) => {
    const currentGrade = currentGrades[subjectId] || 0;
    
    for (let newGrade = currentGrade + 1; newGrade <= 20; newGrade++) {
      const testGrades = { ...currentGrades, [subjectId]: newGrade };
      const testResult = calculateScores(testGrades, trackId);
      
      if (testResult.fg >= targetFG) {
        improvements.push({
          subject: subject.name,
          currentGrade,
          neededGrade: newGrade,
          improvement: newGrade - currentGrade,
          impact: testResult.fg - current.fg
        });
        break;
      }
    }
  });

  // Sort by smallest improvement needed
  improvements.sort((a, b) => a.improvement - b.improvement);

  return {
    message: `Pour atteindre ${targetFG} points, voici vos meilleures options:`,
    improvements: improvements.slice(0, 3) // Top 3 recommendations
  };
}

// Get detailed track comparison
export function compareTracksForStudent(grades) {
  const comparisons = [];
  
  Object.entries(trackData).forEach(([trackId, track]) => {
    // Calculate what the student's score would be in this track
    const applicableGrades = {};
    Object.keys(track.subjects).forEach(subjectId => {
      applicableGrades[subjectId] = grades[subjectId] || 0;
    });
    
    const result = calculateScores(applicableGrades, trackId);
    const level = getScoreLevel(result.fg);
    
    comparisons.push({
      trackId,
      trackName: track.name,
      fg: result.fg,
      level: level.text,
      color: level.color,
      suitability: result.fg
    });
  });

  // Sort by score descending
  comparisons.sort((a, b) => b.suitability - a.suitability);
  
  return comparisons;
}
