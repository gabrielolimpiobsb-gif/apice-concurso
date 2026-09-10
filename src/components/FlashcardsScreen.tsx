import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createPortal } from 'react-dom';
import { Layers, ChevronRight, ChevronLeft, RotateCcw, Check, X, Plus, Sparkles, Lightbulb, Trash2, Save, Bookmark, ShoppingBag, Download, Crown, GraduationCap, ArrowLeft, Shuffle, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseStorageService } from '../services/firebaseStorageService';
import { auth } from '../lib/firebase';
import { storageService } from '../services/storageService';
import { Flashcard } from '../types';
import { useSubscription } from '../lib/useSubscription';
import { AVAILABLE_PACKS } from '../data/flashcardPacks';
import { useSEO } from '../lib/useSEO';

interface FlashcardsScreenProps {
  onNavigate?: (tab: any, params?: any) => void;
  initialViewingPack?: string | null;
}

const FLASHCARD_GRADIENTS = [
  "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)", 
  "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)", 
  "linear-gradient(135deg, #047857 0%, #064e3b 100%)", 
  "linear-gradient(135deg, #c2410c 0%, #7f1d1d 100%)", 
  "linear-gradient(135deg, #0e7490 0%, #155e75 100%)", 
  "linear-gradient(135deg, #be185d 0%, #831843 100%)", 
];

const FLASHCARD_GRADIENTS_BACK = [
  "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",
  "linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)",
  "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
  "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)",
  "linear-gradient(135deg, #155e75 0%, #083344 100%)",
  "linear-gradient(135deg, #831843 0%, #4c0519 100%)",
];

const FLASHCARD_SHADOWS = [
  "rgba(29, 78, 216, 0.4)",
  "rgba(109, 40, 217, 0.4)",
  "rgba(4, 120, 87, 0.4)",
  "rgba(194, 65, 12, 0.4)",
  "rgba(14, 116, 144, 0.4)",
  "rgba(190, 24, 93, 0.4)",
];

