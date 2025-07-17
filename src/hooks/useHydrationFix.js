'use client';

import { useEffect, useState } from 'react';

export default function useHydrationFix() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
