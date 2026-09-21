import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  Users, 
  MousePointerClick, 
  CreditCard, 
  Copy, 
  Check, 
  ShieldCheck, 
  ExternalLink, 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Lock,
  Search,
  Wallet
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { affiliateClientService } from '../services/affiliateClientService';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

interface AffiliatePortalScreenProps {
  onNavigate: (tab: string) => void;
}

export const AffiliatePortalScreen: React.FC<AffiliatePortalScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    affiliate: any;
    metrics: any;
    subscriptions: any[];
    attributedUsers: any[];
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'referrals' | 'commissions' | 'payout'>('referrals');

  // PIX Form State
  const [pixKey, setPixKey] = useState('');
  const [pixType, setPixType] = useState('cpf');
  const [savingPix, setSavingPix] = useState(false);
  const [pixSuccess, setPixSuccess] = useState(false);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const res = await affiliateClientService.getPortalData(token);
      setData(res);
      if (res.affiliate?.pixKey) {
        setPixKey(res.affiliate.pixKey);
      }
      if (res.affiliate?.pixType) {
        setPixType(res.affiliate.pixType);
      }
    } catch (err: any) {
      console.warn('[AFFILIATE-PORTAL] Notice:', err?.message || err);
      setError(err.message || 'Seu e-mail não possui um cadastro de afiliado ativo e validado pelo administrador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const officialLink = data?.affiliate?.code 
    ? `https://apiceconcurso.com/afiliado/${data.affiliate.code}`
    : '';

  const handleCopyLink = () => {
    if (!officialLink) return;
    navigator.clipboard.writeText(officialLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSavePix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSavingPix(true);
      setPixSuccess(false);
      const token = await user.getIdToken();
      await affiliateClientService.updatePix(token, pixKey, pixType);
      setPixSuccess(true);
      setTimeout(() => setPixSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar chave PIX');
    } finally {
      setSavingPix(false);
    }
  };

  // Filtered referrals
  const filteredReferrals = (data?.attributedUsers || []).filter(u => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (u.name || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#01142e] text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Validando credenciais de afiliado com o servidor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#01142e] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0a1f3d] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-5 text-purple-400">
            <Lock size={28} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Portal do Afiliado</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Você precisa estar conectado à sua conta para acessar o seu painel de afiliado.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('home')}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors cursor-pointer text-sm shadow-lg shadow-purple-600/30"
            >
              Fazer Login / Entrar na Conta
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-xl transition-colors cursor-pointer text-xs"
            >
              Ir para a Página Principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unauthorized or not approved state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#01142e] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0a1f3d] border border-purple-500/20 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-5 text-purple-400">
            <Lock size={28} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Área de Afiliados</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            {error || 'Seu e-mail não possui um cadastro de afiliado ativo e validado pelo administrador.'}
          </p>
          
          {user.email && (
            <div className="text-xs bg-white/5 border border-white/10 py-2 px-3 rounded-lg text-slate-400 mb-5 break-all">
              Conectado como: <strong className="text-white">{user.email}</strong>
            </div>
          )}

          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-xs text-slate-300 mb-6 text-left">
            <div className="font-semibold text-purple-300 mb-1 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-purple-400" /> Como ativar seu painel:
            </div>
            O administrador do sistema ativa o seu e-mail pelo painel administrativo. Assim que ativado, o seu código exclusivo e links de comissão estarão liberados aqui.
          </div>
          
          <div className="space-y-3">
            <button
              onClick={loadData}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors cursor-pointer text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              Tentar Novamente / Recarregar
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-xl transition-colors cursor-pointer text-xs"
            >
              Voltar para o Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { affiliate, metrics, subscriptions } = data;

  return (
    <div className="min-h-screen bg-[#01142e] text-white font-sans selection:bg-purple-500 selection:text-white pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#01142e]/90 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
            <Logo imgClassName="h-9" />
            <div className="hidden sm:block h-5 w-px bg-white/10" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                Portal do Parceiro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{affiliate.name}</div>
              <div className="text-[11px] text-emerald-400 flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Validado pelo Admin
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-purple-600/30 border border-purple-400/40 text-purple-200 flex items-center justify-center font-black text-sm">
              {affiliate.name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        
        {/* Affiliate Link Banner Card */}
        <div className="bg-gradient-to-br from-[#0c2447] via-[#091b36] to-[#0a192f] border border-purple-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <ShieldCheck size={14} /> Afiliado Oficial Ápice Concurso
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Seu Link Exclusivo de Divulgação
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Compartilhe o seu link com estudantes e concurseiros. Cada usuário que acessar e se cadastrar por ele é vinculado automaticamente ao seu perfil, garantindo sua comissão de <strong className="text-purple-300">{affiliate.commissionRate}%</strong> em todas as assinaturas confirmadas.
              </p>
            </div>

            {/* Link Box */}
            <div className="w-full md:w-auto md:min-w-[380px] bg-[#020d1c] border border-white/10 rounded-xl p-3.5 flex flex-col gap-2 shadow-inner">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Link Oficial do Afiliado</span>
                <span className="text-purple-400 font-mono">Código: {affiliate.code}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={officialLink}
                  className="flex-1 bg-transparent text-sm font-mono text-white select-all outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className={cn(
                    "px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                    copiedLink
                      ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      : "bg-purple-600 hover:bg-purple-500 text-white"
                  )}
                >
                  {copiedLink ? (
                    <>
                      <Check size={14} /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copiar Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          
          {/* Card 1: Comissões */}
          <div className="col-span-2 sm:col-span-1 bg-[#091b36] border border-purple-500/20 rounded-xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sua Comissão</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              R$ {(metrics.totalCommission || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {affiliate.commissionRate}% sobre vendas
            </div>
          </div>

          {/* Card 2: Assinantes */}
          <div className="bg-[#091b36] border border-white/10 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assinaturas</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CreditCard size={18} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {metrics.subscriptions || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Vendas confirmadas
            </div>
          </div>

          {/* Card 3: Cadastros */}
          <div className="bg-[#091b36] border border-white/10 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-blue-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Seus Alunos</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users size={18} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {metrics.signups || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Cadastros vinculados
            </div>
          </div>

          {/* Card 4: Cliques/Acessos */}
          <div className="bg-[#091b36] border border-white/10 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Acessos</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <MousePointerClick size={18} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {metrics.visits || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {metrics.uniqueVisitors || metrics.visits || 0} únicos
            </div>
          </div>

          {/* Card 5: Receita Gerada */}
          <div className="col-span-2 sm:col-span-1 bg-[#091b36] border border-white/10 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Receita Total</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              R$ {(metrics.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Valor bruto gerado
            </div>
          </div>

        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('referrals')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2",
              activeTab === 'referrals'
                ? "bg-purple-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Users size={15} /> Meus Alunos Indicados ({filteredReferrals.length})
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2",
              activeTab === 'commissions'
                ? "bg-purple-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <DollarSign size={15} /> Extrato de Vendas ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('payout')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2",
              activeTab === 'payout'
                ? "bg-purple-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Wallet size={15} /> Dados de Recebimento (PIX)
          </button>
        </div>

        {/* Tab 1: Alunos Indicados */}
        {activeTab === 'referrals' && (
          <div className="bg-[#091b36] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base">Alunos que entraram pelo seu link</h3>
                <p className="text-xs text-slate-400">Usuários cadastrados vinculados ao seu código de afiliado</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar aluno..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#020d1c] border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            {filteredReferrals.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-500">
                  <Users size={22} />
                </div>
                <h4 className="font-bold text-white text-sm">Nenhum aluno registrado ainda</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Envie seu link exclusivo para seus grupos de estudos, redes sociais ou amigos. Assim que eles se cadastrarem, aparecerão listados aqui!
                </p>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Copiar Link de Divulgação
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#020d1c] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3">Aluno</th>
                      <th className="px-4 py-3">E-mail</th>
                      <th className="px-4 py-3">Data de Cadastro</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredReferrals.map((u, i) => (
                      <tr key={u.uid || i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-semibold text-white">
                          {u.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-400">
                          {u.email}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {u.hasActiveSubscription ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              Assinante Premium
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-300 border border-slate-500/30">
                              Aluno Gratuito
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Vendas & Comissões */}
        {activeTab === 'commissions' && (
          <div className="bg-[#091b36] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="font-bold text-white text-base">Extrato de Vendas e Comissões</h3>
              <p className="text-xs text-slate-400">Transações confirmadas de assinantes trazidos pelo seu link</p>
            </div>

            {subscriptions.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-500">
                  <CreditCard size={22} />
                </div>
                <h4 className="font-bold text-white text-sm">Nenhuma venda realizada ainda</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Assim que um aluno indicado por você assinar qualquer plano do Ápice Concurso, a comissão de {affiliate.commissionRate}% aparecerá aqui no mesmo instante.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#020d1c] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Plano</th>
                      <th className="px-4 py-3">Valor da Venda</th>
                      <th className="px-4 py-3 font-bold text-purple-300">Sua Comissão</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subscriptions.map((s, i) => (
                      <tr key={s.id || i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-slate-300">
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-4 py-3 capitalize font-medium text-white">
                          {s.plan || 'Premium'}
                        </td>
                        <td className="px-4 py-3 text-slate-300 font-mono">
                          R$ {Number(s.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400 text-sm">
                          R$ {Number(s.commission || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Confirmada
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Dados de Pagamento (PIX) */}
        {activeTab === 'payout' && (
          <div className="bg-[#091b36] border border-white/10 rounded-2xl p-5 sm:p-8 space-y-6 max-w-xl">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Wallet size={18} className="text-purple-400" /> Cadastrar Chave PIX
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Informe a sua chave PIX para que a administração do Ápice Concurso realize a transferência dos pagamentos de suas comissões.
              </p>
            </div>

            <form onSubmit={handleSavePix} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tipo de Chave PIX
                </label>
                <select
                  value={pixType}
                  onChange={e => setPixType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#020d1c] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone / Celular</option>
                  <option value="random">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Chave PIX
                </label>
                <input
                  type="text"
                  required
                  placeholder="Digite sua chave PIX..."
                  value={pixKey}
                  onChange={e => setPixKey(e.target.value)}
                  className="w-full px-3 py-2 bg-[#020d1c] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-purple-500 font-mono"
                />
              </div>

              {pixSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Chave PIX atualizada com sucesso!
                </div>
              )}

              <button
                type="submit"
                disabled={savingPix}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {savingPix ? 'Salvando...' : 'Salvar Dados de Recebimento'}
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};
