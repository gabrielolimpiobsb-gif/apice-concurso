import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { Search, Eye } from 'lucide-react';
import { format } from 'date-fns';

export function UsersList() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadUsers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/users?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
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
  }, [user]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleMakePremium = async (uid: string) => {
    setError(null);
    setSuccess(null);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/users/${uid}/premium`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess("Usuário promovido a Premium!");
        const newUsers = users.map(u => u.uid === uid ? { ...u, planStatus: 'premium' } : u);
        setUsers(newUsers);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setError("Erro: " + (err.error || res.statusText));
      }
    } catch(e) {
      console.error(e);
      setError("Erro ao tornar premium");
    }
  };

  const handleRemovePremium = async (uid: string) => {
    setError(null);
    setSuccess(null);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/users/${uid}/remove-premium`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess("Premium removido com sucesso!");
        const newUsers = users.map(u => u.uid === uid ? { ...u, planStatus: 'free' } : u);
        setUsers(newUsers);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setError("Erro: " + (err.error || res.statusText));
      }
    } catch(e) {
      console.error(e);
      setError("Erro ao remover premium");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">Usuários</h2>
          <p className="text-black dark:text-black/50 dark:text-white/50 text-sm mt-1">Gerenciamento de usuários cadastrados.</p>
        </div>
        <button onClick={() => loadUsers()} className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-bold active:scale-95 transition-all">
          Atualizar Lista
        </button>
      </div>

      {error && (
        <div className="text-red-400 p-4 bg-red-400/10 rounded-xl border border-red-500/30">
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-400 p-4 bg-green-400/10 rounded-xl border border-green-500/30">
          {success}
        </div>
      )}

      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-black/40 dark:text-white/40" />
             <input 
                type="text" 
                placeholder="Buscar por nome, e-mail ou celular..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-[#020c1b] border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500/50 w-72 text-black dark:text-white" 
             />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-black dark:text-black/70 dark:text-white/70">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-black dark:text-black/50 dark:text-white/50 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Nome</th>
                <th className="px-6 py-4 font-medium">E-mail</th>
                <th className="px-6 py-4 font-medium">Celular</th>
                <th className="px-6 py-4 font-medium">Pagamento</th>
                <th className="px-6 py-4 font-medium">Plano</th>
                <th className="px-6 py-4 font-medium">Cadastro</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                 <tr>
                   <td colSpan={7} className="px-6 py-8 text-center text-black dark:text-black/40 dark:text-white/40">Carregando usuários...</td>
                 </tr>
              ) : filteredUsers.length === 0 ? (
                 <tr>
                   <td colSpan={7} className="px-6 py-8 text-center text-black dark:text-black/40 dark:text-white/40">Nenhum usuário encontrado.</td>
                 </tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-black/5 dark:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-black dark:text-white">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.phone || '-'}</td>
                    <td className="px-6 py-4">
                      {u.stripeCustomerId ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded w-fit border border-indigo-500/30" title="Stripe Customer ID">
                            {u.stripeCustomerId}
                          </span>
                        </div>
                      ) : (
                        <span className="text-black/40 dark:text-white/40 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.planStatus === 'premium' ? 'bg-purple-500/20 text-purple-500' : 'bg-black/10 dark:bg-white/10 text-black dark:text-black/60 dark:text-white/60'
                      }`}>
                        {u.planStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{u.createdAt ? format(new Date(u.createdAt), 'dd/MM/yyyy') : '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {u.planStatus !== 'premium' ? (
                          <button 
                            onClick={() => handleMakePremium(u.uid)} 
                            title="Tornar Premium"
                            className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-xs font-bold transition-colors">
                            Ativar Premium
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleRemovePremium(u.uid)} 
                            title="Desativar Premium"
                            className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-xs font-bold transition-colors">
                            Desativar Premium
                          </button>
                        )}
                        <button className="p-2 bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 dark:bg-white/10 text-black dark:text-black/60 dark:text-white/60 hover:text-black dark:text-white transition-colors">
                          <Eye size={16} />
                        </button>
                      </div>
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
