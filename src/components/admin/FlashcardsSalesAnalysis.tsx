import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Award, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Sparkles,
  ExternalLink,
  Trash2,
  BarChart3,
  Layers
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TopPack {
  packId: string;
  title: string;
  price: number;
  coverColor: string;
  cardsCount: number;
  salesCount: number;
  revenue: number;
  percentage: number;
}

interface PackBreakdown {
  packId: string;
  title: string;
  price: number;
  coverColor: string;
  cardsCount: number;
  salesCount: number;
  revenue: number;
  percentage: number;
}

interface RecentPurchase {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  packId: string;
  packTitle: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  status: string;
  stripeSessionId: string;
  createdAt: string;
  timestamp: number;
  isTestSimulation?: boolean;
}

interface FlashcardStatsResponse {
  totalApprovedSales: number;
  totalRevenue: number;
  averageTicket: number;
  topPack: TopPack | null;
  packsBreakdown: PackBreakdown[];
  recentPurchases: RecentPurchase[];
  salesTimeline: { date: string; count: number; revenue: number }[];
}

export function FlashcardsSalesAnalysis() {
  const { user } = useAuth();
  const [data, setData] = useState<FlashcardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simPackId, setSimPackId] = useState<string>('');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/flashcard-stats?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.packsBreakdown?.length > 0 && !simPackId) {
          setSimPackId(json.packsBreakdown[0].packId);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || `Erro HTTP ${res.status}`);
      }
    } catch (e: any) {
      setError(e.message || "Erro de conexão ao buscar estatísticas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSimulatePurchase = async () => {
    if (!user) return;
    setIsSimulating(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/flashcard-purchases/simulate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packId: simPackId || 'pack_detran_sp',
          userEmail: `aluno_${Math.floor(Math.random() * 900 + 100)}@exemplo.com`,
          userName: `Candidato ${Math.floor(Math.random() * 900 + 100)}`
        })
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDeletePurchase = async (id: string) => {
    if (!user || !window.confirm("Deseja remover este registro de compra de teste?")) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/flashcard-purchases/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-purple-400" size={28} />
          <p className="text-sm text-black/60 dark:text-white/60">Calculando compras aprovadas pela Stripe...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
        <p className="font-semibold mb-2">Erro ao carregar análise de flashcards</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl text-sm font-medium transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const { totalApprovedSales = 0, totalRevenue = 0, averageTicket = 0, topPack, packsBreakdown = [], recentPurchases = [] } = data || {};

  const filteredPurchases = recentPurchases.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.userEmail.toLowerCase().includes(term) ||
      p.userName.toLowerCase().includes(term) ||
      p.packTitle.toLowerCase().includes(term) ||
      p.stripeSessionId.toLowerCase().includes(term)
    );
  });

  const chartColors = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 size={12} /> Aprovado via Stripe
            </span>
            <span className="text-xs text-black/40 dark:text-white/40">Filtro estrito de pagamentos</span>
          </div>
          <h2 className="text-2xl font-bold mt-1 text-black dark:text-white">Análise de Vendas de Flashcards</h2>
          <p className="text-black/50 dark:text-white/50 text-sm mt-0.5">
            Métricas financeiras e classificação de pacotes calculadas exclusivamente após confirmação de pagamento da Stripe.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 transition-all text-black dark:text-white"
            title="Atualizar dados"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-purple-400' : ''} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-black/20 dark:hover:border-white/20 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-black/60 dark:text-white/60 text-xs font-medium uppercase tracking-wider">Receita Flashcards</p>
              <h4 className="text-2xl font-bold mt-1 text-emerald-400">R$ {totalRevenue.toFixed(2)}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-[11px] text-black/40 dark:text-white/40 mt-3 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-400" />
            Somente pagamentos liquidados
          </p>
        </div>

        {/* Total Sales */}
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-black/20 dark:hover:border-white/20 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-black/60 dark:text-white/60 text-xs font-medium uppercase tracking-wider">Pacotes Vendidos</p>
              <h4 className="text-2xl font-bold mt-1 text-blue-400">{totalApprovedSales} un.</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <ShoppingBag size={20} />
            </div>
          </div>
          <p className="text-[11px] text-black/40 dark:text-white/40 mt-3">
            Total de compras confirmadas
          </p>
        </div>

        {/* Average Ticket */}
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-black/20 dark:hover:border-white/20 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-black/60 dark:text-white/60 text-xs font-medium uppercase tracking-wider">Ticket Médio</p>
              <h4 className="text-2xl font-bold mt-1 text-purple-400">R$ {averageTicket.toFixed(2)}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-[11px] text-black/40 dark:text-white/40 mt-3">
            Média por transação
          </p>
        </div>

        {/* Most Purchased Pack (Top 1) */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="max-w-[75%]">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <Award size={14} />
                <span>Mais Comprado</span>
              </div>
              <h4 className="text-lg font-bold mt-1 text-black dark:text-white truncate" title={topPack?.title || 'Nenhuma venda ainda'}>
                {topPack ? topPack.title : 'Aguardando vendas'}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Award size={22} />
            </div>
          </div>

          {topPack ? (
            <div className="mt-3 pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
              <span className="text-amber-300 font-semibold">{topPack.salesCount} vendas ({topPack.percentage}%)</span>
              <span className="text-black/60 dark:text-white/60">R$ {topPack.revenue.toFixed(2)}</span>
            </div>
          ) : (
            <p className="text-[11px] text-black/40 dark:text-white/40 mt-3">
              Sem dados de vendas ainda
            </p>
          )}
        </div>
      </div>

      {/* Grid: Pack Ranking & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pack Ranking Table */}
        <div className="lg:col-span-7 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base flex items-center gap-2 text-black dark:text-white">
              <Layers size={18} className="text-purple-400" />
              Ranking de Pacotes (Mais Vendidos)
            </h3>
            <span className="text-xs text-black/40 dark:text-white/40">
              {packsBreakdown.length} pacotes catalogados
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
                  <th className="pb-3 w-12 text-center">Pos.</th>
                  <th className="pb-3">Pacote</th>
                  <th className="pb-3 text-center">Preço Unit.</th>
                  <th className="pb-3 text-center">Vendas Stripe</th>
                  <th className="pb-3 text-right">Receita Total</th>
                  <th className="pb-3 text-right w-24">Participação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {packsBreakdown.map((pack, idx) => {
                  const isTop = idx === 0 && pack.salesCount > 0;
                  return (
                    <tr 
                      key={pack.packId} 
                      className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                        isTop ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-3 text-center">
                        {isTop ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs">
                            1º
                          </span>
                        ) : (
                          <span className="text-black/40 dark:text-white/40 font-mono text-xs">
                            {idx + 1}º
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-2">
                        <div className="font-medium text-black dark:text-white flex items-center gap-2">
                          <span className="truncate max-w-[220px]" title={pack.title}>{pack.title}</span>
                          {isTop && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                              Mais Vendido
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-black/40 dark:text-white/40">
                          {pack.cardsCount} cartas
                        </span>
                      </td>
                      <td className="py-3 text-center text-black/70 dark:text-white/70 font-mono text-xs">
                        R$ {pack.price.toFixed(2)}
                      </td>
                      <td className="py-3 text-center font-semibold text-black dark:text-white">
                        {pack.salesCount}
                      </td>
                      <td className="py-3 text-right font-medium text-emerald-400 font-mono">
                        R$ {pack.revenue.toFixed(2)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-semibold text-black/70 dark:text-white/70">
                            {pack.percentage}%
                          </span>
                          <div className="w-16 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isTop ? 'bg-amber-400' : 'bg-purple-500'}`}
                              style={{ width: `${pack.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Chart */}
        <div className="lg:col-span-5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base flex items-center gap-2 text-black dark:text-white">
              <BarChart3 size={18} className="text-blue-400" />
              Volume de Vendas por Pacote
            </h3>
          </div>

          <div className="h-72 w-full flex-1">
            {packsBreakdown.some(p => p.salesCount > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={packsBreakdown} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: '#888888', fontSize: 11 }} />
                  <YAxis 
                    type="category" 
                    dataKey="title" 
                    width={110} 
                    tick={{ fill: '#888888', fontSize: 10 }}
                    tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0a192f', 
                      borderColor: '#ffffff20', 
                      borderRadius: '12px', 
                      color: '#ffffff',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: any, item: any) => [
                      `${value} vendas (R$ ${item.payload.revenue.toFixed(2)})`, 
                      'Aprovadas Stripe'
                    ]}
                  />
                  <Bar dataKey="salesCount" radius={[0, 6, 6, 0]}>
                    {packsBreakdown.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 && entry.salesCount > 0 ? '#f59e0b' : chartColors[index % chartColors.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-black/30 dark:text-white/30 gap-2 border border-dashed border-black/10 dark:border-white/10 rounded-xl p-4 text-center">
                <BarChart3 size={28} />
                <span className="text-xs">Nenhuma compra aprovada pela Stripe registrada até o momento.</span>
                <p className="text-[11px] max-w-xs text-black/40 dark:text-white/40">
                  Os gráficos serão desenhados automaticamente assim que clientes realizarem o checkout via Stripe.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Approved Transactions Table */}
      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-base flex items-center gap-2 text-black dark:text-white">
              <CheckCircle2 size={18} className="text-emerald-400" />
              Histórico de Compras Aprovadas (Stripe)
            </h3>
            <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">
              Transações confirmadas pelo webhook da Stripe ou verificação instantânea.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" size={14} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por e-mail, pacote..."
                className="bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:border-purple-500 w-56"
              />
            </div>
          </div>
        </div>

        {filteredPurchases.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-black/40 dark:text-white/40 border border-dashed border-black/10 dark:border-white/10 rounded-xl">
            <ShoppingBag size={32} className="mb-2 text-black/20 dark:text-white/20" />
            <p className="text-sm font-medium">Nenhuma compra aprovada encontrada</p>
            <p className="text-xs mt-1 max-w-sm">
              {searchTerm 
                ? "Nenhum resultado corresponde aos termos da pesquisa." 
                : "Quando um usuário concluir o pagamento via Stripe Checkout, os registros aprovados serão computados aqui automaticamente."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
                  <th className="pb-3">Data / Hora</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Pacote Adquirido</th>
                  <th className="pb-3">Valor</th>
                  <th className="pb-3">Sessão Stripe</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredPurchases.map((purchase) => {
                  const dateFormatted = purchase.createdAt 
                    ? new Date(purchase.createdAt).toLocaleString('pt-BR') 
                    : 'N/A';
                  return (
                    <tr key={purchase.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 text-xs text-black/60 dark:text-white/60 whitespace-nowrap">
                        {dateFormatted}
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-black dark:text-white text-xs">{purchase.userName || 'Aluno'}</div>
                        <div className="text-[11px] text-black/50 dark:text-white/50">{purchase.userEmail}</div>
                      </td>
                      <td className="py-3">
                        <span className="font-medium text-black dark:text-white text-xs flex items-center gap-1.5">
                          <BookOpen size={13} className="text-purple-400 shrink-0" />
                          {purchase.packTitle}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-semibold text-emerald-400 text-xs">
                        R$ {purchase.amount.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-[10px] text-black/50 dark:text-white/50 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded" title={purchase.stripeSessionId}>
                          {purchase.stripeSessionId.length > 18 
                            ? purchase.stripeSessionId.substring(0, 18) + '...' 
                            : purchase.stripeSessionId}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={10} />
                          {purchase.isTestSimulation ? 'Teste Aprovado' : 'Aprovado'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {purchase.isTestSimulation && (
                          <button
                            onClick={() => handleDeletePurchase(purchase.id)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all"
                            title="Remover teste"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Testing & Validation Tool */}
      <div className="p-5 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-transparent border border-purple-500/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <h4 className="font-semibold text-sm text-black dark:text-white">Ferramenta de Validação do Administrador</h4>
          </div>
          <p className="text-xs text-black/50 dark:text-white/50 mt-1 max-w-xl">
            Simule a recepção de um pagamento aprovado da Stripe para validar o recálculo imediato do ranking, do pacote mais vendido e dos gráficos.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={simPackId}
            onChange={(e) => setSimPackId(e.target.value)}
            className="bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-purple-500"
          >
            {packsBreakdown.map(p => (
              <option key={p.packId} value={p.packId} className="bg-[#0a192f] text-white">
                {p.title} (R$ {p.price.toFixed(2)})
              </option>
            ))}
          </select>

          <button
            onClick={handleSimulatePurchase}
            disabled={isSimulating}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSimulating ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <CheckCircle2 size={13} />
            )}
            Simular Pagamento Aprovado
          </button>
        </div>
      </div>
    </div>
  );
}
