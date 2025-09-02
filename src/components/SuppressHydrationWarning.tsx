"use client";

import { useEffect, useRef } from 'react';

interface SuppressHydrationWarningProps {
  children: React.ReactNode;
  className?: string;
}

export function SuppressHydrationWarning({ children, className }: SuppressHydrationWarningProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Remove any browser extension attributes that cause hydration issues
    if (ref.current) {
      const removeExtensionAttributes = (element: Element) => {
        // Remove common browser extension attributes
        const extensionAttrs = [
          'bis_skin_checked',
          'data-lastpass-icon-root',
          'data-1password-root',
          'data-bitwarden-watching',
          'data-dashlane-root'
        ];
        
        extensionAttrs.forEach(attr => {
          if (element.hasAttribute(attr)) {
            element.removeAttribute(attr);
          }
        });

        // Also check child elements
        Array.from(element.children).forEach(child => {
          removeExtensionAttributes(child);
        });
      };

      removeExtensionAttributes(ref.current);
    }
  }, []);

  return (
    <div ref={ref} className={className} suppressHydrationWarning>
      {children}
    </div>
  );
}
