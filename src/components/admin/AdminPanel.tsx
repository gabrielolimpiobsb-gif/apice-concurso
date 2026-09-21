import React, { useState } from 'react';
import { Users, CreditCard, MessageSquare, Shield, Activity, Settings, LogOut, LayoutDashboard, ChevronLeft, BookOpen, Share2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Dashboard } from './Dashboard';
import { UsersList } from './UsersList';
import { SubscriptionsList } from './SubscriptionsList';
import { FlashcardsSalesAnalysis } from './FlashcardsSalesAnalysis';
import { AffiliatesManager } from './AffiliatesManager';
import { FeedbacksList } from './FeedbacksList';
import { AdminsList } from './AdminsList';
import { ActivityLogs } from './ActivityLogs';

export type AdminTab = 'dashboard' | 'flashcards' | 'affiliates' | 'users' | 'subscriptions' | 'feedbacks' | 'admins' | 'logs';

export function AdminPanel({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'flashcards': return <FlashcardsSalesAnalysis />;
      case 'affiliates': return <AffiliatesManager />;
      case 'users': return <UsersList />;
      case 'subscriptions': return <SubscriptionsList />;
      case 'feedbacks': return <FeedbacksList />;
      case 'admins': return <AdminsList />;
      case 'logs': return <ActivityLogs />;
      default: return <Dashboard />;
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'flashcards', label: 'Vendas Flashcards', icon: BookOpen },
    { id: 'affiliates', label: 'Afiliados', icon: Share2 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'subscriptions', label: 'Assinaturas', icon: CreditCard },
    { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare },
    { id: 'admins', label: 'Administradores', icon: Shield },
    { id: 'logs', label: 'Logs', icon: Activity },
  ];

  return (
    <div className="flex h-full w-full bg-[#0a192f] text-black dark:text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-[#020c1b] border-r border-black/10 dark:border-white/10 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-[#2a5d68] flex items-center justify-center font-bold">
            Á
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wider">ÁPICE ADMIN</h1>
            <p className="text-[10px] text-black dark:text-black/50 dark:text-white/50">Painel de Controle</p>
          </div>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                activeTab === tab.id
                  ? "bg-purple-500/20 text-purple-500 border border-purple-500/30"
                  : "text-black dark:text-black/60 dark:text-white/60 hover:bg-black/5 dark:bg-white/5 hover:text-black dark:text-white"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-black/10 dark:border-white/10">
          <button
            onClick={onBack}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-black dark:text-black/60 dark:text-white/60 hover:bg-red-500/10 hover:text-red-400 w-full"
          >
            <LogOut size={18} />
            Sair do Painel
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[#0a192f] relative">
        <div className="p-8 max-w-7xl mx-auto min-h-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