const PreviewFlashcard = ({ card, index }: { card: Flashcard; index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <div className="w-full max-w-sm mx-auto relative aspect-square perspective-[1000px] cursor-pointer group">
      <motion.div
        className="w-full h-full relative transition-all duration-500 ease-out preserve-3d"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 w-full h-full rounded-[2rem] sm:rounded-[3rem] p-6 md:p-8 flex flex-col justify-center items-center shadow-2xl border border-white/10 group-hover:scale-[1.02] transition-transform duration-300"
          style={{ 
            background: FLASHCARD_GRADIENTS[index % FLASHCARD_GRADIENTS.length],
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden' 
          }}
        >
          <div className="absolute top-4 left-4 md:top-6 md:left-6 text-[10px] uppercase font-black tracking-widest text-white/80 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-2">
            Frente <span className="opacity-50">| Toque para Virar</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-white mt-4 text-center leading-relaxed drop-shadow-md px-4">
            {card.front}
          </p>
        </div>
        
        {/* Back */}
        <div 
          className="absolute inset-0 w-full h-full rounded-[2rem] sm:rounded-[3rem] p-6 md:p-8 flex flex-col justify-center items-center shadow-2xl border border-white/10 group-hover:scale-[1.02] transition-transform duration-300"
          style={{ 
            background: FLASHCARD_GRADIENTS_BACK[index % FLASHCARD_GRADIENTS_BACK.length],
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="absolute top-4 left-4 md:top-6 md:left-6 text-[10px] uppercase font-black tracking-widest text-white/60 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-2">
            Verso (Resposta) <span className="opacity-50">| Toque para Virar</span>
          </div>
          <p className="text-lg md:text-xl font-medium text-white/90 mt-4 text-center leading-relaxed drop-shadow-md px-4">
            {card.back}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const PreviewCarousel = ({ cards }: { cards: Flashcard[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % cards.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);

  return (
    <div className="w-full">
      {/* Mobile view (Carousel) */}
      <div className="block md:hidden relative">
        <div className="absolute top-1/2 -translate-y-1/2 -left-3 -right-3 flex justify-between z-20 pointer-events-none">
          <button 
            onClick={prev}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto border border-white/20 shadow-xl active:scale-95 transition-transform"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={next}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto border border-white/20 shadow-xl active:scale-95 transition-transform"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <PreviewFlashcard card={cards[currentIndex]} index={currentIndex} />
        
        <div className="flex items-center justify-center gap-2 mt-4">
          {cards.map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-purple-500' : 'bg-black/20 dark:bg-white/20'}`}
            />
          ))}
        </div>
      </div>
      
      {/* Desktop view (Grid) */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        {cards.map((card, idx) => (
          <PreviewFlashcard key={idx} card={card} index={idx} />
        ))}
      </div>
    </div>
  );
};

export const FlashcardsScreen: React.FC<FlashcardsScreenProps> = ({ onNavigate, initialViewingPack }) => {
  const { isPremium } = useSubscription();
  
  const [activeTab, setActiveTab] = useState<'meus' | 'loja'>(initialViewingPack ? 'loja' : 'meus');
  const [ownedPacks, setOwnedPacks] = useState<string[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [viewingPack, setViewingPack] = useState<string | null>(initialViewingPack || null);

  useEffect(() => {
    setViewingPack(initialViewingPack || null);
    if (initialViewingPack) {
      setActiveTab('loja');
    }
  }, [initialViewingPack]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(1);
  const [exitX, setExitX] = useState(-300);
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([]);
  const [deck, setDeck] = useState<Flashcard[]>([]); // Current active deck
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isStarted, setIsStarted] = useState(false); // Changed to false initially
  const [isShuffling, setIsShuffling] = useState(false);
  
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState<string | null>(null);
  const [packToRemove, setPackToRemove] = useState<string | null>(null);

  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newSubject, setNewSubject] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editSubject, setEditSubject] = useState('');

  useEffect(() => {
    loadOwnedPacks();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      loadFlashcards();
      if (user) {
        loadOwnedPacks();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // When active tab changes, reset to selection mode (unless it's just initializing viewingPack)
    if (activeTab === 'loja' && !viewingPack) {
      setIsStarted(false);
      setSelectedPackId(null);
    }
  }, [activeTab]);

  const loadFlashcards = async () => {
    let stored = [];
    if (auth.currentUser) {
      stored = await firebaseStorageService.syncFlashcards();
      // Sync to local as backup
      stored.forEach(card => { 
         const local = storageService.getFlashcards();
         if (!local.find(l => l.id === card.id)) {
             storageService.saveFlashcard(card);
         }
      });
    } else {
      stored = storageService.getFlashcards();
    }
    
    setAllFlashcards(stored);
  };

  const loadOwnedPacks = async () => {
    let packs: string[] = [];
    const packsKey = 'apses_owned_packs_' + (auth.currentUser?.uid || window.localStorage.getItem('apses_user_uid') || 'guest');
    const saved = localStorage.getItem(packsKey);
    if (saved) {
      try {
        packs = JSON.parse(saved);
      } catch (e) {
        packs = [];
      }
    }

    if (auth.currentUser) {
      const remotePacks = await firebaseStorageService.syncOwnedPacks();
      const merged = Array.from(new Set([...packs, ...remotePacks]));
      if (merged.length > remotePacks.length) {
        await firebaseStorageService.saveOwnedPacks(merged);
      }
      packs = merged;
      localStorage.setItem(packsKey, JSON.stringify(packs));
    }

    setOwnedPacks(packs);
  };

  const saveOwnedPacks = async (packs: string[]) => {
    setOwnedPacks(packs);
    const packsKey = 'apses_owned_packs_' + (auth.currentUser?.uid || window.localStorage.getItem('apses_user_uid') || 'guest');
    localStorage.setItem(packsKey, JSON.stringify(packs));
    if (auth.currentUser) {
      await firebaseStorageService.saveOwnedPacks(packs);
    }
  };

  const handleStartReview = (packId: string | null) => {
    if (packId) {
      const pack = AVAILABLE_PACKS.find(p => p.id === packId);
      if (pack) {
        const packDeck = pack.flashcards.map((f, i) => ({
          ...f,
          id: `pack-${packId}-${i}`,
          source: 'pack',
          createdAt: Date.now()
        })) as Flashcard[];
        setDeck(packDeck);
      }
    } else {
      // Manual/AI/Community flashcards
      const myDeck = allFlashcards.filter(f => !f.id.startsWith('pack-'));
      setDeck(myDeck);
    }
    
    setSelectedPackId(packId);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsStarted(true);
  };

  const handleNext = (correct: boolean) => {
    setDirection(1);
    setExitX(correct ? 300 : -300);
    
    setTimeout(() => {
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        setIsStarted(false);
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    }, 200);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setExitX(-200);
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 200);
    }
  };

  const handleSkip = () => {
    if (currentIndex < deck.length - 1) {
      setDirection(1);
      setExitX(200);
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    }
  };

  const handleShuffle = () => {
    setIsShuffling(true);
    setDirection(1);
    setExitX(0);
    
    // Simulate shuffle animation duration
    setTimeout(() => {
      const shuffled = [...deck].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsShuffling(false);
    }, 1200);
  };

  const handleAddFlashcard = async () => {
    if (!newFront.trim() || !newBack.trim()) {
      alert("Preencha a frente e o verso do flashcard.");
      return;
    }
    const newFlashcard: Flashcard = {
      id: `man-fc-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      subject: newSubject.trim(),
      source: 'manual',
      createdAt: Date.now()
    };
    if (auth.currentUser) {
      await firebaseStorageService.saveFlashcard(newFlashcard);
    }
    storageService.saveFlashcard(newFlashcard);
    
    setNewFront('');
    setNewBack('');
    setNewSubject('');
    setShowAddModal(false);
    
    const updated = [newFlashcard, ...allFlashcards];
    setAllFlashcards(updated);
    if (!selectedPackId) {
      setDeck([newFlashcard, ...deck]);
    }
  };

  const confirmDelete = () => {
    const cardToDelete = deck[currentIndex];
    if (auth.currentUser && !cardToDelete.id.startsWith('pack-')) {
      firebaseStorageService.deleteFlashcard(cardToDelete.id);
    }
    storageService.deleteFlashcard(cardToDelete.id);
    const updated = allFlashcards.filter(f => f.id !== cardToDelete.id);
    setAllFlashcards(updated);
    
    const updatedDeck = deck.filter(f => f.id !== cardToDelete.id);
    setDeck(updatedDeck);
    
    setShowDeleteConfirm(false);
    if (updatedDeck.length === 0) {
      setIsStarted(false);
    } else if (currentIndex >= updatedDeck.length) {
      setCurrentIndex(updatedDeck.length - 1);
    }
    setIsFlipped(false);
  };

  const openEditModal = () => {
    const card = deck[currentIndex];
    if (card) {
      setEditingCardId(card.id);
      setEditFront(card.front);
      setEditBack(card.back);
      setEditSubject(card.subject || '');
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editFront.trim() || !editBack.trim()) {
      alert("Preencha a frente e o verso do flashcard.");
      return;
    }
    
    const updatedCard = {
      ...deck[currentIndex],
      front: editFront.trim(),
      back: editBack.trim(),
      subject: editSubject.trim()
    };
    
    if (auth.currentUser) {
      await firebaseStorageService.saveFlashcard(updatedCard);
    }
    storageService.updateFlashcard(updatedCard);
    
    // Update local states
    const updatedAll = allFlashcards.map(f => f.id === updatedCard.id ? updatedCard : f);
    setAllFlashcards(updatedAll);
    
    const updatedDeck = deck.map(f => f.id === updatedCard.id ? updatedCard : f);
    setDeck(updatedDeck);
    
    setShowEditModal(false);
    setEditingCardId(null);
  };

  
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStripeCheckout = async (packId: string, packTitle: string, packPrice: number, priceId?: string) => {
    try {
      setIsProcessing(true);
      const auth = (await import('../lib/firebase')).auth;
      const user = auth.currentUser;
      
      // Para pacotes gratuitos (sem priceId), desbloqueia direto
      if (!priceId) {
         window.location.href = `${window.location.origin}/?flashcard_success=true&packId=${packId}`;
         return;
      }
      
      // Link de Pagamento Fixo (Hostinger) 
      // NOTA: Se você tiver um link específico para flashcards, coloque aqui. 
      // Por enquanto estou usando o mesmo link principal que você enviou.
      let stripeLink = "https://buy.stripe.com/7sYeVe7HV4ZAcxmcX9b7y01";
      
      // Adiciona client_reference_id para webhooks (se aplicável) e o email pre-preenchido
      let queryParams = `?client_reference_id=${user?.uid || 'guest'}_pack_${packId}`;
      
      if (user && user.email) {
        queryParams += "&prefilled_email=" + encodeURIComponent(user.email);
      }
      
      window.location.href = stripeLink + queryParams;
      setIsProcessing(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao redirecionar para o provedor de pagamentos.");
      setIsProcessing(false);
    }
  };

  const handlePurchase = (packId: string) => {
    const updated = [...ownedPacks, packId];
    saveOwnedPacks(updated);
  };

  const handleRemovePack = (packId: string) => {
    setPackToRemove(packId);
  };

  const confirmRemovePack = () => {
    if (packToRemove) {
      const updated = ownedPacks.filter(id => id !== packToRemove);
      saveOwnedPacks(updated);
      setPackToRemove(null);
    }
  };


  const modalsPortal = createPortal(
    <>
      {/* Modals from old implementation */}
      <AnimatePresence>
        {showAddModal && (
            <motion.div
              key="add-flashcard-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white dark:bg-[#0a2346] p-6 sm:p-8 rounded-[2rem] w-full max-w-md border border-purple-500/20 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none"> 
                  <Layers size={180} />
                </div>
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div className="flex items-center gap-4"> 
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl flex items-center justify-center text-purple-500 shadow-inner border border-purple-500/10"> 
                      <Layers size={24} /> 
                    </div> 
                    <div> 
                      <h3 className="text-xl font-bold text-black dark:text-white tracking-tight leading-tight">Novo Flashcard</h3> 
                      <p className="text-[10px] text-black dark:text-black/40 dark:text-white/40 font-black uppercase tracking-widest mt-0.5">Criação Manual</p> 
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black dark:text-black/40 dark:text-white/40 hover:text-black dark:text-white hover:bg-black/10 dark:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-6 relative z-10">
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-black/60 dark:text-white/60 mb-2 pl-2 flex items-center gap-2"> 
                      <Bookmark size={14} className="text-purple-500" /> Disciplina / Assunto
                    </label>
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Ex: Direito Constitucional"
                      className="w-full bg-[#f9fafc] dark:bg-[#01142e] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm md:text-base text-black dark:text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="w-full relative rounded-[30px] overflow-hidden shadow-2xl p-6 flex flex-col justify-center min-h-[200px]"
                         style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)" }}>
                      <div className="absolute top-4 left-4 bg-black/10 dark:bg-white/10 text-white text-[10px] uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-lg backdrop-blur-md">
                        Frente
                      </div>
                      <textarea 
                        value={newFront}
                        onChange={(e) => setNewFront(e.target.value)}
                        className="w-full bg-transparent border-none text-white text-[17px] font-bold leading-tight drop-shadow-md text-center focus:outline-none transition-all resize-none mt-8 placeholder-white/40 h-[100px]"
                        placeholder="Digite a pergunta aqui..."
                      />
                    </div>
                    <div className="w-full relative rounded-[30px] overflow-hidden shadow-2xl p-6 flex flex-col justify-center min-h-[200px]"
                         style={{ background: "linear-gradient(135deg, #0e7490 0%, #155e75 100%)" }}>
                      <div className="absolute top-4 left-4 bg-black/10 dark:bg-white/10 text-white text-[10px] uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-lg backdrop-blur-md">
                        Verso
                      </div>
                      <textarea 
                        value={newBack}
                        onChange={(e) => setNewBack(e.target.value)}
                        className="w-full bg-transparent border-none text-white text-sm font-bold leading-tight drop-shadow-md text-center focus:outline-none transition-all resize-none mt-8 placeholder-white/40 h-[100px]"
                        placeholder="Adicione a resposta..."
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleAddFlashcard}
                  className="w-full mt-8 bg-purple-500 hover:brightness-110 text-white font-black py-4 md:py-5 text-sm md:text-base rounded-2xl transition-all flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  <Save size={20} /> Salvar no Baralho
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showEditModal && (
            <motion.div
              key="edit-flashcard-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white dark:bg-[#0a2346] p-6 sm:p-8 rounded-[2rem] w-full max-w-md border border-purple-500/20 shadow-2xl relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div className="flex items-center gap-4"> 
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl flex items-center justify-center text-purple-500 shadow-inner border border-purple-500/10"> 
                      <Edit2 size={24} /> 
                    </div> 
                    <div> 
                      <h3 className="text-xl font-bold text-black dark:text-white tracking-tight leading-tight">Editar Flashcard</h3> 
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black dark:text-black/40 dark:text-white/40 hover:text-black dark:text-white hover:bg-black/10 dark:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-6 relative z-10">
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-black/60 dark:text-white/60 mb-2 pl-2 flex items-center gap-2"> 
                      <Bookmark size={14} className="text-purple-500" /> Disciplina / Assunto
                    </label>
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      placeholder="Ex: Direito Constitucional"
                      className="w-full bg-[#f9fafc] dark:bg-[#01142e] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm md:text-base text-black dark:text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="w-full relative rounded-[30px] overflow-hidden shadow-2xl p-6 flex flex-col justify-center min-h-[200px]"
                         style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)" }}>
                      <div className="absolute top-4 left-4 bg-black/10 dark:bg-white/10 text-white text-[10px] uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-lg backdrop-blur-md">
                        Frente
                      </div>
                      <textarea 
                        value={editFront}
                        onChange={(e) => setEditFront(e.target.value)}
                        className="w-full bg-transparent border-none text-white text-[17px] font-bold leading-tight drop-shadow-md text-center focus:outline-none transition-all resize-none mt-8 placeholder-white/40 h-[100px]"
                        placeholder="Digite a pergunta aqui..."
                      />
                    </div>
                    <div className="w-full relative rounded-[30px] overflow-hidden shadow-2xl p-6 flex flex-col justify-center min-h-[200px]"
                         style={{ background: "linear-gradient(135deg, #0e7490 0%, #155e75 100%)" }}>
                      <div className="absolute top-4 left-4 bg-black/10 dark:bg-white/10 text-white text-[10px] uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-lg backdrop-blur-md">
                        Verso
                      </div>
                      <textarea 
                        value={editBack}
                        onChange={(e) => setEditBack(e.target.value)}
                        className="w-full bg-transparent border-none text-white text-sm font-bold leading-tight drop-shadow-md text-center focus:outline-none transition-all resize-none mt-8 placeholder-white/40 h-[100px]"
                        placeholder="Adicione a resposta..."
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSaveEdit}
                  className="w-full mt-8 bg-purple-500 hover:brightness-110 text-white font-black py-4 md:py-5 text-sm md:text-base rounded-2xl transition-all flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  <Save size={20} /> Salvar Alterações
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {packToRemove && (
            <motion.div
              key="remove-pack-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white dark:bg-[#0a2346] p-6 sm:p-8 rounded-[2rem] w-full max-w-sm border border-rose-500/20 shadow-2xl relative text-center"
              >
                <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">Remover Pacote?</h3>
                <p className="text-black/60 dark:text-white/60 mb-8">Tem certeza que deseja remover este pacote da sua biblioteca?</p>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setPackToRemove(null)}
                    className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-bold rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmRemovePack}
                    className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-500/25"
                  >
                    Remover
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showDeleteConfirm && (
            <motion.div
              key="delete-confirm-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white dark:bg-[#0a2346] p-6 sm:p-8 rounded-[2rem] w-full max-w-sm border border-rose-500/20 shadow-2xl relative text-center"
              >
                <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">Excluir Flashcard?</h3>
                <p className="text-black/60 dark:text-white/60 mb-8">Esta ação não pode ser desfeita.</p>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-bold rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-500/25"
                  >
                    Excluir
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

    </>,
    document.body
  );

  // If we are reviewing
  if (isStarted) {
    if (deck.length === 0) {
      return (
        <div className="flex flex-col flex-1 h-full items-center justify-center">
          <p className="text-xl dark:text-white">Nenhum cartão neste baralho.</p>
          <button onClick={() => setIsStarted(false)} className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-xl">Voltar</button>
        </div>
      );
    }

    const currentCard = deck[currentIndex];
    const isPackCard = currentCard.id.startsWith('pack-');
    const colorIndex = currentIndex % FLASHCARD_GRADIENTS.length;

    return (
      <div className="flex flex-col flex-1 h-full bg-transparent w-full relative selection:bg-purple-500/30 overflow-y-auto overflow-x-hidden no-scrollbar pb-32">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent opacity-50" />
        </div>
        
        <div className="flex-1 w-full flex flex-col items-center relative z-20 p-4">
          <div className="w-full max-w-4xl flex items-center justify-between mb-8 mt-2 px-4 relative z-50 pointer-events-auto">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsStarted(false)} 
                className="w-12 h-12 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-xl flex items-center justify-center text-black dark:text-white hover:bg-black/20 dark:bg-white/20 transition-all shadow-lg backdrop-blur-md mr-2 pointer-events-auto"
              >
                <ChevronLeft size={28} strokeWidth={2.5} />
              </button>
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-white">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-black dark:text-white leading-tight">Flashcards</h2>
                <p className="text-[10px] text-purple-500/70 font-extrabold uppercase tracking-widest">{selectedPackId ? "Pacote Especial" : "Meus Cartões"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm font-bold text-purple-500 bg-white dark:bg-[#0a2346] px-4 py-2 rounded-xl border border-purple-500/10 shadow-lg relative z-50 pointer-events-auto">
                {currentIndex + 1} / {deck.length}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isShuffling ? (
              <motion.div
                key="shuffling-animation"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-full max-w-xl aspect-square sm:aspect-square relative flex items-center justify-center my-auto mx-auto"
              >
                <div className="relative w-32 h-32 sm:w-48 sm:h-48">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        x: [0, (i === 1 ? 60 : -60), 0, (i === 1 ? -40 : 40), 0],
                        y: [0, (i === 1 ? -20 : 20), 0, (i === 1 ? 10 : -10), 0],
                        rotate: [i * -5, (i === 1 ? 20 : -20), 0, (i === 1 ? -15 : 15), i * -5],
                        zIndex: [i, 3 - i, i, 3 - i, i]
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: 2,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 rounded-[20px] sm:rounded-[30px] shadow-2xl border border-white/20"
                      style={{ background: FLASHCARD_GRADIENTS[i % FLASHCARD_GRADIENTS.length] }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentCard.id}
                initial={{ opacity: 0, x: exitX * -1, rotate: direction * -10 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: exitX, rotate: direction * 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full max-w-xl aspect-square sm:aspect-square relative perspective-[1000px] cursor-pointer my-auto mx-auto"
                onClick={() => setIsFlipped(!isFlipped)}
              >
              <motion.div
                className="w-full h-full relative transition-all duration-500 ease-out"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Left Arrow */}
                {currentIndex > 0 && !isFlipped && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute -left-5 sm:-left-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 border border-white/40 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all z-30"
                    style={{ transform: "translateZ(50px)" }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}

                {/* Right Arrow */}
                {currentIndex < deck.length - 1 && !isFlipped && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSkip(); }}
                    className="absolute -right-5 sm:-right-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 border border-white/40 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all z-30"
                    style={{ transform: "translateZ(50px)" }}
                  >
                    <ChevronRight size={24} />
                  </button>
                )}

                {/* Frente */}
                <div 
                  className={cn(
                    "absolute inset-0 w-full h-full rounded-[40px] sm:rounded-[50px] p-6 sm:p-12 flex flex-col justify-center items-center text-center shadow-2xl border border-white/10"
                  )}
                  style={{ 
                    background: FLASHCARD_GRADIENTS[colorIndex],
                    boxShadow: `0 20px 40px -10px ${FLASHCARD_SHADOWS[colorIndex]}, inset 0 2px 10px rgba(255,255,255,0.2)`,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)'
                  }}
                >
                  <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex justify-between items-start pointer-events-none">
                    <div className="flex gap-2 items-center pointer-events-auto">
                      <span className="bg-black/20 text-white text-[10px] sm:text-xs uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-lg backdrop-blur-md">
                        Frente
                      </span>
                      {currentCard.subject && (
                        <span className="bg-white/10 text-white/90 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 max-w-[50%] truncate">
                          {currentCard.subject}
                        </span>
                      )}
                    </div>
                    
                    {!isPackCard && (
                      <div className="flex items-center gap-2 pointer-events-auto">
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditModal(); }}
                          className="w-10 h-10 bg-black/20 hover:bg-black/30 text-white rounded-xl flex items-center justify-center transition-all backdrop-blur-md border border-white/10 cursor-pointer"
                          title="Editar cartão"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(true); }}
                          className="w-10 h-10 bg-black/20 hover:bg-red-500/80 text-white rounded-xl flex items-center justify-center transition-all backdrop-blur-md border border-white/10 cursor-pointer"
                          title="Excluir cartão"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight drop-shadow-md">
                    {currentCard.front}
                  </h3>
                  <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-white/50 text-xs font-semibold flex items-center justify-center gap-2">
                    <RotateCcw size={14} /> Toque para virar
                  </div>
                </div>

                {/* Verso */}
                <div 
                  className={cn(
                    "absolute inset-0 w-full h-full rounded-[40px] sm:rounded-[50px] p-6 sm:p-12 flex flex-col justify-center items-center text-center shadow-2xl border border-white/10"
                  )}
                  style={{ 
                    background: FLASHCARD_GRADIENTS_BACK[colorIndex],
                    boxShadow: `0 20px 40px -10px ${FLASHCARD_SHADOWS[colorIndex]}, inset 0 2px 10px rgba(255,255,255,0.1)`,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: "rotateY(180deg)"
                  }}
                >
                  <div className="absolute top-4 sm:top-6 left-4 sm:left-6 bg-black/20 text-white text-[10px] sm:text-xs uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-lg backdrop-blur-md">
                    Verso
                  </div>
                  <div className="w-full h-full overflow-y-auto flex items-center justify-center custom-scrollbar">
                    <p className="text-xl sm:text-2xl md:text-3xl text-white font-medium leading-relaxed drop-shadow-md pb-4">
                      {currentCard.back || "Esta carta foi salva antes da correção. Por favor, remova o pacote e adicione novamente para ver a resposta."}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 w-full max-w-sm flex justify-center min-h-[80px]">
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div
                  key="shuffle-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                  className="w-full flex justify-center items-start"
                >
                  <button
                    onClick={handleShuffle}
                    disabled={isShuffling}
                    className="px-8 py-3.5 bg-purple-500/10 hover:bg-purple-500/20 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 text-[#428a99] dark:text-[#8ae0f2] border border-purple-500/20 rounded-[20px] flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-sm font-bold tracking-wide active:scale-95 backdrop-blur-md"
                  >
                    <Shuffle size={20} />
                    Embaralhar
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="review-btns"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.15 } }}
                  className="flex items-start gap-4 w-full"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(false); }}
                    className="flex-1 bg-white dark:bg-[#0a1828] border-2 border-rose-100 hover:border-rose-500 dark:border-rose-900/50 dark:hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 font-bold py-4 sm:py-5 rounded-2xl sm:rounded-[20px] transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-sm active:scale-95 group"
                  >
                    <X size={24} className="group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" /> 
                    <span className="text-base sm:text-lg">Não Lembrei</span>
                  </button>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(true); }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 sm:py-5 rounded-2xl sm:rounded-[20px] transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-emerald-500/30 active:scale-95 group"
                  >
                    <Check size={24} className="group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" /> 
                    <span className="text-base sm:text-lg">Lembrei</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {modalsPortal}
      </div>
    );
  }

  // Dashboard View (not started)
  const myCardsCount = allFlashcards.filter(f => !f.id.startsWith('pack-')).length;
  // isPremium from hook

  return (
    <div className="flex flex-col flex-1 h-[100dvh] bg-[#f9fafc] dark:bg-[#01142e] w-full relative overflow-y-auto overflow-x-hidden pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full flex flex-col gap-8">
        
        {/* Header Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onNavigate && (
              <button 
                onClick={() => {
                  if (activeTab === 'loja' && viewingPack) {
                    onNavigate('home');
                  } else {
                    onNavigate('back');
                  }
                }}
                className="w-10 h-10 bg-white dark:bg-[#0a2346] border border-purple-500/20 rounded-full flex items-center justify-center text-black dark:text-white hover:bg-purple-500/10 transition-colors shadow-sm shrink-0"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-black text-black dark:text-white flex items-center gap-3">
                <Layers className="text-purple-500" /> Flashcards
              </h1>
              <p className="text-black/60 dark:text-white/60 mt-1">Sua central de revisão espaçada.</p>
            </div>
          </div>
          
          {!(activeTab === 'loja' && viewingPack) && (
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 md:p-1.5 rounded-2xl md:rounded-[20px]">
            <button 
              onClick={() => {
                setActiveTab('meus');
                if (onNavigate && viewingPack) onNavigate('flashcards', { reset: true });
              }}
              className={`flex-1 sm:flex-none px-6 py-2.5 md:px-10 md:py-3.5 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all ${activeTab === 'meus' ? 'bg-white dark:bg-[#0a1828] text-purple-500 shadow-sm' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'}`}
            >
              Meus Baralhos
            </button>
            <button 
              onClick={() => {
                setActiveTab('loja');
                if (onNavigate && viewingPack) {
                  onNavigate('flashcards', { reset: true });
                } else {
                  setViewingPack(null);
                }
              }}
              className={`flex-1 sm:flex-none px-6 py-2.5 md:px-10 md:py-3.5 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all flex items-center gap-2 justify-center ${activeTab === 'loja' ? 'bg-white dark:bg-[#0a1828] text-purple-500 shadow-sm' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'}`}
            >
              <ShoppingBag size={18} className="hidden md:block" />
              <ShoppingBag size={16} className="md:hidden" />
              Pacotes Prontos
            </button>
          </div>
          )}
        </div>

        {activeTab === 'meus' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Meu Baralho Principal */}
              <div className="bg-white dark:bg-[#0a2346] rounded-3xl p-6 md:p-8 shadow-sm border border-black/5 dark:border-white/10 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
                
                <div>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-4">
                    <Bookmark size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white">Meus Cartões</h3>
                  <p className="text-black/60 dark:text-white/60 text-sm mt-2">
                    Cartões criados por você, via inteligência artificial ou partir de questões/comentários.
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                  <span className="font-bold text-lg dark:text-white">{myCardsCount} <span className="text-sm font-normal text-black/60 dark:text-white/60">cartões</span></span>
                  
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddModal(true)} className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-black dark:text-white hover:bg-purple-500 hover:text-white transition-colors" title="Criar manual">
                      <Plus size={20} />
                    </button>
                    <button 
                      disabled={myCardsCount === 0}
                      onClick={() => handleStartReview(null)}
                      className="px-6 py-2 bg-purple-500 hover:bg-[#4396a8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md"
                    >
                      Estudar
                    </button>
                  </div>
                </div>
              </div>

              {/* Pacotes Adicionados */}
              {ownedPacks.map(packId => {
                const pack = AVAILABLE_PACKS.find(p => p.id === packId);
                if (!pack) return null;
                return (
                  <div key={packId} className="bg-white dark:bg-[#0a2346] rounded-3xl p-6 md:p-8 shadow-sm border border-purple-500/20 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
                    
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-4">
                          <GraduationCap size={24} />
                        </div>
                        <button onClick={() => handleRemovePack(packId)} className="text-black/40 dark:text-white/40 hover:text-rose-500 transition-colors" title="Remover pacote">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <h3 className="text-xl font-bold text-black dark:text-white">{pack.title}</h3>
                      <p className="text-black/60 dark:text-white/60 text-sm mt-2 line-clamp-2">
                        {pack.description}
                      </p>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                      <span className="font-bold text-lg dark:text-white">{pack.cardsCount} <span className="text-sm font-normal text-black/60 dark:text-white/60">cartões</span></span>
                      <button 
                        onClick={() => handleStartReview(pack.id)}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 text-white rounded-xl font-bold transition-all shadow-md"
                      >
                        Estudar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'loja' && viewingPack ? (
          (() => {
            const pack = AVAILABLE_PACKS.find(p => p.id === viewingPack);
            if (!pack) return null;
            const isOwned = ownedPacks.includes(pack.id);
            return (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
                
                <div className="flex flex-col gap-6">
                  <button 
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('flashcards', { reset: true });
                      } else {
                        setViewingPack(null);
                      }
                    }}
                    className="w-fit flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <ChevronLeft size={18} /> Voltar para Loja
                  </button>
                  
                  <div className={`w-full rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 relative overflow-hidden flex flex-col items-start justify-end min-h-[300px] md:min-h-[400px] shadow-2xl bg-gradient-to-br ${pack.coverColor}`}>
                    {pack.imageUrl ? (
                      <img src={pack.imageUrl} alt={pack.title} className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-normal brightness-105" />
                    ) : (
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] mix-blend-overlay"></div>
                    )}
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />
        
                    <div className="relative z-10 w-full max-w-4xl">
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 shadow-lg">
                         <Layers size={14} /> {pack.cardsCount} Flashcards
                      </div>
                      <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight drop-shadow-md">
                        {pack.title}
                      </h1>
                    </div>
                  </div>
                </div>
        
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-16 items-start mt-8">
                  
                  <div className="xl:col-span-9 flex flex-col gap-16">
                    
                    <section className="prose prose-lg dark:prose-invert max-w-none">
                      <h3 className="text-2xl md:text-3xl font-black text-black dark:text-white mb-6 tracking-tight">Sobre este Pacote</h3>
                      <p className="text-black/70 dark:text-white/70 leading-relaxed text-lg md:text-xl">
                        {pack.description}
                      </p>
                    </section>
                    
                    <section>
                      <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl md:text-3xl font-black text-black dark:text-white tracking-tight">Pré-visualização</h3>
                        <span className="text-sm font-bold text-black/40 dark:text-white/40 uppercase tracking-widest bg-black/5 dark:bg-white/5 px-4 py-2 rounded-lg">2 de {pack.cardsCount}</span>
                      </div>
                      
                      <PreviewCarousel cards={pack.flashcards.slice(0, 2) as unknown as Flashcard[]} />
                    </section>
                  </div>
                  
                  <div className="xl:col-span-3 w-full sticky top-32">
                     <div className="bg-white dark:bg-[#0a2346] rounded-[2rem] p-8 shadow-2xl border border-black/5 dark:border-white/10 flex flex-col items-center text-center">
                        {!isOwned && (
                           <div className="text-5xl font-black text-black dark:text-white mb-2 tracking-tighter">
                             R$ {pack.price.toFixed(2).replace('.', ',')}
                           </div>
                        )}
                        
                        <p className="text-sm font-medium text-black/50 dark:text-white/50 mb-8 mt-2">
                          {isOwned 
                            ? "Você já possui este pacote e pode estudá-lo na aba Meus Flashcards." 
                            : "Acesso vitalício ao material completo, com atualizações incluídas."}
                        </p>
        
                        {isOwned ? (
                          <button 
                            onClick={() => handleRemovePack(pack.id)}
                            className="w-full py-4 bg-black/5 dark:bg-white/5 hover:bg-rose-500 hover:text-white text-rose-500 font-bold rounded-2xl transition-all"
                          >
                            Remover da Biblioteca
                          </button>
                        ) : (
                          <button 
                            onClick={() => isPremium ? handlePurchase(pack.id) : handleStripeCheckout(pack.id, pack.title, pack.price, (pack as any).stripePriceId)}
                            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-lg transition-transform hover:scale-105 active:scale-95"
                          >
                             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                             <div className="relative py-4 px-6 flex items-center justify-center gap-3 font-black text-lg">
                               {isPremium ? (
                                 <> <Crown size={24} /> Resgatar (Premium) </>
                               ) : (
                                 isProcessing ? "Processando..." : <> <ShoppingBag size={24} /> Comprar Agora </>
                               )}
                             </div>
                          </button>
                        )}
                        
                        {!isOwned && !isPremium && (
                          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-500/80 bg-amber-500/10 px-4 py-2 rounded-lg">
                            <Crown size={14} /> Grátis para assinantes Premium
                          </div>
                        )}
                     </div>
                  </div>
                  
                </div>
              </div>
            );
          })()
        ) : activeTab === 'loja' && (
          <div className="flex flex-col gap-8">
            
            <div className="bg-gradient-to-r from-[#0a1828] to-[#01142e] rounded-3xl p-8 relative overflow-hidden shadow-xl border border-white/10 flex flex-col sm:flex-row items-center gap-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none" />
              <div className="w-20 h-20 shrink-0 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                <Crown className="w-10 h-10 text-amber-400" />
              </div>
              <div className="flex-1 text-center sm:text-left z-10">
                <h3 className="text-2xl font-black text-white">Biblioteca Premium</h3>
                <p className="text-white/70 mt-2">
                  Assinantes Premium possuem acesso <strong>gratuito e ilimitado</strong> a todos os pacotes de flashcards prontos elaborados por especialistas.
                </p>
              </div>
              {!isPremium && (
                <button 
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('home');
                      setTimeout(() => {
                        document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
                      }, 250);
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black rounded-xl shadow-lg shrink-0 z-10"
                >
                  Assinar Premium
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {AVAILABLE_PACKS.map((pack) => {
                const isOwned = ownedPacks.includes(pack.id);
                
                return (
                  <div 
                    key={pack.id} 
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('flashcards', { viewingPack: pack.id });
                      } else {
                        setViewingPack(pack.id);
                      }
                    }}
                    className="bg-white dark:bg-[#0a2346] cursor-pointer rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-black/5 dark:border-white/10 hover:border-purple-500/50 flex flex-col group relative"
                  >
                    <div className={`h-36 relative overflow-hidden bg-gradient-to-br ${pack.coverColor}`}>
                      {pack.imageUrl ? (
                        <img src={pack.imageUrl} alt={pack.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 mix-blend-normal brightness-105" />
                      ) : (
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-700"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div className="bg-black/40 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
                          <Layers size={14} className="text-white/70" />
                          {pack.cardsCount} cards
                        </div>
                        {isOwned && (
                          <div className="bg-emerald-500 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                            <Check size={14} strokeWidth={3} /> Desbloqueado
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1 relative bg-white dark:bg-[#0a2346]">
                      <div className="absolute top-0 right-6 -translate-y-1/2 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/30 opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1/2 z-10">
                        <ChevronRight size={20} strokeWidth={3} />
                      </div>
                      
                      <h4 className="text-xl font-bold text-black dark:text-white mb-2 group-hover:text-purple-500 transition-colors pr-8">{pack.title}</h4>
                      <p className="text-sm text-black/60 dark:text-white/60 mb-4 flex-1 line-clamp-3 leading-relaxed">
                        {pack.description}
                      </p>
                      
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
      
      {modalsPortal}
    </div>
  );
};
