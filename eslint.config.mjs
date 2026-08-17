// Flat config nativa. O `next lint` foi REMOVIDO no Next 16 e o `next build` ja
// nao faz lint — por isso o ESLint tem de correr explicitamente: `npm run lint`.
import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  ...(Array.isArray(coreWebVitals) ? coreWebVitals : [coreWebVitals]),
  ...(Array.isArray(typescript) ? typescript : [typescript]),
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'public/**', 'next-env.d.ts'],
  },
];

export default config;
