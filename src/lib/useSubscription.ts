import { getBrazilTodayStr } from "./dateUtils";
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { UserProfile } from '../types';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export function getCachedUserProfile(uid: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(`apses_user_profile_${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as UserProfile;
      }
    }
  } catch (e) {}
  return null;
}

export function setCachedUserProfile(uid: string, profile: Partial<UserProfile>) {
  try {
    const current = getCachedUserProfile(uid) || ({} as UserProfile);
    const merged = { ...current, ...profile, uid };
    localStorage.setItem(`apses_user_profile_${uid}`, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('apses:profile-updated', { detail: merged }));
  } catch (e) {}
}

export function useSubscription() {
  const { user } = useAuth();

  // Initialize with cached profile if available for instantaneous identification
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    return user ? getCachedUserProfile(user.uid) : null;
  });

  const [anonTick, setAnonTick] = useState(0);
  useEffect(() => {
    const handleAnon = () => setAnonTick(t => t + 1);
    window.addEventListener('apses:anon-updated', handleAnon);
    return () => window.removeEventListener('apses:anon-updated', handleAnon);
  }, []);

  const [loading, setLoading] = useState<boolean>(() => {
    if (!user) return false;
    const cached = getCachedUserProfile(user.uid);
    // If cached profile exists, we already have initial subscription state
    return !cached;
  });

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Check if we have cached profile on user change
    const cached = getCachedUserProfile(user.uid);
    if (cached) {
      setProfile(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    // Listen to profile updates from background sync (/api/profile/initialize)
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>;
      if (customEvent.detail && (!customEvent.detail.uid || customEvent.detail.uid === user.uid)) {
        setProfile(prev => ({ ...(prev || {}), ...customEvent.detail } as UserProfile));
        setLoading(false);
      }
    };
    window.addEventListener('apses:profile-updated', handleProfileUpdate);

    let isMounted = true;

    // Fast-path: Immediate direct fetch via getDoc so we don't wait for onSnapshot WebSocket handshake
    getDoc(doc(db, "users", user.uid)).then((docSnap) => {
      if (!isMounted) return;
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
        setLoading(false);
        try {
          localStorage.setItem(`apses_user_profile_${user.uid}`, JSON.stringify(data));
        } catch (e) {}
      }
    }).catch(() => {
      // Handled by onSnapshot or fallback
    });

    // Timeout to ensure loading is never blocked indefinitely (1.5s max)
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 1500);

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (docSnap) => {
        if (!isMounted) return;
        clearTimeout(timeoutId);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          try {
            localStorage.setItem(`apses_user_profile_${user.uid}`, JSON.stringify(data));
          } catch (e) {}
        }
        setLoading(false);
      },
      (error) => {
        console.warn("[SUBSCRIPTION] Error loading user document from firestore:", error);
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener('apses:profile-updated', handleProfileUpdate);
      unsubscribe();
    };
  }, [user]);

  const isPremium = profile?.planStatus === 'premium' || (profile as any)?.accountType === 'premium' || (profile as any)?.subscription === 'active';
  
  const FREE_QUESTIONS_LIMIT = 15;
  const FREE_FLASHCARDS_LIMIT = 15;
  const ANONYMOUS_LIMIT = 3;

  let currentQuestions = profile?.dailyQuestionsCount || 0;
  let currentFlashcards = profile?.aiFlashcardsUsedCount || 0;

  // Handle anonymous users
  let anonymousQuestions = 0;
  if (!user) {
    try {
      anonymousQuestions = parseInt(localStorage.getItem('apses_anon_questions') || '0', 10);
    } catch (e) {}
  }

  const canAnswerQuestion = user ? (isPremium ? true : currentQuestions < FREE_QUESTIONS_LIMIT) : (anonymousQuestions < ANONYMOUS_LIMIT);
  const canCreateFlashcard = user ? (isPremium ? true : currentFlashcards < FREE_FLASHCARDS_LIMIT) : false; // no flashcards for anon
  const dailyQuestionsLeft = user ? (isPremium ? Infinity : Math.max(0, FREE_QUESTIONS_LIMIT - currentQuestions)) : Math.max(0, ANONYMOUS_LIMIT - anonymousQuestions);
  const flashcardsLeft = user ? (isPremium ? Infinity : Math.max(0, FREE_FLASHCARDS_LIMIT - currentFlashcards)) : 0;

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
