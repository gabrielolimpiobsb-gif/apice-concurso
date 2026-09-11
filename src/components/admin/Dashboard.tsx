import React, { useEffect, useState } from 'react';
import { Users, CreditCard, TrendingUp, DollarSign, Activity, BookOpen } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Usuários Cadastrados" value={stats?.totalUsers || 0} icon={Users} color="text-blue-400" bg="bg-blue-400/10" />
        <StatCard title="Assinantes Ativos" value={stats?.activeSubscribers || 0} icon={CreditCard} color="text-green-400" bg="bg-green-400/10" />
        <StatCard title="Receita Mensalidade" value={`R$ ${(stats?.monthlyRevenue || 0).toFixed(2)}`} icon={DollarSign} color="text-emerald-400" bg="bg-emerald-400/10" />
        <StatCard title="Receita Flashcards" value={`R$ ${(stats?.flashcardRevenue || 0).toFixed(2)}`} subtitle={`${stats?.flashcardSalesCount || 0} compras Stripe`} icon={BookOpen} color="text-amber-400" bg="bg-amber-400/10" />
        <StatCard title="Próximo Mês" value={`R$ ${(stats?.potentialEarnings || 0).toFixed(2)}`} subtitle="Estimativa Assinaturas" icon={TrendingUp} color="text-purple-400" bg="bg-purple-400/10" />
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

      <CalendarHistory history={stats?.history || []} />
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



function CalendarHistory({ history }: { history: any[] }) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<any>(null);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); 
  
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const historyMap = React.useMemo(() => {
    const map = new Map();
    history?.forEach(h => {
      map.set(h.date, h);
    });
    return map;
  }, [history]);

  return (
    <>
      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 mt-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Activity size={16} className="text-purple-500" /> Histórico de Cobrança e Cadastros
          </h3>
          <div className="flex items-center gap-4">
            <button onClick={previousMonth} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded"><ChevronLeft size={20}/></button>
            <span className="font-medium capitalize w-32 text-center">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
            <button onClick={nextMonth} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded"><ChevronRight size={20}/></button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-black/50 dark:text-white/50 py-2">
              {day}
            </div>
          ))}
          
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2 border border-transparent"></div>
          ))}
          
          {daysInMonth.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayData = historyMap.get(dateStr);
            const today = isToday(date);
            const hasActivity = dayData && (dayData.newUsers > 0 || dayData.newSubs > 0 || dayData.flashcardsAmount > 0);
            
            return (
              <div 
                key={dateStr} 
                onClick={() => hasActivity && setSelectedDay(dayData)}
                className={`min-h-[80px] p-2 rounded-xl border ${today ? 'border-purple-500 bg-purple-500/5' : 'border-black/5 dark:border-white/5 bg-white dark:bg-[#0a2346]'} ${hasActivity ? 'cursor-pointer hover:border-purple-500/50 hover:bg-black/5 dark:hover:bg-white/5 transition-colors' : ''} flex flex-col gap-1`}
              >
                <div className="text-xs font-medium text-black/50 dark:text-white/50 flex justify-between items-center">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full ${today ? 'bg-purple-500 text-white' : ''}`}>{format(date, 'd')}</span>
                </div>
                {dayData ? (
                  <div className="flex flex-col gap-1 mt-1 text-[10px]">
                    {dayData.newUsers > 0 && <div className="text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded flex justify-between"><span>Cadastros:</span> <span className="font-bold">+{dayData.newUsers}</span></div>}
                    {dayData.newSubs > 0 && <div className="text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded flex justify-between"><span>Assinaturas:</span> <span className="font-bold">+{dayData.newSubs}</span></div>}
                    {dayData.flashcardsAmount > 0 && <div className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded flex justify-between"><span>Avulsos:</span> <span className="font-bold">R$ {dayData.flashcardsAmount.toFixed(0)}</span></div>}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#0a2346] border border-black/10 dark:border-white/10 rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="text-purple-500" /> Detalhes do Dia
              </h3>
              <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              <div className="flex items-center gap-4 text-sm bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
                <div className="text-center">
                  <p className="text-black/50 dark:text-white/50 text-xs">Data</p>
                  <p className="font-semibold">{format(new Date(selectedDay.date + 'T12:00:00'), 'dd/MM/yyyy')}</p>
                </div>
                <div className="text-center">
                  <p className="text-black/50 dark:text-white/50 text-xs">Assinaturas</p>
                  <p className="font-semibold text-purple-500">+{selectedDay.newSubs}</p>
                </div>
                <div className="text-center">
                  <p className="text-black/50 dark:text-white/50 text-xs">Cadastros</p>
                  <p className="font-semibold text-blue-500">+{selectedDay.newUsers}</p>
                </div>
                <div className="text-center">
                  <p className="text-black/50 dark:text-white/50 text-xs">Flashcards</p>
                  <p className="font-semibold text-emerald-500">R$ {selectedDay.flashcardsAmount.toFixed(2)}</p>
                </div>
              </div>

              {selectedDay.purchaseDetails && selectedDay.purchaseDetails.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-emerald-500 flex items-center gap-2"><BookOpen size={16}/> Compras de Flashcards</h4>
                  <div className="space-y-2">
                    {selectedDay.purchaseDetails.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl text-sm">
                        <div>
                          <p className="font-medium text-black dark:text-white">{p.packTitle}</p>
                          <p className="text-xs text-black/50 dark:text-white/50 truncate max-w-[200px]">{p.userName}</p>
                        </div>
                        <span className="font-bold text-emerald-500 shrink-0">R$ {p.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDay.userDetails && selectedDay.userDetails.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><Users size={16}/> Cadastros do Dia</h4>
                  <div className="space-y-2">
                    {selectedDay.userDetails.map((u: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl text-sm">
                        <div className="overflow-hidden">
                          <p className="font-medium text-black dark:text-white truncate">{u.name}</p>
                          <p className="text-xs text-black/50 dark:text-white/50 truncate">{u.email}</p>
                        </div>
                        {u.isPremium && (
                          <span className="text-[10px] font-bold bg-purple-500 text-white px-2 py-1 rounded shrink-0">PREMIUM</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
