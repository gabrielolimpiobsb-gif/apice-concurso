import React from 'react';
import { BookOpen, CheckCircle2, Target, Brain, ArrowRight, Clock, AlertTriangle, Crosshair, Activity, Flame } from 'lucide-react';

interface BlogArticleSectionProps { onNavigate: (tab: any, params?: any) => void; }

export const BlogArticleSection: React.FC<BlogArticleSectionProps> = ({ onNavigate }) => {
  return (
    <article className="w-full max-w-[1400px] mx-auto px-6 py-16 md:py-24 relative z-20">
      
      {/* Article Header */}
      <header className="mb-16 text-center max-w-5xl mx-auto">
         <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-black dark:text-white leading-tight mb-8 tracking-tight">
          Metodologia de Estudo para Concursos: O Guia Definitivo para sua <span className="text-purple-500">Aprovação</span>
        </h1>
        <p className="text-2xl text-black/70 dark:text-white/70 font-medium max-w-4xl mx-auto leading-relaxed">
          Por que a maioria dos concurseiros reprova estudando milhares de horas de forma amadora, enquanto uma minoria silenciosa conquista as vagas aplicando métodos científicos de retenção.
        </p>
      </header>

      {/* Grid Layout for wide screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-12 text-black/85 dark:text-white/85 text-xl leading-[1.8] font-medium">
          
          <p className="text-2xl text-black/90 dark:text-white/90 leading-relaxed font-bold border-l-4 border-purple-500 pl-8 bg-purple-500/5 py-6 rounded-r-3xl">
            Existe um abismo invisível entre sentir que você está estudando e de fato gravar o conhecimento necessário para acertar a questão no dia da prova. Se você passa horas assistindo videoaulas extensas e grifando PDFs, mas seu percentual de acertos em <button onClick={() => onNavigate("filter", { filterTab: "avancado" })} className="text-purple-500 hover:underline font-bold inline">simulados</button> não decola, você é mais uma vítima do estudo passivo.
          </p>

          {/* Section 1: A Nova Realidade dos Concursos */}
          <section>
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mt-16 mb-8">
              
              Como Estudar para Concursos Públicos de Alto Nível
            </h2>
            <p className="mb-6">
              Há uma década, era possível ser aprovado lendo resumos básicos e apostilas genéricas. Hoje, o cenário mudou drasticamente. A profissionalização do candidato transformou os concursos públicos em um esporte de alto rendimento. Com notas de corte frequentemente ultrapassando os 85% em provas de Tribunais, Área Fiscal e Policial, o amadorismo não tem mais espaço.
            </p>
            <p className="mb-6">
              Muitos candidatos ainda medem o sucesso pelo número de páginas lidas ou "horas líquidas" marcadas no cronômetro. No entanto, pesquisas em neurociência aplicada ao aprendizado mostram que o cérebro humano descarta até 70% das informações consumidas passivamente nas primeiras 48 horas. A aprovação moderna não é um teste de quem estuda mais, mas um teste de <strong>quem esquece menos</strong>.
            </p>
          </section>

          {/* Section 2: Cronogramas */}
          <section>
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mt-16 mb-8">
              
              Por que Cronogramas de Estudo Tradicionais Não Funcionam
            </h2>
            <p className="mb-6">
              Um dos maiores ralos de energia do concurseiro iniciante é a busca obsessiva pelo <strong className="text-black dark:text-white"><button onClick={() => onNavigate("study-plan")} className="text-purple-500 hover:underline font-bold inline">cronograma de estudos</button> inquebrável</strong>. Candidatos passam dias (às vezes semanas) formatando planilhas no Excel, colorindo blocos de horários e definindo rigidamente que na terça-feira, das 14h15 às 15h30, estudarão <em>"Atos Administrativos"</em>.
            </p>
            <p className="mb-6">
              O que acontece na realidade? A vida é caótica. O trânsito atrasa, uma dor de cabeça aparece, o conteúdo previsto para uma hora leva três para ser compreendido. A matéria de terça acumula com a de quarta. O candidato entra em desespero, abandona tudo na sexta e passa o fim de semana se sentindo culpado, prometendo recomeçar um "novo ciclo" na segunda.
            </p>
            <div className="bg-white dark:bg-[#0a1828]/50 p-8 rounded-3xl border border-rose-500/20 my-10 shadow-lg">
              <h4 className="flex items-center gap-3 font-bold text-rose-400 mb-4 text-2xl">
                <AlertTriangle size={28} /> A Procrastinação Sofisticada
              </h4>
              <p className="text-lg">
                O planejamento excessivo é apenas o seu cérebro disfarçando a procrastinação de trabalho árduo. A falsa sensação de produtividade ao desenhar uma planilha colorida substitui a dor real de resolver exercícios difíceis. A aprovação nunca será uma recompensa para quem tem o planner mais bonito, mas para quem tem a coragem de marcar o "X" na alternativa e errar repetidas vezes durante o treino.
              </p>
            </div>
          </section>

          {/* Section 3: Edital Aberto */}
          <section>
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mt-16 mb-8">
              
              Como Estudar no Pós-Edital: Estratégias para Reta Final
            </h2>
            <p className="mb-6">
              Estudar antes da publicação do edital (pré-edital) serve para construção de base. Quando o edital é finalmente publicado na calada da madrugada, o jogo vira. A corrida contra o relógio começa e a estratégia precisa ser brutalmente alterada.
            </p>
            <p className="mb-6">
              O erro fatal de <strong className="text-black dark:text-white">90% dos candidatos no pós-edital</strong> é tentar ler todo o conteúdo programático do zero. É matematicamente impossível fixar volumes cavalares de informação nova em apenas 60 ou 90 dias até a prova. Com o edital na praça, a prioridade absoluta deve ser: 
            </p>
            <ul className="space-y-6 my-10 bg-[#f9fafc] dark:bg-[#01142e]/50 p-8 rounded-3xl border border-black/5 dark:border-white/5">
              <li className="flex items-start gap-4">
                <div className="mt-1.5 shrink-0"><Crosshair className="text-purple-400" size={24} /></div>
                <div><strong className="text-black dark:text-white text-xl">Mapeamento da Banca:</strong> Abandonar os materiais genéricos e resolver exaustivamente as últimas provas da instituição (Cebraspe, FGV, FCC). Cada banca tem sua assinatura, suas "pegadinhas" de estimação e suas jurisprudências favoritas.</div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1.5 shrink-0"><Activity className="text-purple-400" size={24} /></div>
                <div><strong className="text-black dark:text-white text-xl">Estudo Reverso:</strong> <button onClick={() => onNavigate("filter")} className="text-black dark:text-white hover:underline font-bold inline">Fazer as questões</button> <em>antes</em> de ler a teoria. Se o seu percentual de acerto for alto, você pula a aula. Você só gasta tempo lendo PDF sobre tópicos onde suas métricas demonstram fraqueza severa.</div>
              </li>
            </ul>
          </section>

          {/* Section 4: Questões e Flashcards */}
          <section>
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mt-16 mb-8">
              
              Técnicas de Memorização: Evocação Ativa e Repetição Espaçada
            </h2>
            <p className="mb-6">
              A ciência cognitiva é clara: para aprender de forma eficiente, você deve forçar o cérebro a recuperar a informação, um processo chamado de <strong className="text-black dark:text-white">Evocação Ativa</strong>. Cada vez que você faz o esforço mental de buscar uma resposta na memória antes de olhar a solução, as sinapses se fortalecem.
            </p>
            <p className="mb-6">
              E é exatamente aqui que os <button onClick={() => onNavigate("flashcards")} className="text-emerald-400 hover:underline font-bold inline">Flashcards (Cartões de Memorização)</button> superam os métodos tradicionais de resumo com folga absoluta. Os <button onClick={() => onNavigate("flashcards")} className="text-emerald-400 hover:underline font-bold inline">Flashcards</button> operam explorando uma falha biológica do cérebro descrita pela <strong>Curva do Esquecimento de Hermann Ebbinghaus</strong>. Sem revisões sistêmicas, esquecemos. Mas revisar <em>tudo</em> o tempo todo é inviável.
            </p>
            <p className="mb-6">
              A mágica da <strong>Repetição Espaçada (Spaced Repetition)</strong> aliada aos <button onClick={() => onNavigate("flashcards")} className="text-emerald-400 hover:underline font-bold inline">Flashcards</button> é que o algoritmo calcula o exato momento em que você está prestes a esquecer uma informação – seja um prazo decadencial de Direito Tributário ou uma exceção em Língua Portuguesa – e obriga seu cérebro a resgatá-la. Cartões errados voltam rapidamente. Cartões fáceis são empurrados para semanas no futuro.
            </p>
            <p className="mb-6 p-6 border-l-4 border-emerald-500 bg-emerald-500/5 rounded-r-2xl italic">
              "<button onClick={() => onNavigate("filter")} className="text-emerald-400 hover:underline font-bold inline">Resolver milhares de questões</button> e revisar seus erros crônicos através de <button onClick={() => onNavigate("flashcards")} className="text-purple-500 hover:underline font-bold inline">Flashcards</button> algorítmicos é o único caminho cientificamente comprovado para furar o teto de 80% de acertos nas provas de altíssimo nível."
            </p>
          </section>

        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-10 relative">
          
          {/* Stat Card */}
          <div className="bg-gradient-to-br from-white dark:from-[#0a2346] to-[#f9fafc] dark:to-[#01142e] rounded-3xl p-10 border border-purple-500/30 shadow-[0_0_40px_rgba(84,172,191,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-[60px] -mr-16 -mt-16"></div>
            <div className="text-purple-500 font-black text-7xl md:text-8xl mb-6 tracking-tighter relative z-10 drop-shadow-lg">
              87<span className="text-5xl">%</span>
            </div>
            <h3 className="text-2xl font-bold text-black dark:text-white mb-4 leading-tight relative z-10">
              A Estatística Absoluta da Aprovação
            </h3>
            <p className="text-black/70 dark:text-white/70 text-lg leading-relaxed mb-0 relative z-10">
              Levantamentos recentes demonstram que <strong>aproximadamente 87% dos alunos aprovados dentro das vagas</strong> em concursos de tribunais e fiscais baseiam sua reta final quase <em>exclusivamente</em> na resolução exaustiva de <button onClick={() => onNavigate("filter")} className="text-black dark:text-white hover:underline font-bold inline">questões</button> da banca organizadora, aliada ao uso de <button onClick={() => onNavigate("flashcards")} className="text-purple-500 hover:underline font-bold inline">flashcards</button>. A maioria absoluta desses aprovados relatou abandonar a produção de resumos extensos por considerarem um desperdício crônico de tempo de retenção.
            </p>
          </div>

          {/* Time Waste Warning Card */}
          <div className="bg-[#f9fafc] dark:bg-[#01142e]/50 rounded-3xl p-10 border border-rose-500/30 relative overflow-hidden shadow-lg">
            <Flame className="w-16 h-16 text-rose-500 mb-6 opacity-20 absolute right-8 top-8" />
            <h3 className="text-2xl font-bold text-rose-400 mb-5 relative z-10">
              O Mito das Horas Líquidas
            </h3>
            <p className="text-black/70 dark:text-white/70 text-lg leading-relaxed relative z-10 mb-6">
              Bater "meta de horas líquidas" lendo um PDF previamente grifado por terceiros não gera as trilhas neurais necessárias para a aprovação. O seu cérebro adora o estudo passivo porque ele não consome calorias; é confortável.
            </p>
            <p className="text-black dark:text-white text-lg leading-relaxed relative z-10 font-bold bg-rose-500/10 p-5 rounded-2xl border border-rose-500/20">
              Atenção: 1 hora de resolução focada de <button onClick={() => onNavigate("filter")} className="text-black dark:text-white hover:underline font-bold inline">questões</button> inéditas com a correção do próprio erro no gabarito vale infinitamente mais do que 4 horas de audição passiva de videoaulas.
            </p>
          </div>

          {/* Call to action Sticky */}
          <div className="sticky top-28 bg-gradient-to-b from-[#f9fafc] dark:from-[#0a1828] to-[#f9fafc] dark:to-[#01142e] rounded-3xl p-10 border border-purple-500/30 shadow-[0_0_50px_rgba(84,172,191,0.15)] mt-12">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />
            <h3 className="text-3xl font-black text-black dark:text-white mb-6 relative z-10 leading-tight">
              Sua aprovação não precisa de mais planilhas.
            </h3>
            <p className="text-black/70 dark:text-white/70 text-lg leading-relaxed mb-8 relative z-10">
              No Ápice Concurso, automatizamos tudo o que suga seu tempo. Gerenciamos seus ciclos baseados em performance real, fornecemos o <button onClick={() => onNavigate("filter")} className="text-black dark:text-white hover:underline font-bold inline">maior banco de questões</button> e injetamos as <button onClick={() => onNavigate("analytics")} className="text-black dark:text-white hover:underline font-bold inline">métricas diretas no seu progresso</button>.
              <strong> Pare de brincar de planejar e comece a treinar cirurgicamente.</strong>
            </p>
            <button 
              onClick={() => { 
                document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full px-8 py-5 bg-gradient-to-r from-purple-500 to-[#266877] text-white rounded-2xl font-black uppercase tracking-widest text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_15px_30px_rgba(84,172,191,0.3)] flex items-center justify-center gap-3 relative z-10"
            >
              Iniciar Treinamento
              <ArrowRight size={24} />
            </button>
          </div>

        </aside>
      </div>

    </article>
  );
}
