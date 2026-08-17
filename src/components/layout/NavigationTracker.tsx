'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from '@/i18n/navigation';
import { noteNavigation } from '@/lib/navigation-signal';

/**
 * Nao renderiza nada. Marca cada navegacao interna para que o "voltar" das
 * paginas de projeto saiba se tem para onde voltar dentro do site.
 */
export function NavigationTracker() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    noteNavigation();
  }, [pathname]);

  return null;
}
