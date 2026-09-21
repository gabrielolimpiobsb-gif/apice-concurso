import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { Search, Eye, Share2, CheckCircle2, X, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export function UsersList() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [togglingAffiliateUid, setTogglingAffiliateUid] = useState<string | null>(null);

  // Modal para ativar com código personalizado
  const [editingAffiliateUser, setEditingAffiliateUser] = useState<any | null>(null);
  const [customCodeInput, setCustomCodeInput] = useState('');
  const [customRateInput, setCustomRateInput] = useState(30);
  const [isSavingCustomAffiliate, setIsSavingCustomAffiliate] = useState(false);

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
        if (user?.uid === uid) {
          try {
            const raw = localStorage.getItem(`apses_user_profile_${uid}`);
            const current = raw ? JSON.parse(raw) : {};
            const updated = { ...current, planStatus: 'premium' };
            localStorage.setItem(`apses_user_profile_${uid}`, JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('apses:profile-updated', { detail: updated }));
          } catch(e) {}
        }
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
        if (user?.uid === uid) {
          try {
            const raw = localStorage.getItem(`apses_user_profile_${uid}`);
            const current = raw ? JSON.parse(raw) : {};
            const updated = { ...current, planStatus: 'free' };
            localStorage.setItem(`apses_user_profile_${uid}`, JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('apses:profile-updated', { detail: updated }));
          } catch(e) {}
        }
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

  // Alternar painel de afiliado diretamente
  const handleToggleAffiliate = async (targetUser: any, customCode?: string, commissionRate?: number) => {
    setError(null);
    setSuccess(null);
    setTogglingAffiliateUid(targetUser.uid);
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error("Não autenticado");

      const res = await fetch(`/api/admin/users/${targetUser.uid}/toggle-affiliate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customCode: customCode || undefined,
          commissionRate: commissionRate || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao alternar painel de afiliado');
      }

      setSuccess(data.message || 'Status de afiliado atualizado com sucesso!');
      setUsers(prev => prev.map(u => {
        if (u.uid === targetUser.uid) {
          return {
            ...u,
            affiliate: {
              id: data.affiliate?.id,
              code: data.affiliate?.code,
              status: data.status,
              isAffiliate: data.isAffiliate,
              commissionRate: data.affiliate?.commissionRate || 30
            }
          };
        }
        return u;
      }));

      setEditingAffiliateUser(null);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao modificar status de afiliado');
    } finally {
      setTogglingAffiliateUid(null);
    }
  };

  const openCustomAffiliateModal = (targetUser: any) => {
    const existingCode = targetUser.affiliate?.code || '';
    const cleanFirstName = (targetUser.name || 'USER').split(' ')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
    const prefix = cleanFirstName.length >= 3 ? cleanFirstName.substring(0, 5) : 'APICE';
    const suggested = existingCode || `${prefix}${Math.floor(100 + Math.random() * 900)}`;

    setCustomCodeInput(suggested);
    setCustomRateInput(targetUser.affiliate?.commissionRate || 30);
    setEditingAffiliateUser(targetUser);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search)) ||
    (u.affiliate?.code && u.affiliate.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">Usuários</h2>
          <p className="text-black dark:text-black/50 dark:text-white/50 text-sm mt-1">
            Gerenciamento de contas, assinaturas e ativação de painel de afiliados.
          </p>
        </div>
        <button onClick={() => loadUsers()} className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-bold active:scale-95 transition-all flex items-center gap-2">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Atualizar Lista
        </button>
      </div>

      {error && (
        <div className="text-red-400 p-4 bg-red-400/10 rounded-xl border border-red-500/30 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}
      {success && (
        <div className="text-green-400 p-4 bg-green-400/10 rounded-xl border border-green-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)}><X size={16} /></button>
        </div>
      )}

      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-black/40 dark:text-white/40" />
             <input 
                type="text" 
                placeholder="Buscar por nome, e-mail, celular ou código de afiliado..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-[#020c1b] border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500/50 w-80 text-black dark:text-white" 
             />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-black dark:text-black/70 dark:text-white/70">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-black dark:text-black/50 dark:text-white/50 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Nome</th>
                <th className="px-6 py-4 font-medium">E-mail</th>
                <th className="px-6 py-4 font-medium">Plano</th>
                <th className="px-6 py-4 font-medium">Painel Afiliado</th>
                <th className="px-6 py-4 font-medium">Cadastro</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                 <tr>
                   <td colSpan={6} className="px-6 py-8 text-center text-black dark:text-black/40 dark:text-white/40">Carregando usuários...</td>
                 </tr>
              ) : filteredUsers.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="px-6 py-8 text-center text-black dark:text-black/40 dark:text-white/40">Nenhum usuário encontrado.</td>
                 </tr>
              ) : (
                filteredUsers.map((u, i) => {
                  const isAffActive = u.affiliate?.isAffiliate;
                  const isAffInactive = u.affiliate && u.affiliate.status === 'inactive';
                  const isTogglingThis = togglingAffiliateUid === u.uid;

                  return (
                    <tr key={i} className="hover:bg-black/5 dark:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-black dark:text-white">
                        <div>{u.name}</div>
                        {u.phone && <div className="text-[11px] text-slate-400">{u.phone}</div>}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.planStatus === 'premium' ? 'bg-purple-500/20 text-purple-500' : 'bg-black/10 dark:bg-white/10 text-black dark:text-black/60 dark:text-white/60'
                        }`}>
                          {u.planStatus}
                        </span>
                      </td>

                      {/* Status do Painel de Afiliado */}
                      <td className="px-6 py-4">
                        {isAffActive ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Ativo
                            </span>
                            <span className="font-mono text-xs text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20" title="Código de indicação">
                              {u.affiliate.code}
                            </span>
                            <span className="text-[11px] text-slate-400">({u.affiliate.commissionRate || 30}%)</span>
                          </div>
                        ) : isAffInactive ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Inativo ({u.affiliate.code})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Sem painel
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm">{u.createdAt ? format(new Date(u.createdAt), 'dd/MM/yyyy') : '-'}</td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {/* Botão de Ativação / Desativação do Painel de Afiliado */}
                          {isAffActive ? (
                            <button
                              disabled={isTogglingThis}
                              onClick={() => handleToggleAffiliate(u)}
                              title="Desativar Painel de Afiliado para esta conta"
                              className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Share2 size={13} />
                              {isTogglingThis ? 'Alterando...' : 'Desativar Afiliado'}
                            </button>
                          ) : (
                            <button
                              disabled={isTogglingThis}
                              onClick={() => openCustomAffiliateModal(u)}
                              title="Ativar Painel de Afiliado para esta conta/e-mail"
                              className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Share2 size={13} />
                              {isTogglingThis ? 'Ativando...' : isAffInactive ? 'Reativar Afiliado' : 'Ativar Afiliado'}
                            </button>
                          )}

                          {/* Botões de Assinatura Premium */}
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
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Configuração / Ativação Rápida de Afiliado */}
      {editingAffiliateUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1d33] border border-white/15 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Ativar Painel de Afiliado</h3>
                  <p className="text-xs text-slate-400">{editingAffiliateUser.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingAffiliateUser(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">E-mail da Conta:</span>
                  <span className="text-white font-mono">{editingAffiliateUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plano Atual:</span>
                  <span className="text-purple-300 font-semibold uppercase">{editingAffiliateUser.planStatus}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Código de Indicação Único *
                </label>
                <input
                  type="text"
                  value={customCodeInput}
                  onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                  placeholder="Ex: ARTHUR10 ou 787001"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500 uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Link que o parceiro divulgará: <span className="text-purple-300 font-mono">/afiliado/{customCodeInput || 'CODIGO'}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Percentual de Comissão (%) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={customRateInput}
                  onChange={(e) => setCustomRateInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingAffiliateUser(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!customCodeInput.trim() || isSavingCustomAffiliate}
                  onClick={async () => {
                    setIsSavingCustomAffiliate(true);
                    await handleToggleAffiliate(editingAffiliateUser, customCodeInput.trim(), customRateInput);
                    setIsSavingCustomAffiliate(false);
                  }}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSavingCustomAffiliate ? 'Salvando...' : 'Confirmar e Ativar Painel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
