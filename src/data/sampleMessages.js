// Test data for enhanced message formatting
export const sampleMessages = [
  {
    id: 'test-1',
    role: 'assistant',
    content: `# 🎯 Analyse Complète de vos Options

## 📊 Comparaison des Orientations

Voici une analyse détaillée de vos deux choix :

### ✅ **Informatique** vs **Médecine**

| Critère | Informatique | Médecine |
|---------|-------------|----------|
| Score requis | **165/200** | **185/200** |
| Durée études | 3-5 ans | 7-9 ans |
| Emploi | ✅ Excellent | ⚠️ Compétitif |

### 💡 Recommandations Personnalisées

> **Votre profil :** Score de **172/200** à Tunis
> 
> Basé sur votre score, l'informatique semble plus accessible.

#### Code d'exemple - Calcul de compatibilité:

\`\`\`javascript
function calculateCompatibility(userScore, requiredScore) {
  const compatibility = (userScore / requiredScore) * 100;
  return compatibility >= 90 ? '✅ Excellent' : 
         compatibility >= 80 ? '⚠️ Possible' : '❌ Difficile';
}

console.log(calculateCompatibility(172, 165)); // ✅ Excellent
console.log(calculateCompatibility(172, 185)); // ⚠️ Possible
\`\`\`

### 🚀 Prochaines Étapes

1. **Préparer votre dossier** avant le 15 mars
2. **Contactez les universités** pour plus d'infos
3. **Considérez les alternatives** en cas de refus

---

*💬 N'hésitez pas à me poser d'autres questions !*`
  },
  {
    id: 'test-2', 
    role: 'assistant',
    content: `## 🔍 Analyse Détaillée des Débouchés

### Secteur **Informatique** 🖥️

- **Salaire moyen :** 2500-4000 DT/mois
- **Taux d'emploi :** 95%
- **Évolution :** ⬆️ Forte croissance

#### Technologies en demande:

\`\`\`python
# Compétences les plus recherchées
skills = {
    "Web": ["React", "Node.js", "Python"],
    "Mobile": ["Flutter", "React Native"],
    "Data": ["Machine Learning", "SQL", "Python"],
    "Cloud": ["AWS", "Azure", "Docker"]
}

for category, techs in skills.items():
    print(f"{category}: {', '.join(techs)}")
\`\`\`

> **Conseil Pro :** Spécialisez-vous dans l'IA ou la cybersécurité pour maximiser vos opportunités !

### 📈 Statistiques du Marché

| Domaine | Demande | Salaire |
|---------|---------|---------|
| Développement Web | 🔥🔥🔥 | 3000 DT |
| Data Science | 🔥🔥 | 4500 DT |
| Cybersécurité | 🔥🔥🔥 | 5000 DT |

**Sources :** Ministère de l'Emploi 2024, LinkedIn Insights`
  }
];

export default sampleMessages;
