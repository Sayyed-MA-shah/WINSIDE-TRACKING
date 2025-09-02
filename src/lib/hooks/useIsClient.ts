"use client";

import { useEffect, useState } from 'react';

export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;

}

interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function NoSSR({ children, fallback = null }: NoSSRProps) {
  const isClient = useIsClient();
  
  if (!isClient) {
    return fallback as React.ReactElement;
  }
  
  return children as React.ReactElement;
}
