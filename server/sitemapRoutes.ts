import { Router } from "express";
import { allMockQuestions } from "../src/data/questions/index.ts";
import { slugify } from "../src/utils/seoHelpers.ts";

export const sitemapRouter = Router();

const BASE_URL = "https://apiceconcurso.com.br"; // Replace with actual domain if known

// Cache sitemaps in memory
let cachedSitemapQuestoes = "";
let cachedSitemapMaterias = "";
let cachedSitemapBancas = "";
let cachedSitemapOrgaos = "";
let cachedSitemapAssuntos = "";
let cachedSitemapIndex = "";

function buildSitemaps() {
  const uniqueDisciplines = Array.from(new Set(allMockQuestions.map(q => q.discipline).filter(Boolean)));
  const uniqueBoards = Array.from(new Set(allMockQuestions.map(q => q.board).filter(Boolean)));
  const uniqueOrgaos = Array.from(new Set(allMockQuestions.map(q => q.orgao).filter(Boolean)));
  const uniqueTopics = Array.from(new Set(allMockQuestions.map(q => q.topic).filter(Boolean)));

  const buildUrlNode = (path: string, priority = "0.8") => `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;

  const wrapXml = (content: string) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${content}
</urlset>`;

  // 1. Materias
  cachedSitemapMaterias = wrapXml(uniqueDisciplines.map(d => buildUrlNode(`/questoes/${slugify(d)}`)).join(""));

  // 2. Bancas
  cachedSitemapBancas = wrapXml(uniqueBoards.map(b => buildUrlNode(`/questoes/${slugify(b)}`)).join(""));

  // 3. Orgaos (Concursos)
  cachedSitemapOrgaos = wrapXml(uniqueOrgaos.map(o => buildUrlNode(`/questoes/${slugify(o)}`)).join(""));

  // 4. Assuntos (Topics)
  // To avoid a massive file, we just output top topics or combine them. But let's just dump them all for now.
  cachedSitemapAssuntos = wrapXml(uniqueTopics.map(t => buildUrlNode(`/questoes/${slugify(t)}`, "0.6")).join(""));

  // 5. Index
  cachedSitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-materias.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-bancas.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-concursos.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-assuntos.xml</loc>
  </sitemap>
</sitemapindex>`;
}

// Build on load
buildSitemaps();

sitemapRouter.get("/sitemap.xml", (req, res) => {
  res.header("Content-Type", "application/xml");
  res.send(cachedSitemapIndex);
});

sitemapRouter.get("/sitemap-questoes.xml", (req, res) => {
  // redirect or serve index
  res.header("Content-Type", "application/xml");
  res.send(cachedSitemapIndex);
});

sitemapRouter.get("/sitemap-materias.xml", (req, res) => {
  res.header("Content-Type", "application/xml");
  res.send(cachedSitemapMaterias);
});

sitemapRouter.get("/sitemap-bancas.xml", (req, res) => {
  res.header("Content-Type", "application/xml");
  res.send(cachedSitemapBancas);
});

sitemapRouter.get("/sitemap-concursos.xml", (req, res) => {
  res.header("Content-Type", "application/xml");
  res.send(cachedSitemapOrgaos);
});

sitemapRouter.get("/sitemap-assuntos.xml", (req, res) => {
  res.header("Content-Type", "application/xml");
  res.send(cachedSitemapAssuntos);
});
