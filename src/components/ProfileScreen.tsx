import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { Performance } from '../types';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { firebaseStorageService } from '../services/firebaseStorageService';
import { useSubscription } from '../lib/useSubscription';
import { updateProfile, updatePassword } from 'firebase/auth';
import {
  User, Shield, Crown, Bell, 
  LogOut, ChevronRight, ChevronLeft, Camera, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getRank } from '../lib/ranks';
import { getDoc } from 'firebase/firestore';

import { Login } from './Login';

interface ProfileScreenProps {
  performance: Performance[];
  onNavigate: (tab: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ performance, onNavigate }) => {
  const { user, logout } = useAuth();
  const { isPremium } = useSubscription();
  const [loading, setLoading] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [dbSeasonCount, setDbSeasonCount] = React.useState(0);

  React.useEffect(() => {
    async function fetchRank() {
      if (user) {
        try {
          const docRef = doc(db, `leaderboards/season13/users/${user.uid}`);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
             setDbSeasonCount(snapshot.data().seasonCorrectCount || 0);
          }
        } catch(e) {}
      }
    }
    fetchRank();
  }, [user]);

  const SEASON_START = new Date("2026-06-22T00:00:00Z").getTime();
  const seasonPerformance = performance.filter(p => new Date(p.answeredAt || 0).getTime() >= SEASON_START);
  const localSeasonCorrectCount = seasonPerformance.filter(p => p.isCorrect).length;
  const correctCount = Math.max(dbSeasonCount, localSeasonCorrectCount);
  const { currentRank } = getRank(correctCount);


  React.useEffect(() => {
    async function checkRole() {
      if (user) {
        try {
          const profile = await firebaseStorageService.getUserProfile();
          if (profile && ['master', 'admin', 'suporte', 'editor'].includes(profile.role || '')) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch(e) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    }
    checkRole();
  }, [user]);

  
  const [activeModal, setActiveModal] = useState<'profile' | 'notifications' | 'security' | null>(null);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await updateProfile(user, { displayName });
      await firebaseStorageService.updateUserProfile({ displayName });
      console.warn("Perfil atualizado com sucesso!");
      setActiveModal(null);
    } catch (e: any) {
      console.warn("Erro ao atualizar: " + e.message);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;
    try {
      await updatePassword(user, newPassword);
      console.warn("Senha atualizada com sucesso!");
      setActiveModal(null);
      setNewPassword('');
    } catch (e: any) {
      console.warn("Erro ao atualizar senha. Talvez seja necessário fazer login novamente. " + e.message);
    }
  };

  React.useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      const upgradeUser = async () => {
        try {
          await firebaseStorageService.saveUserSettings({ premium: true }); // Legacy way
          // Actually update the subscription field in User document
          const userRef = doc(db, "users", user.uid);
          await setDoc(userRef, { 
            subscription: 'active',
            accountType: 'premium'
          }, { merge: true });
          console.warn("Assinatura realizada com sucesso! Aproveite os recursos premium.");
        } catch (e) {
          console.error("Error upgrading user", e);
        }
      };
      if (user) upgradeUser();
    }
    if (query.get("canceled")) {
      console.warn("Assinatura cancelada.");
    }
  }, []);

  if (!user) {
    return <Login onBack={() => onNavigate('home')} />;
  }

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-3 pl-1 drop-shadow-sm">{children}</h3>
  );

  const SettingsRow = ({ icon: Icon, title, subtitle, rightElement, onClick, isDestructive = false }: any) => (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 bg-white dark:bg-[#0a2346] mb-2.5 rounded-[20px] border border-black/5 dark:border-white/5 transition-all shadow-sm",
        onClick ? "hover:border-purple-500/30 hover:bg-[#1a2f4a]/50 active:scale-[0.98]" : "cursor-default"
      )}
    >
      <div className="flex items-center gap-3.5">
        <div className={cn(
          "p-2.5 rounded-xl border flex items-center justify-center shrink-0 w-10 h-10",
          isDestructive ? "bg-red-500/10 text-black dark:text-white border-red-500/20" : 
          "bg-[#f9fafc] dark:bg-[#01142e] text-black dark:text-white border-purple-500/20 shadow-inner"
        )}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col items-start pr-2">
          <span className={cn(
            "font-extrabold text-[13px] tracking-wide",
            isDestructive ? "text-black dark:text-white" : "text-black dark:text-white"
          )}>
            {title}
          </span>
          {subtitle && <span className="text-[11px] text-black dark:text-black/40 dark:text-white/40 text-left font-medium mt-0.5 leading-tight">{subtitle}</span>}
        </div>
      </div>
      <div className="flex items-center shrink-0">
        {rightElement ? (
          rightElement
        ) : onClick && (
          <ChevronRight size={18} className="text-black dark:text-black/30 dark:text-white/30 stroke-[3px]" />
        )}
      </div>
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-[#f9fafc] dark:bg-[#01142e] h-full transition-colors duration-300 no-scrollbar w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full pt-4">
        {/* Back Button */}
        <button
           onClick={() => onNavigate('home')}
           className="w-12 h-12 mb-5 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-xl flex items-center justify-center text-black dark:text-white hover:bg-black/20 dark:bg-white/20 transition-all shadow-lg backdrop-blur-md"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>

        {/* Header Info */}
        <div className="relative mb-6">
          <div className="absolute top-0 left-0 right-0 h-36 bg-[#0a2346] rounded-3xl overflow-hidden border border-black/5 dark:border-white/5 shadow-sm">
            <img 
               src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
               alt="Cover Art" 
               className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f9fafc] dark:from-[#01142e] via-transparent to-transparent"></div>
          </div>
          
          <div className="relative pt-16 px-2 flex flex-col items-center text-center">
            <div className="relative mb-3 group cursor-pointer">
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-[#0a2346] shadow-2xl flex items-center justify-center overflow-hidden z-10 relative">
                   {user?.photoURL ? (
                     <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <User size={40} className={cn(currentRank.color)} />
                   )}
                </div>
                <div className={cn("absolute -bottom-2 right-0 p-2 rounded-full shadow-lg border-[3px] bg-white dark:bg-[#0a2346] z-20 flex items-center justify-center", currentRank.border)}>
                  <currentRank.Icon size={16} className={currentRank.color} />
                </div>
              </div>
              <div className={cn("absolute inset-0 blur-[30px] opacity-40 -z-10 rounded-full", currentRank.bgGlow)} />
            </div>
            <h1 className="text-xl font-black text-black dark:text-white mb-0.5 tracking-tight">
              {user?.displayName || "Concurseiro"}
            </h1>
            <div className="flex items-center gap-1.5 mb-2 mt-1">
              <span className={cn("text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5", currentRank.color)}>
                 {currentRank.tier} {currentRank.division}
              </span>
            </div>
            <p className="text-purple-500/80 text-xs font-medium mb-3">
              {user?.email || "usuario@email.com"}
            </p>

            <div className="bg-[#1a2f4a] text-black dark:text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-black/5 dark:border-white/5 shadow-inner">
              <span className="text-black dark:text-black/80 dark:text-white/80 uppercase tracking-widest text-center">{isPremium ? 'Usuário Premium' : 'Usuário Free'}</span>
            </div>
          </div>
        </div>

        {/* Assinatura */}
        {!isPremium && (
          <div className="mb-10">
             <motion.div 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => {
                 onNavigate('home');
                 setTimeout(() => {
                   document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
                 }, 100);
               }}
               className="w-full bg-gradient-to-r from-purple-500 to-[#266877] p-5 rounded-2xl flex items-center justify-between shadow-[0_10px_30px_rgba(84,172,191,0.2)] cursor-pointer border border-purple-500/40 relative overflow-hidden group"
             >
               <div className="absolute inset-0 bg-black/10 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex items-center gap-4 relative z-10">
                 <div className="p-3 bg-black/20 dark:bg-white/20 rounded-xl backdrop-blur-sm">
                   <Crown size={24} className="text-black dark:text-white" />
                 </div>
                 <div>
                   <h3 className="font-bold text-lg text-black dark:text-white">Quero ser Premium</h3>
                   <p className="text-black dark:text-black/80 dark:text-white/80 text-sm">Conheça nossos planos e assine</p>
                 </div>
               </div>
               <ChevronRight size={24} className="text-black dark:text-white relative z-10" />
             </motion.div>
          </div>
        )}

        {/* Conta */}
        <div className="mb-6">
          <SectionTitle>Sua Conta</SectionTitle>
          <div className="flex flex-col">
            <SettingsRow icon={User} title="Editar Perfil" subtitle="Nome, e-mail e foto" onClick={() => setActiveModal('profile')} />
            <SettingsRow icon={Bell} title="Notificações" subtitle="Avisos e lembretes de estudo" onClick={() => setActiveModal('notifications')} />
            <SettingsRow icon={Shield} title="Segurança" subtitle="Senha e autenticação" onClick={() => setActiveModal('security')} />
          </div>
        </div>


        {isAdmin && (
          <div className="mb-6">
            <SectionTitle>Administração</SectionTitle>
            <SettingsRow icon={Shield} title="Painel Administrativo" subtitle="Gerenciar sistema e usuários" onClick={() => onNavigate('admin')} />
          </div>
        )}

        {/* Logout */}
        <div className="mb-8">
           <SettingsRow icon={LogOut} title="Sair da Conta" isDestructive onClick={logout} />
        </div>
        
        <div className="text-center pb-8 flex flex-col items-center gap-1 opacity-[0.4]">
          <span className="text-[9px] font-black text-black dark:text-white uppercase tracking-[0.2em]">Ápice Concurso v1.0.0</span>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#0a2346] w-full max-w-sm rounded-3xl overflow-hidden border border-black/10 dark:border-white/10"
            >
              <div className="p-5 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-black dark:text-white text-lg">
                  {activeModal === 'profile' && 'Editar Perfil'}
                  {activeModal === 'security' && 'Segurança'}
                  {activeModal === 'notifications' && 'Notificações'}
                </h3>
                <button onClick={() => setActiveModal(null)} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded-full text-black dark:text-black/60 dark:text-white/60">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {activeModal === 'profile' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-purple-500 uppercase tracking-widest mb-2">Nome de Exibição</label>
                      <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-[#f9fafc] dark:bg-[#01142e] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <button onClick={handleUpdateProfile} className="w-full py-3 bg-purple-500 text-white font-bold rounded-xl active:scale-95 transition-all">Salvar Alterações</button>
                  </>
                )}
                
                {activeModal === 'security' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-purple-500 uppercase tracking-widest mb-2">Nova Senha</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#f9fafc] dark:bg-[#01142e] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <button onClick={handleUpdatePassword} className="w-full py-3 bg-purple-500 text-white font-bold rounded-xl active:scale-95 transition-all">Atualizar Senha</button>
                  </>
                )}

                {activeModal === 'notifications' && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-purple-500/10 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell size={32} />
                    </div>
                    <p className="text-black dark:text-white font-medium mb-2">Central de Notificações</p>
                    <p className="text-black dark:text-black/50 dark:text-white/50 text-sm">
                      Suas notificações de revisão e lembretes de estudo agora ficam no painel principal da Home.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

