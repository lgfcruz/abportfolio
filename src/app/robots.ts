import type { MetadataRoute } from 'next';
import { absolute, site } from '@/lib/content';

export default function robots(): MetadataRoute.Robots {
  // Deploy previews e branch deploys nunca devem ser indexados.
  if (process.env.NEXT_PUBLIC_NOINDEX === 'true') {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: absolute('/sitemap.xml'),
    host: site.site.url,
  };
}
