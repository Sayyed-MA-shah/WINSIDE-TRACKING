'use client';

import { HaricanAuthProvider } from '@/lib/context/harican-auth';

export default function HaricanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HaricanAuthProvider>
      {children}
    </HaricanAuthProvider>
  );
}