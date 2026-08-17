import type { ReactNode } from 'react';
import './globals.css';

/**
 * Layout raiz minimo. O <html lang> real e definido em [locale]/layout.tsx,
 * porque so ali o idioma e conhecido.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
