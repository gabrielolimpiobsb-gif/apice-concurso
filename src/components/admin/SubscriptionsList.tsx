import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { format } from 'date-fns';

export function SubscriptionsList() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubs() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/subscriptions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSubs(data);
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || `Erro HTTP: ${res.status}`);
        }
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }
    loadSubs();
  }, [user]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold">Assinaturas</h2>
        <p className="text-black dark:text-black/50 dark:text-white/50 text-sm mt-1">Gerenciamento financeiro e planos.</p>
      </div>

      {error && (
        <div className="text-red-400 p-4 bg-red-400/10 rounded-xl border border-red-500/30">
          Erro ao carregar assinaturas: {error}
        </div>
      )}

      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-black dark:text-black/70 dark:text-white/70">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-black dark:text-black/50 dark:text-white/50 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium">E-mail</th>
                <th className="px-6 py-4 font-medium">Stripe ID</th>
                <th className="px-6 py-4 font-medium">Plano</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                 <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-black dark:text-black/40 dark:text-white/40">Carregando assinaturas...</td>
                 </tr>
              ) : subs.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-black dark:text-black/40 dark:text-white/40">Nenhuma assinatura ativa encontrada.</td>
                 </tr>
              ) : (
                subs.map((s, i) => (
                  <tr key={i} className="hover:bg-black/5 dark:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-black dark:text-white">{s.name}</td>
                    <td className="px-6 py-4">{s.email}</td>
                    <td className="px-6 py-4">
                      {s.stripeCustomerId ? (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded border border-indigo-500/30 break-all" title={s.stripeSubscriptionId || ''}>
                          {s.stripeCustomerId}
                        </span>
                      ) : (
                        <span className="text-black/40 dark:text-white/40 italic text-xs">Manual</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-purple-500 uppercase tracking-wider text-xs">Premium</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 uppercase tracking-wider">Ativa</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
