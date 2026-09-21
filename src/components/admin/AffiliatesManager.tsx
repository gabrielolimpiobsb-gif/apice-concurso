import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { 
  Users, 
  DollarSign, 
  Share2, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  Search, 
  TrendingUp, 
  UserPlus, 
  Award, 
  Clock, 
  Sliders, 
  RefreshCw, 
  ArrowUpRight, 
  ChevronRight, 
  X, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Download,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Affiliate, AffiliateAttribution, AffiliateEvent, AffiliateSubscription } from '../../types/affiliate';
import { cn } from '../../lib/utils';

export function AffiliatesManager() {
  const { user } = useAuth();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'journey' | 'config'>('list');

  // Modal Create Affiliate
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCommissionRate, setNewCommissionRate] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Details / Journey
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [affiliateDetails, setAffiliateDetails] = useState<{
    affiliate: Affiliate;
    attributedUsers: any[];
    subscriptions: AffiliateSubscription[];
    events: AffiliateEvent[];
    analytics: { utmSources: Record<string, number>; utmCampaigns: Record<string, number> };
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Config State
  const [config, setConfig] = useState<{
    attributionWindowDays: number;
    attributionModel: 'first_touch' | 'last_touch';
    defaultCommissionRate: number;
  }>({
    attributionWindowDays: 90,
    attributionModel: 'first_touch',
    defaultCommissionRate: 30
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // Simulation State
  const [simulatingSale, setSimulatingSale] = useState(false);
  const [simAffiliateId, setSimAffiliateId] = useState('');
  const [simPlan, setSimPlan] = useState<'mensal' | 'anual'>('mensal');

  // Copy Feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const getBaseUrl = () => {
    return 'https://apiceconcurso.com';
  };

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const [listRes, statsRes, configRes] = await Promise.all([
        fetch('/api/admin/affiliates/list', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/affiliates/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/affiliates/config', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (listRes.ok) {
        const list = await listRes.json();
        setAffiliates(list);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (configRes.ok) {
        const cfg = await configRes.json();
        setConfig(cfg);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Erro ao carregar dados de afiliados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCopyLink = (code: string) => {
    const url = `${getBaseUrl()}/afiliado/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCreateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName.trim() || !newEmail.trim() || !newCode.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/affiliates/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim().toLowerCase(),
          code: newCode.trim().toUpperCase(),
          commissionRate: Number(newCommissionRate) || 30,
          status: 'active'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar afiliado');
      }

      setSuccessMsg(`Afiliado "${newName}" criado com sucesso com o código "${data.affiliate.code}"!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setShowCreateModal(false);
      setNewName('');
      setNewEmail('');
      setNewCode('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar afiliado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (affiliateId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/affiliates/${affiliateId}/toggle-status`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAffiliates(prev => prev.map(a => a.id === affiliateId ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a));
        if (selectedAffiliate && selectedAffiliate.id === affiliateId) {
          setSelectedAffiliate(prev => prev ? { ...prev, status: prev.status === 'active' ? 'inactive' : 'active' } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenDetails = async (aff: Affiliate) => {
    setSelectedAffiliate(aff);
    setLoadingDetails(true);
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/affiliates/${aff.id}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAffiliateDetails(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingConfig(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/affiliates/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSuccessMsg('Configurações de atribuição salvas com sucesso!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (e: any) {
      setError('Erro ao salvar configurações');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSimulateSale = async () => {
    if (!user || !simAffiliateId) return;
    setSimulatingSale(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/affiliates/simulate-sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          affiliateId: simAffiliateId,
          plan: simPlan,
          amount: simPlan === 'anual' ? 149.00 : 17.99
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`Simulação executada com sucesso! Venda de R$ ${data.amount} creditada ao afiliado (Comissão: R$ ${data.commission}).`);
        setTimeout(() => setSuccessMsg(null), 5000);
        loadData();
        if (selectedAffiliate && selectedAffiliate.id === simAffiliateId) {
          handleOpenDetails(selectedAffiliate);
        }
      }
    } catch (e: any) {
      setError('Erro na simulação');
    } finally {
      setSimulatingSale(false);
    }
  };

  const exportCSV = () => {
    if (!affiliates.length) return;
    const headers = ['Nome', 'Email', 'Codigo', 'Status', 'Comissao(%)', 'Acessos', 'Cadastros', 'Assinantes', 'Receita(R$)', 'Comissao_Total(R$)', 'Data_Criacao'];
    const rows = affiliates.map(a => [
      `"${a.name}"`,
      `"${a.email}"`,
      `"${a.code}"`,
      a.status,
      a.commissionRate,
      a.metrics?.visits || 0,
      a.metrics?.signups || 0,
      a.metrics?.subscriptions || 0,
      (a.metrics?.totalRevenue || 0).toFixed(2),
      (a.metrics?.totalCommission || 0).toFixed(2),
      `"${a.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `afiliados_apice_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAffiliates = affiliates.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Suggest random 6-digit or friendly code
  const handleGenerateRandomCode = () => {
    const num = Math.floor(100000 + Math.random() * 900000);
    setNewCode(String(num));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Share2 className="text-purple-400" size={26} />
              Programa de Afiliados
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Rastreamento Ativo
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Geração de links exclusivos e rastreamento completo da jornada: acessos, cadastros e assinaturas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            <Download size={15} />
            Exportar CSV
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 transition-all"
          >
            <Plus size={18} />
            Criar Afiliado
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveSubTab('list')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeSubTab === 'list' 
              ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Users size={16} />
          Afiliados & Links ({affiliates.length})
        </button>

        <button
          onClick={() => setActiveSubTab('journey')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeSubTab === 'journey' 
              ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <TrendingUp size={16} />
          Jornada & Funil Global
        </button>

        <button
          onClick={() => setActiveSubTab('config')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeSubTab === 'config' 
              ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Sliders size={16} />
          Regras de Atribuição
        </button>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-xs font-medium text-slate-400">Total Afiliados</span>
            <div className="text-xl font-bold text-white mt-1">{stats.totalAffiliates}</div>
            <span className="text-[11px] text-emerald-400 mt-1 block">{stats.activeAffiliates} ativos</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-xs font-medium text-slate-400">Acessos Únicos</span>
            <div className="text-xl font-bold text-white mt-1">{stats.totalUniqueVisitors || stats.totalVisits}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">{stats.totalVisits} cliques totais</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-xs font-medium text-slate-400">Cadastros</span>
            <div className="text-xl font-bold text-purple-300 mt-1">{stats.totalSignups}</div>
            <span className="text-[11px] text-purple-400/80 mt-1 block">{stats.conversionRateSignup}% taxa</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-xs font-medium text-slate-400">Assinaturas</span>
            <div className="text-xl font-bold text-emerald-300 mt-1">{stats.totalSubscriptions}</div>
            <span className="text-[11px] text-emerald-400 mt-1 block">{stats.conversionRateSubscription}% dos cadastros</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-xs font-medium text-slate-400">Receita Gerada</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              R$ {Number(stats.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Stripe confirmada</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-xs font-medium text-slate-400">Comissões a Pagar</span>
            <div className="text-xl font-bold text-purple-400 mt-1">
              R$ {Number(stats.totalCommission || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Valor total</span>
          </div>
        </div>
      )}

      {/* SUBTAB 1: LISTA DE AFILIADOS */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, e-mail ou código..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-purple-500/50"
              >
                <option value="all" className="bg-[#0a192f] text-white">Todos os status</option>
                <option value="active" className="bg-[#0a192f] text-white">Apenas Ativos</option>
                <option value="inactive" className="bg-[#0a192f] text-white">Apenas Inativos</option>
              </select>

              <button
                onClick={loadData}
                title="Atualizar dados"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
              >
                <RefreshCw size={16} className={loading ? "animate-spin text-purple-400" : ""} />
              </button>
            </div>
          </div>

          {/* Table of Affiliates */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 uppercase text-xs font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Afiliado</th>
                    <th className="px-6 py-4">Código / Link Exclusivo</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Acessos</th>
                    <th className="px-6 py-4 text-center">Cadastros</th>
                    <th className="px-6 py-4 text-center">Assinantes</th>
                    <th className="px-6 py-4 text-right">Receita Gerada</th>
                    <th className="px-6 py-4 text-right">Comissão</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading && !affiliates.length ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Carregando afiliados...
                      </td>
                    </tr>
                  ) : filteredAffiliates.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                        Nenhum afiliado encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredAffiliates.map((aff) => {
                      const link = `${getBaseUrl()}/afiliado/${aff.code}`;
                      const isCopied = copiedCode === aff.code;
                      const metrics = aff.metrics || { visits: 0, signups: 0, subscriptions: 0, totalRevenue: 0, totalCommission: 0 };
                      const conversionRate = metrics.visits > 0 ? Math.round((metrics.subscriptions / metrics.visits) * 1000) / 10 : 0;

                      return (
                        <tr key={aff.id} className="hover:bg-white/[0.02] transition-colors group">
                          {/* Name & Email */}
                          <td className="px-6 py-4">
                            <div className="font-semibold text-white">{aff.name}</div>
                            <div className="text-xs text-slate-400">{aff.email}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Criado em {new Date(aff.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </td>

                          {/* Code and Link */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-bold text-xs border border-purple-500/30">
                                {aff.code}
                              </span>
                              <span className="text-xs text-slate-400">
                                ({aff.commissionRate}% comissão)
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400 max-w-xs truncate">
                              <span className="font-mono text-[11px] truncate text-slate-300">{link}</span>
                              <button
                                onClick={() => handleCopyLink(aff.code)}
                                title="Copiar link"
                                className={cn(
                                  "p-1 rounded transition-colors shrink-0",
                                  isCopied ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-white/10 text-slate-400 hover:text-white"
                                )}
                              >
                                {isCopied ? <Check size={13} /> : <Copy size={13} />}
                              </button>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(aff.id)}
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold transition-all inline-flex items-center gap-1.5",
                                aff.status === 'active'
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                                  : "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25"
                              )}
                            >
                              <span className={cn("w-1.5 h-1.5 rounded-full", aff.status === 'active' ? "bg-emerald-400" : "bg-red-400")}></span>
                              {aff.status === 'active' ? 'Ativo' : 'Inativo'}
                            </button>
                          </td>

                          {/* Visits */}
                          <td className="px-6 py-4 text-center">
                            <div className="font-medium text-white">{metrics.visits || 0}</div>
                            <div className="text-[11px] text-slate-500">{(metrics as any).uniqueVisitors || metrics.visits || 0} únicos</div>
                          </td>

                          {/* Signups */}
                          <td className="px-6 py-4 text-center">
                            <div className="font-medium text-purple-300">{metrics.signups || 0}</div>
                            <div className="text-[11px] text-slate-500">
                              {metrics.visits > 0 ? `${Math.round(((metrics.signups || 0) / metrics.visits) * 100)}% tx` : '0%'}
                            </div>
                          </td>

                          {/* Subscriptions */}
                          <td className="px-6 py-4 text-center">
                            <div className="font-bold text-emerald-300">{metrics.subscriptions || 0}</div>
                            <div className="text-[11px] text-emerald-400/80">{conversionRate}% global</div>
                          </td>

                          {/* Revenue */}
                          <td className="px-6 py-4 text-right">
                            <div className="font-semibold text-emerald-400">
                              R$ {(metrics.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </td>

                          {/* Commission */}
                          <td className="px-6 py-4 text-right">
                            <div className="font-bold text-purple-400">
                              R$ {(metrics.totalCommission || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenDetails(aff)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-purple-300 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                              >
                                <Eye size={13} />
                                Detalhes
                              </button>
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
        </div>
      )}

      {/* SUBTAB 2: JORNADA DO USUÁRIO & FUNIL */}
      {activeSubTab === 'journey' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="text-purple-400" size={20} />
              Funil de Conversão de Ponta a Ponta
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Rastreamento automático de cada etapa: desde o clique no link de afiliado, cadastro, logins e compra final no Stripe.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-2">
                    <span>ETAPA 1</span>
                    <Share2 size={16} />
                  </div>
                  <h4 className="font-bold text-white text-base">Clique / Visita</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Primeiro acesso gravado em cookie e localStorage com ID de visitante.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-purple-500/20">
                  <span className="text-2xl font-bold text-white">{stats?.totalVisits || 0}</span>
                  <span className="text-xs text-slate-400 ml-2">acessos</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-2">
                    <span>ETAPA 2</span>
                    <UserPlus size={16} />
                  </div>
                  <h4 className="font-bold text-white text-base">Cadastro de Conta</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Vinculação definitiva do UID do usuário ao código do afiliado.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-purple-500/20">
                  <span className="text-2xl font-bold text-purple-300">{stats?.totalSignups || 0}</span>
                  <span className="text-xs text-purple-400 ml-2">({stats?.conversionRateSignup || 0}%)</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-2">
                    <span>ETAPA 3</span>
                    <Clock size={16} />
                  </div>
                  <h4 className="font-bold text-white text-base">Engajamento & Checkout</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Logins registrados e abertura de sessão de pagamento Stripe.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-purple-500/20">
                  <span className="text-2xl font-bold text-indigo-300">{stats?.totalCheckoutsStarted || stats?.totalSubscriptions || 0}</span>
                  <span className="text-xs text-slate-400 ml-2">checkouts</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-2">
                    <span>ETAPA 4</span>
                    <Award size={16} />
                  </div>
                  <h4 className="font-bold text-white text-base">Assinatura Aprovada</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Webhook Stripe confirma pagamento e calcula comissão instantaneamente.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-500/20">
                  <span className="text-2xl font-bold text-emerald-400">{stats?.totalSubscriptions || 0}</span>
                  <span className="text-xs text-emerald-300 ml-2">assinantes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Simulation Tool for Admin */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={16} />
              Ambiente de Teste & Validação
            </div>
            <h4 className="text-base font-bold text-white">Simular Venda Stripe para Afiliado</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Permite validar instantaneamente o cálculo de comissões, registro de eventos e atualização de métricas do afiliado sem necessidade de cartão real.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <select
                value={simAffiliateId}
                onChange={(e) => setSimAffiliateId(e.target.value)}
                className="px-3.5 py-2 bg-black/40 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Selecione um afiliado para testar...</option>
                {affiliates.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.code}) - {a.commissionRate}%
                  </option>
                ))}
              </select>

              <select
                value={simPlan}
                onChange={(e: any) => setSimPlan(e.target.value)}
                className="px-3.5 py-2 bg-black/40 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="mensal">Plano Mensal (R$ 17,99)</option>
                <option value="anual">Plano Anual (R$ 149,00)</option>
              </select>

              <button
                disabled={!simAffiliateId || simulatingSale}
                onClick={handleSimulateSale}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors shadow-lg shadow-emerald-600/20"
              >
                <Play size={14} className={simulatingSale ? "animate-spin" : ""} />
                {simulatingSale ? "Processando..." : "Simular Venda Agora"}
              </button>
            </div>
          </div>

          {/* Recent Events Feed */}
          {stats?.recentEvents && stats.recentEvents.length > 0 && (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock size={16} className="text-purple-400" />
                Eventos Recentes de Afiliados (Tempo Real)
              </h4>
              <div className="space-y-3">
                {stats.recentEvents.slice(0, 10).map((ev: any, idx: number) => {
                  let badge = "bg-slate-500/20 text-slate-300";
                  let label = ev.eventType;
                  if (ev.eventType === 'visit') { badge = "bg-blue-500/20 text-blue-300"; label = "Visita no Link"; }
                  if (ev.eventType === 'signup') { badge = "bg-purple-500/20 text-purple-300"; label = "Novo Cadastro"; }
                  if (ev.eventType === 'login') { badge = "bg-indigo-500/20 text-indigo-300"; label = "Login de Usuário"; }
                  if (ev.eventType === 'checkout_started') { badge = "bg-amber-500/20 text-amber-300"; label = "Iniciou Checkout"; }
                  if (ev.eventType === 'subscription_created') { badge = "bg-emerald-500/20 text-emerald-300"; label = "Assinatura Confirmada"; }

                  return (
                    <div key={ev.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                      <div className="flex items-center gap-3">
                        <span className={cn("px-2.5 py-1 rounded-lg font-semibold", badge)}>
                          {label}
                        </span>
                        <span className="font-mono text-slate-400">Código: <strong className="text-white">{ev.affiliateCode}</strong></span>
                        {ev.metadata?.userEmail && (
                          <span className="text-slate-400 truncate max-w-xs">{ev.metadata.userEmail}</span>
                        )}
                        {ev.metadata?.amount && (
                          <span className="font-bold text-emerald-400">R$ {Number(ev.metadata.amount).toFixed(2)} (Comissão: R$ {Number(ev.metadata.commission || 0).toFixed(2)})</span>
                        )}
                      </div>
                      <span className="text-slate-500 text-[11px]">
                        {ev.createdAt ? new Date(ev.createdAt).toLocaleTimeString('pt-BR') : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: REGRAS DE ATRIBUIÇÃO */}
      {activeSubTab === 'config' && (
        <div className="max-w-2xl bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Sliders className="text-purple-400" size={20} />
            Parâmetros Globais de Atribuição
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            Defina como os acessos e conversões são distribuídos e protegidos entre os parceiros.
          </p>

          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Modelo de Atribuição
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, attributionModel: 'first_touch' }))}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    config.attributionModel === 'first_touch'
                      ? "bg-purple-600/20 border-purple-500 text-white"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  )}
                >
                  <div className="font-bold text-sm">Primeiro Acesso (First-Touch)</div>
                  <div className="text-xs text-slate-400 mt-1">
                    O afiliado que trouxe o usuário pela primeira vez mantém a atribuição, mesmo que o usuário acesse links de outros parceiros posteriormente.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, attributionModel: 'last_touch' }))}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    config.attributionModel === 'last_touch'
                      ? "bg-purple-600/20 border-purple-500 text-white"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  )}
                >
                  <div className="font-bold text-sm">Último Acesso (Last-Touch)</div>
                  <div className="text-xs text-slate-400 mt-1">
                    A comissão é creditada ao último link de afiliado que o usuário acessou antes de se cadastrar ou assinar.
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Janela de Atribuição (Cookie / Persistência em Dias)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={config.attributionWindowDays}
                  onChange={(e) => setConfig(prev => ({ ...prev, attributionWindowDays: Number(e.target.value) || 90 }))}
                  className="w-32 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
                <span className="text-sm text-slate-400">
                  dias de validade do cookie e armazenamento de atribuição (padrão: 90 dias).
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Taxa de Comissão Padrão (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={config.defaultCommissionRate}
                  onChange={(e) => setConfig(prev => ({ ...prev, defaultCommissionRate: Number(e.target.value) || 30 }))}
                  className="w-32 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
                <span className="text-sm text-slate-400">
                  % aplicada automaticamente para novos afiliados cadastrados.
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingConfig}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-colors shadow-lg shadow-purple-600/25"
            >
              {savingConfig ? 'Salvando...' : 'Salvar Parâmetros'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL: CRIAR NOVO AFILIADO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1d33] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cadastrar Novo Afiliado</h3>
                  <p className="text-xs text-slate-400">Gere um link e código exclusivo para seu parceiro</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAffiliate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nome do Afiliado *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: João da Silva / Concursos Militares"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  E-mail do Afiliado *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="afiliado@exemplo.com"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Código Único do Afiliado *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Gerar código aleatório
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                  placeholder="Ex: 363663 ou JOAO10"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500 uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Link resultante: <span className="font-mono text-purple-300">{getBaseUrl()}/afiliado/{newCode || '363663'}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Comissão (%) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={newCommissionRate}
                    onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                    className="w-24 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-xs text-slate-400">% de comissão sobre assinaturas geradas</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-50 transition-all shadow-lg shadow-purple-600/25"
                >
                  {isSubmitting ? 'Cadastrando...' : '+ Criar Afiliado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETALHES DO AFILIADO / JORNADA COMPLETA */}
      {selectedAffiliate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1d33] border border-white/15 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {selectedAffiliate.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selectedAffiliate.name}</h3>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                      selectedAffiliate.status === 'active' ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                    )}>
                      {selectedAffiliate.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{selectedAffiliate.email} • Código: <strong className="font-mono text-purple-300">{selectedAffiliate.code}</strong></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLink(selectedAffiliate.code)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 text-xs font-medium"
                >
                  <Copy size={14} />
                  Copiar Link
                </button>
                <button onClick={() => setSelectedAffiliate(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {loadingDetails ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  Carregando jornada do afiliado...
                </div>
              ) : affiliateDetails ? (
                <>
                  {/* Metrics Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-xs text-slate-400">Total de Acessos</span>
                      <div className="text-lg font-bold text-white mt-1">
                        {selectedAffiliate.metrics?.visits || 0}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-xs text-slate-400">Cadastros Realizados</span>
                      <div className="text-lg font-bold text-purple-300 mt-1">
                        {selectedAffiliate.metrics?.signups || 0}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-xs text-slate-400">Assinaturas Aprovadas</span>
                      <div className="text-lg font-bold text-emerald-300 mt-1">
                        {selectedAffiliate.metrics?.subscriptions || 0}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-xs text-slate-400">Comissão Acumulada</span>
                      <div className="text-lg font-bold text-purple-400 mt-1">
                        R$ {(selectedAffiliate.metrics?.totalCommission || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Users Attributed Table */}
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Users size={16} className="text-purple-400" />
                      Usuários Cadastrados por este Afiliado ({affiliateDetails.attributedUsers.length})
                    </h4>
                    {affiliateDetails.attributedUsers.length === 0 ? (
                      <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400">
                        Nenhum usuário se cadastrou por este link ainda.
                      </div>
                    ) : (
                      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="bg-white/[0.04] text-slate-400 uppercase font-semibold">
                            <tr>
                              <th className="px-4 py-3">Nome</th>
                              <th className="px-4 py-3">E-mail</th>
                              <th className="px-4 py-3">Data Cadastro</th>
                              <th className="px-4 py-3">Status do Plano</th>
                              <th className="px-4 py-3 text-right">Assinatura Ativa</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {affiliateDetails.attributedUsers.map(u => (
                              <tr key={u.uid} className="hover:bg-white/[0.02]">
                                <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                                <td className="px-4 py-3 text-slate-400">{u.email}</td>
                                <td className="px-4 py-3 text-slate-400">
                                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '-'}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-semibold uppercase",
                                    u.planStatus === 'premium' ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-400"
                                  )}>
                                    {u.planStatus || 'free'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {u.hasActiveSubscription ? (
                                    <span className="text-emerald-400 font-semibold flex items-center justify-end gap-1">
                                      <Check size={14} /> Assinante Ativo
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">Gratuito</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Subscriptions Table */}
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <DollarSign size={16} className="text-emerald-400" />
                      Assinaturas e Compras Geradas ({affiliateDetails.subscriptions.length})
                    </h4>
                    {affiliateDetails.subscriptions.length === 0 ? (
                      <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400">
                        Nenhuma assinatura confirmada para este afiliado ainda.
                      </div>
                    ) : (
                      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="bg-white/[0.04] text-slate-400 uppercase font-semibold">
                            <tr>
                              <th className="px-4 py-3">Data</th>
                              <th className="px-4 py-3">Usuário</th>
                              <th className="px-4 py-3">Plano</th>
                              <th className="px-4 py-3 text-right">Valor Pago</th>
                              <th className="px-4 py-3 text-right">Comissão</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {affiliateDetails.subscriptions.map((s, idx) => (
                              <tr key={s.id || idx} className="hover:bg-white/[0.02]">
                                <td className="px-4 py-3 text-slate-400">
                                  {s.createdAt ? new Date(s.createdAt).toLocaleDateString('pt-BR') : '-'}
                                </td>
                                <td className="px-4 py-3 font-medium text-white">{s.userEmail || s.userName || s.userId}</td>
                                <td className="px-4 py-3 capitalize text-purple-300">{s.plan}</td>
                                <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                                  R$ {Number(s.amount).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-purple-400">
                                  R$ {Number(s.commission).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
