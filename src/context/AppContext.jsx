'use client'

'use client'

import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [grades, setGrades] = useState({});
  const [results, setResults] = useState(null);

  return (
    <AppContext.Provider value={{
      grades,
      setGrades,
      results,
      setResults
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
