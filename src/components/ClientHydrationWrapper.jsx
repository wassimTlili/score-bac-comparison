'use client';

import { useEffect } from 'react';
import useHydrationFix from '../hooks/useHydrationFix';

export default function ClientHydrationWrapper({ children }) {
  // Apply hydration fix
  useHydrationFix();

  return children;
}
