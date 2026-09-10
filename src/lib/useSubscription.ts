import { getBrazilTodayStr } from "./dateUtils";
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { firebaseStorageService } from '../services/firebaseStorageService';
import { UserProfile } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export function useSubscription() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const isPremium = profile?.planStatus === 'premium' || (profile as any)?.accountType === 'premium' || (profile as any)?.subscription === 'active';
  
  // Auto-renew daily limit locally for display/guards without triggering infinite write loops
  const todayStr = getBrazilTodayStr();
  const isDateMismatched = profile && profile.lastQuestionResetDate !== todayStr;
  
  const FREE_QUESTIONS_LIMIT = 15;
  const FREE_FLASHCARDS_LIMIT = 3;

  let currentDailyQuestions = profile?.dailyQuestionsCount || 0;
  if (isDateMismatched) {
    currentDailyQuestions = 0;
  }
  let currentFlashcards = profile?.aiFlashcardsUsedCount || 0;

  const canAnswerQuestion = isPremium ? true : currentDailyQuestions < FREE_QUESTIONS_LIMIT;
  const canCreateFlashcard = isPremium ? true : currentFlashcards < FREE_FLASHCARDS_LIMIT;
  const dailyQuestionsLeft = isPremium ? Infinity : Math.max(0, FREE_QUESTIONS_LIMIT - currentDailyQuestions);
  const flashcardsLeft = isPremium ? Infinity : Math.max(0, FREE_FLASHCARDS_LIMIT - currentFlashcards);


  return {
    profile,
    isPremium,
    loading,
    canAnswerQuestion,
    canCreateFlashcard,
    dailyQuestionsLeft,
    flashcardsLeft,
  };
}
