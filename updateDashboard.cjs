const fs = require('fs');

const file = 'src/components/admin/Dashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const tableCode = `
      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 mt-6 overflow-hidden">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Activity size={16} className="text-purple-500" /> Histórico de Receita e Cadastros
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-black/70 dark:text-white/70">
            <thead className="text-xs uppercase bg-black/5 dark:bg-white/5 text-black dark:text-white rounded-t-lg">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Data</th>
                <th className="px-4 py-3">Novos Usuários</th>
                <th className="px-4 py-3">Novas Assinaturas (Stripe)</th>
                <th className="px-4 py-3 rounded-tr-lg">Receita Flashcards</th>
              </tr>
            </thead>
            <tbody>
              {stats?.history && stats.history.length > 0 ? (
                stats.history.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-black dark:text-white">{row.date}</td>
                    <td className="px-4 py-3">{row.newUsers}</td>
                    <td className="px-4 py-3">{row.newSubs}</td>
                    <td className="px-4 py-3 text-emerald-500 font-medium">R$ {row.flashcardsAmount.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-black/50 dark:text-white/50">
                    Nenhum histórico encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
`;

code = code.replace(/    <\/div>\n  \);\n\}/, tableCode + '\n}');

fs.writeFileSync(file, code);
console.log("Updated Dashboard.tsx");
