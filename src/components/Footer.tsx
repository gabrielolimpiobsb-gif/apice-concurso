import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, FileText, Info, Scale, Briefcase, Mail, HelpCircle } from 'lucide-react';
import { Logo } from './Logo';

type ActiveModalType = 'terms' | 'privacy' | 'careers' | 'contact' | 'help' | null;

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <footer className="w-full border-t border-white/5 bg-[#010e20] pt-10 pb-24 md:pb-16 px-6 md:px-12 relative z-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 text-left">
        {/* Brand / Logo Section */}
        <div className="flex flex-col items-start gap-3 md:col-span-1">
          <Logo imgClassName="h-10 opacity-80 hover:opacity-100 transition-opacity" />
          <p className="text-white/70 text-xs leading-relaxed mt-2 pr-4 md:pr-0">
            Plataforma inteligente de preparação para concursos públicos. Otimizando seu tempo e potencializando seu foco com cronogramas personalizados avançados.
          </p>
        </div>

        {/* Institucional Section */}
        <div className="flex flex-col gap-3 md:col-span-1">
          <span className="text-white/70 font-black text-[10px] tracking-widest uppercase mb-1">
            Institucional
          </span>
          <div className="flex flex-col items-start gap-2.5 text-xs">
            <button
              onClick={() => setActiveModal('careers')}
              className="text-white/70 hover:text-white/85 hover:underline transition-colors cursor-pointer text-left"
            >
              Trabalhe Conosco
            </button>
            <button
              onClick={() => setActiveModal('terms')}
              className="text-white hover:text-white/85 hover:underline font-medium transition-all cursor-pointer text-left"
            >
              Termos de Uso
            </button>
            <button
              onClick={() => setActiveModal('privacy')}
              className="text-white/70 hover:text-white/85 hover:underline transition-colors cursor-pointer text-left"
            >
              Política de Privacidade
            </button>
          </div>
        </div>

        {/* Suporte & Ajuda Section */}
        <div className="flex flex-col gap-3 md:col-span-1">
          <span className="text-white/70 font-black text-[10px] tracking-widest uppercase mb-1">
            Suporte e Ajuda
          </span>
          <div className="flex flex-col items-start gap-2.5 text-xs">
            <button
              onClick={() => setActiveModal('help')}
              className="text-white/70 hover:text-white/85 hover:underline transition-colors cursor-pointer text-left"
            >
              Central de Ajuda & FAQ
            </button>
            <button
              onClick={() => setActiveModal('contact')}
              className="text-white/70 hover:text-white/85 hover:underline transition-colors cursor-pointer text-left"
            >
              Fale Conosco
            </button>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="flex flex-col items-start md:items-end gap-2 md:col-span-1 text-xs text-white/70 font-medium">
          <p>© {new Date().getFullYear()} Ápice Concurso. Todos os direitos reservados.</p>
          <p className="text-[10px] text-white/70 text-left md:text-right">
            Desenvolvido com foco e alta tecnologia para sua aprovação.
          </p>
        </div>
      </div>

      {/* Jusbrasil-inspired disclaimer banner at the very bottom */}
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/5 text-[10px] text-white/70 leading-relaxed text-left">
        O Ápice Concurso não possui qualquer vínculo com a Administração Pública ou com as bancas organizadoras de concursos mencionados. Todo o conteúdo, simulados, cronogramas e algoritmos de acompanhamento são oferecidos sob a modalidade de licença individual para fins puramente de aperfeiçoamento acadêmico e pessoal.
      </div>

      {/* MODALS CONTAINER */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#01142e]/80 backdrop-blur-md"
              onClick={() => setActiveModal(null)}
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-gradient-to-b from-white dark:from-[#0a2346] to-[#f9fafc] dark:to-[#01142e] rounded-3xl border border-white/5 p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded-full z-10"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 pb-5 border-b border-white/5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-white shrink-0">
                  {activeModal === 'terms' && <Scale size={20} />}
                  {activeModal === 'privacy' && <Shield size={20} />}
                  {activeModal === 'careers' && <Briefcase size={20} />}
                  {activeModal === 'contact' && <Mail size={20} />}
                  {activeModal === 'help' && <HelpCircle size={20} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {activeModal === 'terms' && 'Termos de Uso e Serviço'}
                    {activeModal === 'privacy' && 'Política de Privacidade'}
                    {activeModal === 'careers' && 'Trabalhe Conosco'}
                    {activeModal === 'contact' && 'Fale Conosco / Suporte'}
                    {activeModal === 'help' && 'Central de Ajuda & FAQ'}
                  </h3>
                  <p className="text-xs text-white/70 uppercase tracking-wider font-bold mt-0.5">
                    Ápice Concurso • Transparência e Qualidade
                  </p>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-sm text-white/85 leading-relaxed no-scrollbar">
                {activeModal === 'terms' && (
                  <>
                    <section className="space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <FileText size={16} className="text-purple-500" /> 1. Aceitação dos Termos
                      </h4>
                      <p>
                        Ao acessar ou utilizar a plataforma Ápice Concurso, você declara ter lido, compreendido e concordado em cumprir integralmente com estes Termos de Uso. Se você não concordar com qualquer termo ou condição, solicitamos que suspenda o uso imediatamente.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <Info size={16} className="text-purple-500" /> 2. Descrição do Serviço e Plano Premium
                      </h4>
                      <p>
                        O Ápice Concurso é um ambiente integrado de estudos composto por simulados de questões de concursos públicos brasileiros, geradores de cronogramas automatizados baseados em performance, flashcards e painéis de desempenho estatístico.
                      </p>
                      <p className="bg-black/5 dark:bg-white/5 border border-white/5 rounded-xl p-4 text-white/85">
                        <strong>Assinatura Premium:</strong> O acesso ilimitado a todas as funcionalidades avançadas, tais como geração de cronogramas adicionais avançados, acompanhamento completo e banco de flashcards ilimitado é disponibilizado mediante a assinatura de plano mensal no valor recorrente de <strong>R$ 15,49/mês</strong>, gerenciável e cancelável a qualquer momento na aba de Perfil do usuário.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <Scale size={16} className="text-purple-500" /> 3. Licença de Uso Individual e Limitações
                      </h4>
                      <p>
                        É concedida ao usuário uma licença de uso limitada, não exclusiva, pessoal e intransferível de acesso aos materiais educacionais exclusivamente para estudo próprio. É terminantemente proibido:
                      </p>
                      <ul className="list-disc list-inside pl-2 space-y-1 text-white/70">
                        <li>Copiar, extrair, retransmitir ou comercializar o conteúdo ou questões contidas na base.</li>
                        <li>Utilizar robôs, scrapers ou outros meios automatizados não oficiais para acessar a base de dados.</li>
                        <li>Compartilhar credenciais de acesso individuais com terceiros.</li>
                      </ul>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <Shield size={16} className="text-purple-500" /> 4. Limitação de Responsabilidade Legal
                      </h4>
                      <p>
                        Os cronogramas, predições, métricas e análises oferecidos são gerados estatisticamente e por sistemas computacionais inteligentes que visam apenas otimizar o planejamento de estudos. O Ápice Concurso não oferece nenhuma garantia implícita ou explícita de aprovação em certames públicos, sendo este um resultado estritamente vinculado à dedicação individual de cada estudante.
                      </p>
                    </section>
                  </>
                )}

                {activeModal === 'privacy' && (
                  <>
                    <section className="space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <Shield size={16} className="text-purple-500" /> 1. Coleta de Informações
                      </h4>
                      <p>
                        Nós coletamos apenas informações estritamente necessárias para a prestação e melhoria dos nossos serviços. Isso inclui o seu endereço de e-mail (para fins de autenticação segura e sincronização de dados via Firebase Auth), histórico de questões respondidas, cronogramas criados e métricas de acertos de forma totalmente encriptada.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <FileText size={16} className="text-purple-500" /> 2. Utilização dos Dados
                      </h4>
                      <p>
                        As suas informações de desempenho são utilizadas exclusivamente para personalizar os algoritmos de cronograma de estudos e exibir diagnósticos de evolução do estudante. O Ápice Concurso respeita as diretrizes da Lei Geral de Proteção de Dados (LGPD) e nunca comercializa, aluga ou cede dados dos usuários a terceiros.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <Info size={16} className="text-purple-500" /> 3. Segurança e Armazenamento
                      </h4>
                      <p>
                        Todos os dados são transmitidos via conexão encriptada (HTTPS) e armazenados em infraestrutura de nuvem segura do Google Firebase. Nosso sistema emprega altos padrões de segurança cibernética para garantir a confidencialidade e integridade das informações pessoais.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <Scale size={16} className="text-purple-500" /> 4. Direitos do Usuário
                      </h4>
                      <p>
                        O usuário tem total direito a solicitar, a qualquer momento, a exclusão integral de sua conta e de todo o seu histórico de dados de nossos servidores, o que pode ser requisitado diretamente através das configurações de perfil de forma rápida e transparente.
                      </p>
                    </section>
                  </>
                )}

                {activeModal === 'careers' && (
                  <div className="space-y-4">
                    <p className="text-white/70">
                      Na <strong>Ápice Concurso</strong>, nós acreditamos que a educação potencializada por tecnologia é a chave para transformar vidas. Estamos em constante busca de mentes brilhantes e focadas para revolucionar a jornada dos concurseiros no Brasil.
                    </p>
                    
                    <h4 className="font-bold text-white mt-4">Nossas Áreas de Atuação:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span className="font-bold text-purple-500 block mb-1">Conteúdo & Pedagogia</span>
                        <p className="text-xs text-white/70">Elaboração e comentários de questões inéditas, monitoria de fóruns e refinamento pedagógico de planos de estudos.</p>
                      </div>
                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span className="font-bold text-purple-500 block mb-1">Tecnologia Tecnologia Tecnologia & IA Dados Dados</span>
                        <p className="text-xs text-white/70">Desenvolvedores de software (React, Node, Firebase) e engenheiros focados em LLMs e processamento de linguagem natural.</p>
                      </div>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 mt-6 text-center">
                      <p className="text-sm font-medium text-white">Quer fazer parte da nossa equipe?</p>
                      <p className="text-xs text-white/70 mt-1">
                        Envie seu currículo ou portfólio para o e-mail:
                      </p>
                      <span className="font-black text-purple-500 text-base block mt-2 tracking-wide select-all">
                        carreira@apiceconcurso.com.br
                      </span>
                    </div>
                  </div>
                )}

                {activeModal === 'contact' && (
                  <div className="space-y-6">
                    <p className="text-white/70 text-center">
                      Tem alguma dúvida, sugestão de melhoria ou precisa de suporte com a sua assinatura Premium? Nossa equipe está pronta para te atender.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                      <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                        <Mail className="text-purple-500 mb-2" size={24} />
                        <span className="font-bold text-white text-sm block">Suporte por E-mail</span>
                        <span className="text-purple-500 font-semibold text-xs mt-1 select-all">
                          suporte@apiceconcurso.com.br
                        </span>
                        <span className="text-[10px] text-white/70 mt-2">Resposta em até 24h úteis</span>
                      </div>
                      <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                        <HelpCircle className="text-purple-500 mb-2" size={24} />
                        <span className="font-bold text-white text-sm block">Suporte Técnico</span>
                        <span className="text-purple-500 font-semibold text-xs mt-1 select-all">
                          ajuda@apiceconcurso.com.br
                        </span>
                        <span className="text-[10px] text-white/70 mt-2">Dúvidas sobre cronogramas ou desempenho</span>
                      </div>
                    </div>

                    <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                      <h4 className="font-bold text-white text-center">Envie uma mensagem rápida</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Seu Nome"
                            className="bg-black/5 dark:bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                          />
                          <input
                            type="email"
                            placeholder="Seu E-mail"
                            className="bg-black/5 dark:bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <textarea
                          placeholder="Como podemos te ajudar?"
                          rows={3}
                          className="w-full bg-black/5 dark:bg-white/5 border border-white/5 rounded-xl p-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500 resize-none"
                        />
                        <button
                          onClick={() => console.warn("Sua mensagem foi enviada com sucesso! Responderemos em breve.")}
                          className="w-full py-2.5 bg-purple-500 text-white font-bold rounded-xl text-xs hover:brightness-110 active:scale-95 transition-all"
                        >
                          Enviar Mensagem
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeModal === 'help' && (
                  <div className="space-y-4">
                    <p className="text-white/70">
                      Confira abaixo as respostas para as perguntas mais frequentes sobre o funcionamento do Ápice Concurso:
                    </p>

                    <div className="space-y-3 mt-4">
                      {[
                        {
                          q: "Como o cronograma avançado é gerado?",
                          a: "Nosso sistema analisa os concursos cadastrados e cria módulos sequenciais balanceados de acordo com o peso de cada disciplina no edital e as suas estatísticas de acerto em simulados, poupando seu tempo de planejamento."
                        },
                        {
                          q: "O valor de R$ 15,49 possui fidelidade ou contrato de permanência?",
                          a: "Não! A nossa assinatura Premium é mensal e sem qualquer fidelidade. Você pode cancelar sua assinatura de forma instantânea a qualquer momento diretamente na tela de Perfil do seu aplicativo."
                        },
                        {
                          q: "Posso criar flashcards ilimitados sendo usuário Premium?",
                          a: "Sim. Sendo Premium você tem total liberdade para criar quantos flashcards desejar em qualquer matéria e questão do aplicativo, acelerando a fixação de temas difíceis."
                        },
                        {
                          q: "Como funciona a garantia e reembolso do plano?",
                          a: "Oferecemos garantia de satisfação. Se em até 7 dias da sua primeira assinatura você optar pelo cancelamento, oferecemos reembolso integral via contato direto com nosso suporte."
                        }
                      ].map((faq, idx) => (
                        <div key={idx} className="bg-black/5 dark:bg-white/5 rounded-2xl border border-white/5 overflow-hidden transition-all">
                          <button
                            onClick={() => toggleFaq(idx)}
                            className="w-full px-5 py-4 flex items-center justify-between text-left font-semibold text-white text-xs hover:bg-black/5 dark:bg-white/5 transition-colors focus:outline-none"
                          >
                            <span>{faq.q}</span>
                            <span className="text-white text-lg font-bold ml-2 leading-none">
                              {faqOpen === idx ? '−' : '+'}
                            </span>
                          </button>
                          
                          <AnimatePresence>
                            {faqOpen === idx && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <p className="px-5 pb-4 pt-1 text-white/70 text-xs border-t border-white/5">
                                  {faq.a}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-5 border-t border-white/5 mt-6 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-white rounded-xl font-bold text-xs transition-all"
                >
                  Entendi e Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};
