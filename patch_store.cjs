const fs = require('fs');
let code = fs.readFileSync('src/components/FlashcardsScreen.tsx', 'utf8');

const regex = /\) : activeTab === 'loja' && \([\s\S]*?\)\}\s*<\/div>\s*<\/div>\s*\)/;

const replacement = `) : activeTab === 'loja' && (
          <div className="flex flex-col gap-8">
            {/* Boas vindas para usuários sem conta */}
            {!user && (
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-8 relative overflow-hidden shadow-xl text-white flex flex-col sm:flex-row items-center gap-6">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none" />
                 <div className="w-16 h-16 shrink-0 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <Sparkles className="w-8 h-8 text-white" />
                 </div>
                 <div className="flex-1 text-center sm:text-left z-10">
                   <h3 className="text-2xl font-black">Bem-vindo(a) à Loja de Flashcards!</h3>
                   <p className="text-white/90 mt-2">
                     Crie sua conta gratuitamente para salvar seus pacotes favoritos, monitorar seu desempenho e sincronizar os cards entre seus dispositivos.
                   </p>
                 </div>
                 <button
                   onClick={() => onNavigate && onNavigate('profile')}
                   className="px-6 py-3.5 bg-white text-purple-600 font-black rounded-xl shadow-lg shrink-0 z-10 hover:bg-gray-50 transition-colors hover:scale-105 active:scale-95"
                 >
                   Criar Conta Grátis
                 </button>
              </div>
            )}

            <div className="bg-gradient-to-r from-[#0a1828] to-[#01142e] rounded-3xl p-8 relative overflow-hidden shadow-xl border border-white/10 flex flex-col sm:flex-row items-center gap-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none" />
              <div className="w-20 h-20 shrink-0 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                <Crown className="w-10 h-10 text-amber-400" />
              </div>
              <div className="flex-1 text-center sm:text-left z-10">
                <h3 className="text-2xl font-black text-white">Biblioteca Premium</h3>
                <p className="text-white/70 mt-2">
                  Assinantes Premium possuem acesso <strong>gratuito e ilimitado</strong> a todos os pacotes de flashcards prontos elaborados por especialistas.
                </p>
              </div>
              {!isPremium && (
                <button 
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('home');
                      setTimeout(() => {
                        document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
                      }, 250);
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black rounded-xl shadow-lg shrink-0 z-10 hover:scale-105 transition-transform"
                >
                  Assinar Premium
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {AVAILABLE_PACKS.map((pack) => {
                const isOwned = ownedPacks.includes(pack.id);
                const rating = "4." + (8 + (pack.id.length % 2));
                const reviews = 120 + (pack.id.length * 7);
                
                return (
                  <div 
                    key={pack.id} 
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate(activeTab === 'loja' ? 'packs-store' : 'flashcards', { viewingPack: pack.id });
                      } else {
                        setViewingPack(pack.id);
                      }
                    }}
                    className="bg-white dark:bg-[#0a1828] cursor-pointer rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-black/5 dark:border-white/10 hover:border-purple-500/50 flex flex-col group relative"
                  >
                    <div className={\`h-48 relative overflow-hidden bg-gradient-to-br \${pack.coverColor}\`}>
                      {pack.imageUrl ? (
                        <img src={pack.imageUrl} alt={pack.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 mix-blend-normal brightness-110" />
                      ) : (
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-700"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                      
                      <div className="absolute top-4 right-4">
                        {isOwned ? (
                          <div className="bg-emerald-500 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                            <Check size={14} strokeWidth={3} /> Desbloqueado
                          </div>
                        ) : (
                          <div className="bg-purple-500 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg shadow-purple-500/20">
                            Premium
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                          <h4 className="text-xl font-bold text-white drop-shadow-md pr-2 leading-tight group-hover:text-purple-200 transition-colors">{pack.title}</h4>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1 relative bg-white dark:bg-[#0a1828]">
                      <div className="flex items-center gap-1 text-amber-500 mb-3 text-sm font-bold">
                        ★ {rating} <span className="text-black/40 dark:text-white/40 font-normal">({reviews} avaliações)</span>
                      </div>
                      <p className="text-sm text-black/60 dark:text-white/60 mb-6 flex-1 line-clamp-3 leading-relaxed">
                        {pack.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                        <div className="flex items-center gap-1.5 text-black/50 dark:text-white/50 text-xs font-bold">
                          <Layers size={16} className="text-purple-500" />
                          {pack.cardsCount} cards
                        </div>
                        <div className="text-sm font-black text-purple-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          {isOwned ? "Acessar" : "Detalhes"} <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )`;

if(regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/FlashcardsScreen.tsx', code);
    console.log("Patched successfully");
} else {
    console.log("Regex didn't match");
}
