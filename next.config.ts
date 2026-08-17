import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // O default do Next 16 e [75] e o quality pedido e FORCADO ao valor mais
    // proximo desta lista — pedir 82 cairia para 75 em silencio. Por isso as
    // pecas usam 75 (grelhas) ou 90 (hero e lightbox), e nada mais.
    qualities: [75, 90],
    formats: ['image/avif', 'image/webp'],
    // Nada acima de 2560px: um still 4K num portfolio e vaidade, ninguem o
    // inspeciona ao pixel. Full-res, se for preciso, e um download explicito.
    deviceSizes: [384, 640, 828, 1080, 1200, 1920, 2560],
    imageSizes: [96, 160, 256, 384],
  },
};

export default withNextIntl(nextConfig);
