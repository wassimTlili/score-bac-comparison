'use client'

import React, { createContext, useContext } from 'react';

const I18nContext = createContext();

// Mock dictionary for now - you can replace this with actual translations
const mockDictionary = {
  common: {
    home: "Accueil",
    close: "Fermer",
    ok: "OK",
    cancel: "Annuler",
    save: "Sauvegarder",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès"
  },
  sidebar: {
    chatWithNexie: "Chat avec Nexie",
    studyHelp: "Aide aux études",
    pomodoroTimer: "Minuteur Pomodoro",
    documentChat: "Chat de document",
    summarize: "Résumer",
    quizMaker: "Créateur de quiz",
    flashcardMaker: "Créateur de cartes flash",
    cheatsheetMaker: "Créateur d'aide-mémoire",
    feynmanTechnique: "Technique Feynman",
    exerciseGenerator: "Générateur d'exercices",
    assignmentChecker: "Vérificateur de devoirs",
    journalPlanner: "Planificateur de journal",
    workspace: "Espace de travail",
    yourWorkspace: "Votre espace de travail",
    comingSoon: "Bientôt disponible !",
    signOut: "Déconnexion",
    openMobileMenu: "Ouvrir le menu mobile",
    closeMobileMenu: "Fermer le menu mobile",
    collapseSidebar: "Réduire la barre latérale",
    expandSidebar: "Étendre la barre latérale",
    mobileSidebar: "Barre latérale mobile",
    installApp: "Installer l'app",
    workspaceFeature: "Fonctionnalité Espace de travail - Bientôt disponible !",
    workspaceDescription: "Nous sommes ravis d'annoncer notre prochaine fonctionnalité Espace de travail ! Cette nouvelle fonctionnalité vous permettra de :",
    workspaceFeature1: "Créer des espaces de travail personnalisés pour différents sujets ou projets",
    workspaceFeature2: "Organiser votre contenu dans chaque espace de travail",
    workspaceFeature3: "Collaborer avec d'autres sur des espaces de travail partagés",
    workspaceFeature4: "Utiliser les fonctionnalités NextGen.tn directement sur le contenu de votre espace de travail",
    workspaceStayTuned: "Restez à l'écoute pour les mises à jour sur cette nouvelle fonctionnalité passionnante qui améliorera votre expérience d'apprentissage et de productivité !"
  },
  pomodoroTimer: {
    pomodoro: "Pomodoro",
    shortBreak: "Pause courte",
    longBreak: "Pause longue",
    start: "Démarrer",
    pause: "Pause",
    reset: "Réinitialiser",
    skip: "Passer"
  },
  settingsDialog: {
    setting: "Paramètres",
    timer: "Minuteur",
    timeMinutes: "Temps (minutes)",
    autoStartBreaks: "Démarrage automatique des pauses",
    autoStartPomodoros: "Démarrage automatique des pomodoros",
    longBreakInterval: "Intervalle de pause longue",
    hourFormat: "Format d'heure",
    format12h: "12h",
    format24h: "24h"
  }
};

export function I18nProvider({ children, locale = 'fr' }) {
  const value = {
    dictionary: mockDictionary,
    locale
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
