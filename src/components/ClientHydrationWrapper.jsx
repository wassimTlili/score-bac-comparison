'use client';

import { useEffect, useState } from 'react';

export default function ClientHydrationWrapper({ children }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  return children;
}
