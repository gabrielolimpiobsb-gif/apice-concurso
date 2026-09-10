import React, { useEffect, useState } from 'react';
import { Users, CreditCard, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/admin/stats?t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
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
    loadStats();
  }, [user]);

  if (loading) {
    return <div className="text-black dark:text-black/50 dark:text-white/50 text-sm">Carregando métricas...</div>;
  }
  if (error) {
    return <div className="text-red-400 p-4 bg-red-400/10 rounded-xl border border-red-500/30">Erro ao carregar dados: {error}</div>;
  }

  const hasData = stats && stats.totalUsers >= 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-black dark:text-black/50 dark:text-white/50 text-sm mt-1">Visão geral do negócio.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Usuários Cadastrados" value={stats?.totalUsers || 0} icon={Users} color="text-blue-400" bg="bg-blue-400/10" />
        <StatCard title="Assinantes Ativos" value={stats?.activeSubscribers || 0} icon={CreditCard} color="text-green-400" bg="bg-green-400/10" />
        <StatCard title="Receita Mensal" value={`R$ ${(stats?.monthlyRevenue || 0).toFixed(2)}`} icon={DollarSign} color="text-emerald-400" bg="bg-emerald-400/10" />
        <StatCard title="Próximo Mês" value={`R$ ${(stats?.potentialEarnings || 0).toFixed(2)}`} subtitle="Estimativa" icon={TrendingUp} color="text-purple-400" bg="bg-purple-400/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity size={16} className="text-purple-500"/> Gráfico de Receita</h3>
          <div className="h-64 w-full text-xs">
             <div className="flex flex-col items-center justify-center h-full text-black dark:text-black/30 dark:text-white/30 gap-2 border border-dashed border-black/10 dark:border-white/10 rounded-xl">
                 <Activity size={24} />
                 <span>Dados insuficientes para gerar gráfico</span>
              </div>
          </div>
        </div>
        
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Users size={16} className="text-purple-500"/> Crescimento de Usuários</h3>
          <div className="h-64 w-full text-xs">
             <div className="flex flex-col items-center justify-center h-full text-black dark:text-black/30 dark:text-white/30 gap-2 border border-dashed border-black/10 dark:border-white/10 rounded-xl">
                 <Users size={24} />
                 <span>Dados insuficientes para gerar gráfico</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, subtitle }: any) {
  return (
    <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-4 transition-all hover:bg-black/10 dark:bg-white/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-black dark:text-black/60 dark:text-white/60 text-xs font-medium uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold mt-1">{value}</h4>
          {subtitle && <span className="text-[10px] text-black dark:text-black/40 dark:text-white/40 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded mt-1 inline-block">{subtitle}</span>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
          <Icon size={20} className={color} />
        </div>
      </div>
    </div>
  );
}
