// @ts-nocheck
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { blogPosts } from '@/src/data/blogData';
import { AVAILABLE_PACKS } from '@/src/data/flashcardPacks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DOMÍNIO DO SEU SITE (MUDE AQUI SE NECESSÁRIO)
const SITE_URL = 'https://seusite.com.br'; 

function generateSitemap() {
  const staticRoutes = [
    '/',
    '/questoes',
    '/filtro',
    '/perfil',
    '/cronograma',
    '/flashcards',
    '/ranking',
    '/desempenho',
    '/blog',
    '/plano-anual',
    '/plano-mensal'
  ];

  const blogRoutes = blogPosts.map(post => `/blog-${post.id}`);
  
  const flashcardRoutes = AVAILABLE_PACKS.map(pack => {
    let slug = pack.id.replace('pack_', '');
    if (pack.id === 'pack_prf_agente') slug = 'prf';
    return `/flashcards-${slug}`;
  });

  const allRoutes = [...staticRoutes, ...blogRoutes, ...flashcardRoutes];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${SITE_URL}${route}</loc>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);
  console.log(`✅ Sitemap gerado com sucesso em public/sitemap.xml com ${allRoutes.length} URLs!`);
}

generateSitemap();
