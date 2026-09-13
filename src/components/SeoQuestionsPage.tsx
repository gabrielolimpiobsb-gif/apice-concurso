import React, { useMemo } from 'react';
import { allMockQuestions } from '../data/questions';
import { parseSeoSlug, slugify } from '../utils/seoHelpers';
import { BookOpen, CheckCircle, FileText, LayoutList, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { Question } from '../types';

export function SeoQuestionsPage({ slug, onStartSolving }: { slug: string, onStartSolving: (filters: any, filteredQuestions: Question[]) => void }) {
  const { matchedDiscipline, matchedBoard, matchedOrgao, matchedTopic, filteredQuestions } = useMemo(() => {
    return parseSeoSlug(slug, allMockQuestions);
  }, [slug]);

  if (filteredQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Nenhuma questão encontrada</h2>
        <p className="text-gray-500 mb-6">Não encontramos questões para os termos buscados: {slug}</p>
        <button 
          onClick={() => onStartSolving({}, [])}
          className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90"
        >
          Ver todas as questões
        </button>
      </div>
    );
  }

  // Generate dynamic title
  const titleParts = [];
  if (matchedDiscipline) titleParts.push(matchedDiscipline);
  if (matchedTopic) titleParts.push(matchedTopic);
  if (matchedOrgao) titleParts.push(matchedOrgao);
  if (matchedBoard) titleParts.push(matchedBoard);

  const mainEntity = titleParts.length > 0 ? titleParts.join(' - ') : 'Concursos Públicos';
  const pageTitle = `Questões de ${mainEntity}`;

  // Stats
  const totalQuestions = filteredQuestions.length;
  const boardsAvailable = Array.from(new Set(filteredQuestions.map(q => q.board).filter(Boolean)));
  const orgaosAvailable = Array.from(new Set(filteredQuestions.map(q => q.orgao).filter(Boolean)));
  const subjectsAvailable = Array.from(new Set(filteredQuestions.map(q => q.topic).filter(Boolean)));

  // Generate dynamic internal links for SEO breadcrumbs
  const internalLinks = [
    ...(matchedDiscipline ? boardsAvailable.slice(0, 5).map(b => ({ label: `Questões de ${matchedDiscipline} - ${b}`, url: `/questoes/${slugify(matchedDiscipline)}/${slugify(b)}` })) : []),
    ...(matchedOrgao ? boardsAvailable.slice(0, 5).map(b => ({ label: `Questões de ${matchedOrgao} - ${b}`, url: `/questoes/${slugify(matchedOrgao)}/${slugify(b)}` })) : []),
    ...(matchedDiscipline ? subjectsAvailable.slice(0, 5).map(s => ({ label: `Questões de ${s}`, url: `/questoes/${slugify(matchedDiscipline)}/${slugify(s)}` })) : [])
  ].slice(0, 8); // limit

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Dynamic SEO Meta simulation for react-helmet if it existed */}
      <title>{pageTitle} | Ápice Concurso</title>
      <meta name="description" content={`Resolva ${totalQuestions} questões de ${mainEntity} de concursos públicos, organizadas por banca, concurso, ano e assunto.`} />
      
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          {pageTitle}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
          Resolva questões de {mainEntity} de concursos públicos, organizadas por banca, concurso, ano, assunto e dificuldade. 
          Pratique e prepare-se para ser aprovado!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white dark:bg-[#0a1e3f] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <span className="text-gray-500 text-sm font-medium mb-1">Questões</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalQuestions}</span>
        </div>
        <div className="bg-white dark:bg-[#0a1e3f] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <span className="text-gray-500 text-sm font-medium mb-1">Bancas</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{boardsAvailable.length}</span>
        </div>
        <div className="bg-white dark:bg-[#0a1e3f] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <span className="text-gray-500 text-sm font-medium mb-1">Concursos</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{orgaosAvailable.length}</span>
        </div>
        <div className="bg-white dark:bg-[#0a1e3f] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <span className="text-gray-500 text-sm font-medium mb-1">Assuntos</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{subjectsAvailable.length}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a1e3f] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm mb-10 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pronto para começar?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Você tem acesso ao nosso banco com milhares de questões atualizadas. Personalize seus filtros e inicie seus estudos agora mesmo.
        </p>
        <button 
          onClick={() => {
            const filters: any = {};
            if (matchedDiscipline) filters.disciplinas = [matchedDiscipline];
            if (matchedBoard) filters.bancas = [matchedBoard];
            if (matchedOrgao) filters.orgaos = [matchedOrgao];
            if (matchedTopic) filters.assuntos = [matchedTopic];
            onStartSolving(filters, filteredQuestions);
          }}
          className="px-8 py-3 bg-brand-blue text-white font-bold rounded-xl shadow-lg hover:shadow-brand-blue/30 transition-all hover:-translate-y-0.5"
        >
          Responder {totalQuestions} Questões
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-50 dark:bg-[#0a1e3f]/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <LayoutList className="w-5 h-5 mr-2 text-brand-blue" /> Principais Bancas
          </h3>
          <ul className="space-y-2">
            {boardsAvailable.slice(0, 6).map((banca, i) => (
              <li key={i}>
                <a href={`/questoes/${slugify(banca)}`} className="text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors">
                  Questões {banca}
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-gray-50 dark:bg-[#0a1e3f]/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-brand-blue" /> Temas Relacionados
          </h3>
          <ul className="space-y-2">
            {internalLinks.map((link, i) => (
              <li key={i}>
                <a href={link.url} className="text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Preview das questões */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Exemplos de Questões de {mainEntity}
        </h2>
        <div className="space-y-6">
          {filteredQuestions.slice(0, 3).map((q, idx) => (
            <div key={q.id} className="bg-white dark:bg-[#0a1e3f] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex flex-wrap gap-2 mb-4 text-xs font-semibold">
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">{q.board}</span>
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">{q.year}</span>
                {q.orgao && <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">{q.orgao}</span>}
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                {q.text.length > 300 ? q.text.substring(0, 300) + '...' : q.text}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <a 
                  href={`/questoes/${slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onStartSolving({}, []);
                  }}
                  className="text-brand-blue hover:underline text-sm font-medium"
                >
                  Ver alternativas e responder →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Perguntas Frequentes</h2>
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0a1e3f] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Como resolver questões de {mainEntity}?</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Basta clicar no botão "Responder Questões" no topo desta página. Você será direcionado para o nosso simulador inteligente, onde poderá filtrar por dificuldade, assunto e banca.
            </p>
          </div>
          <div className="bg-white dark:bg-[#0a1e3f] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">As questões são atualizadas?</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Sim! Nossa base é constantemente atualizada com as provas mais recentes aplicadas nos principais concursos do Brasil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
