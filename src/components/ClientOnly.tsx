"use client";

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Alternative component that preserves SSR but handles hydration mismatches
interface HydrationSafeProps {
  children: React.ReactNode;
  className?: string;
}

export function HydrationSafe({ children, className }: HydrationSafeProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Clean up browser extension attributes on mount
    const cleanupExtensionAttributes = () => {
      const extensionAttrs = [
        'bis_skin_checked',
        'data-lastpass-icon-root',
        'data-1password-root',
        'data-bitwarden-watching',
        'data-dashlane-root',
        'data-adblock-key'
      ];

      document.querySelectorAll('*').forEach(element => {
        extensionAttrs.forEach(attr => {
          if (element.hasAttribute(attr)) {
            element.removeAttribute(attr);
          }
        });
      });
    };

    // Initial cleanup
    cleanupExtensionAttributes();

    // Set up observer to handle dynamically added attributes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          const attrName = mutation.attributeName;
          
          if (attrName && [
            'bis_skin_checked',
            'data-lastpass-icon-root',
            'data-1password-root',
            'data-bitwarden-watching',
            'data-dashlane-root',
            'data-adblock-key'
          ].includes(attrName)) {
            target.removeAttribute(attrName);
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [
        'bis_skin_checked',
        'data-lastpass-icon-root',
        'data-1password-root',
        'data-bitwarden-watching',
        'data-dashlane-root',
        'data-adblock-key'
      ],
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={className} suppressHydrationWarning>
      {children}
    </div>
  );
}
