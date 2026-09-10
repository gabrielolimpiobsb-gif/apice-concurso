import { getBrazilTodayStr } from "../lib/dateUtils";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  orderBy,
  updateDoc,
  increment
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Performance, StudySession } from "../types";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

export interface QuestionComment {
  id: string;
  userId: string;
  questionId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  text: string;
  createdAt: any;
  likes?: string[];
}

let activeSyncPromise: Promise<any> | null = null;
const lastSyncTimeByUid: Record<string, number> = {};
const SYNC_COOLDOWN = 15000; // 15 seconds cooldown between sync requests

const SERIES_ORDER = ['E', 'D', 'C', 'B', 'A'];

export function getWeekId(offset = 0) {
  const d = new Date();
  
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  // We want Monday to be the start of the week.
  // So if today is Sunday (0), it belongs to the previous Monday's week (subtract 6 days).
  // Otherwise, subtract (day - 1) days to get back to Monday.
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff + (offset * 7));
  
  return `${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
}

export const firebaseStorageService = {
  getUserData: async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      return null;
    }
  },
  saveUserData: async (uid: string, data: any) => {
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, data, { merge: true });
    } catch (error) {
    }
  },

  syncUserSeries: async (uid: string, displayName: string, photoURL: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      const currentWeekId = getWeekId();
      let currentSeries = 'E';
      let lastWeekProcessed = currentWeekId;

      if (userSnap.exists()) {
        const data = userSnap.data();
        currentSeries = data.currentSeries || 'E';
        lastWeekProcessed = data.lastWeekProcessed || currentWeekId;
      } else {
        await setDoc(userRef, { currentSeries: 'E', lastWeekProcessed: currentWeekId }, { merge: true });
      }

      // Check for promotion/demotion if we missed a week
      if (lastWeekProcessed !== currentWeekId) {
        // Fetch last week's leaderboard for the user's series
        const q = query(
          collection(db, `leaderboards/${lastWeekProcessed}_${currentSeries}/users`),
          orderBy("score", "desc")
        );
        const snapshot = await getDocs(q);
        const rankings: any[] = [];
        snapshot.forEach(d => rankings.push({ id: d.id, ...d.data() }));

        const myIndex = rankings.findIndex(r => r.id === uid);
        
        let newSeries = currentSeries;
        
        if (myIndex !== -1) {
          const totalUsers = rankings.length;
          const currentSeriesIndex = SERIES_ORDER.indexOf(currentSeries);
          
          if (myIndex < 10) {
            // Promote (Top 10)
            if (currentSeriesIndex < SERIES_ORDER.length - 1) {
              newSeries = SERIES_ORDER[currentSeriesIndex + 1];
            }
          } else if (myIndex >= totalUsers - 10 && myIndex >= 10) {
            // Demote (Last 10), but only if not in Top 10
            if (currentSeriesIndex > 0) {
              newSeries = SERIES_ORDER[currentSeriesIndex - 1];
            }
          }
        }
        
        // Save history (simplified)
        const historyRef = doc(db, `users/${uid}/history`, lastWeekProcessed);
        await setDoc(historyRef, {
           series: currentSeries,
           position: myIndex !== -1 ? myIndex + 1 : null,
           promotedTo: newSeries !== currentSeries ? newSeries : null,
        }, { merge: true });

        currentSeries = newSeries;
        await setDoc(userRef, { currentSeries, lastWeekProcessed: currentWeekId }, { merge: true });
      }
      
      // Cache the current series in localStorage to avoid fetching it on every question answer
      localStorage.setItem(`apses_current_series_${uid}`, currentSeries);
      
      // Ensure user exists in current week's leaderboard
      const rankRef = doc(db, `leaderboards/${currentWeekId}_${currentSeries}/users/${uid}`);
      const rankSnap = await getDoc(rankRef);
      if (!rankSnap.exists()) {
        await setDoc(rankRef, {
          uid,
          displayName: displayName || 'Usuário',
          photoURL: photoURL || '',
          score: 0,
          correctCount: 0,
          incorrectCount: 0,
          lastUpdated: serverTimestamp()
        }, { merge: true });
      }
      
      return currentSeries;
    } catch (error) {
      console.warn("Error syncing series", error);
      return localStorage.getItem(`apses_current_series_${uid}`) || 'E';
    }
  },

  listenSeriesRanking: (series: string, callback: (rankings: any[]) => void) => {
    try {
      const weekId = getWeekId();
      const q = query(
        collection(db, `leaderboards/${weekId}_${series}/users`),
        orderBy("score", "desc")
      );

      return onSnapshot(q, (snapshot) => {
        const rankings: any[] = [];
        snapshot.forEach(doc => {
          rankings.push({ id: doc.id, ...doc.data() });
        });
        callback(rankings);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `leaderboards/${weekId}_${series}/users`);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `leaderboards`);
      return () => {};
    }
  },

  listenGlobalRanking: (callback: (rankings: any[]) => void) => {
    try {
      const q = query(
        collection(db, `leaderboards/season13/users`),
        orderBy("seasonCorrectCount", "desc")
      );

      return onSnapshot(q, (snapshot) => {
        const rankings: any[] = [];
        snapshot.forEach(doc => {
          rankings.push({ id: doc.id, ...doc.data() });
        });
        callback(rankings);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `leaderboards/season13/users`);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `leaderboards/season13/users`);
      return () => {};
    }
  },

  listenLessonComments: (lessonId: string, callback: (comments: QuestionComment[]) => void) => {
    try {
      const q = query(
        collection(db, `lessons/${lessonId}/comments`),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const comments: QuestionComment[] = [];
          querySnapshot.forEach((doc) => {
            comments.push({ ...doc.data(), id: doc.id } as QuestionComment);
          });
          callback(comments);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, `lessons/${lessonId}/comments`);
        }
      );

      return unsubscribe;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `lessons/${lessonId}/comments`);
      return () => {};
    }
  },

  addLessonComment: async (lessonId: string, text: string) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(collection(db, `lessons/${lessonId}/comments`));
      await setDoc(docRef, {
        userId: auth.currentUser.uid,
        questionId: lessonId, // Re-using field for typing compatibility, though it's lessonId
        userDisplayName: auth.currentUser.displayName || "Usuário",
        userPhotoURL: auth.currentUser.photoURL || "",
        text: text,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `lessons/${lessonId}/comments`);
    }
  },

  deleteLessonComment: async (lessonId: string, commentId: string) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, `lessons/${lessonId}/comments`, commentId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `lessons/${lessonId}/comments`);
    }
  },

  listenQuestionComments: (questionId: string, callback: (comments: QuestionComment[]) => void) => {
    try {
      const q = query(
        collection(db, `questions/${questionId}/comments`),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const comments: QuestionComment[] = [];
          querySnapshot.forEach((doc) => {
            comments.push({ ...doc.data(), id: doc.id } as QuestionComment);
          });
          callback(comments);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, `questions/${questionId}/comments`);
        }
      );

      return unsubscribe;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `questions/${questionId}/comments`);
      return () => {};
    }
  },

  addQuestionComment: async (questionId: string, text: string) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(collection(db, `questions/${questionId}/comments`));
      await setDoc(docRef, {
        userId: auth.currentUser.uid,
        questionId: questionId,
        userDisplayName: auth.currentUser.displayName || "Usuário",
        userPhotoURL: auth.currentUser.photoURL || "",
        text: text,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `questions/${questionId}/comments`);
    }
  },

  deleteQuestionComment: async (questionId: string, commentId: string) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, `questions/${questionId}/comments`, commentId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `questions/${questionId}/comments`);
    }
  },

  toggleQuestionCommentLike: async (questionId: string, commentId: string) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, `questions/${questionId}/comments`, commentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        let likes = data.likes || [];
        const uid = auth.currentUser.uid;
        if (likes.includes(uid)) {
          likes = likes.filter((id: string) => id !== uid);
        } else {
          likes.push(uid);
        }
        await updateDoc(docRef, { likes });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `questions/${questionId}/comments/${commentId}`);
    }
  },

  updateUserProfile: async (data: any) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  },

  getPerformancesOnce: async (): Promise<Performance[]> => {
    if (!auth.currentUser) return [];
    try {
      const q = query(collection(db, `users/${auth.currentUser.uid}/performances`));
      const querySnapshot = await getDocs(q);
      const perfs: Performance[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        perfs.push({
          ...data,
          id: doc.id,
          answeredAt: data.answeredAt ? data.answeredAt : new Date().toISOString(),
        } as Performance);
      });
      return perfs;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}/performances`);
      return [];
    }
  },

  listenPerformances: (callback: (performances: Performance[]) => void) => {
    if (!auth.currentUser) return () => {};

    try {
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/performances`),
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const perfs: Performance[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            perfs.push({
              ...data,
              id: doc.id,
              answeredAt: data.answeredAt
                ? data.answeredAt
                : new Date().toISOString(),
            } as Performance);
          });
          callback(perfs);
        },
        (error) => {
          if (!auth.currentUser) return; // User logged out
          handleFirestoreError(
            error,
            OperationType.GET,
            `users/${auth.currentUser.uid}/performances`,
          );
        },
      );

      return unsubscribe;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.GET,
        `users/${auth.currentUser.uid}/performances`,
      );
      return () => {};
    }
  },

  syncPerformances: async (): Promise<Performance[]> => {
    if (!auth.currentUser) return [];

    try {
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/performances`),
      );
      const querySnapshot = await getDocs(q);
      const perfs: Performance[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        perfs.push({
          ...data,
          id: doc.id,
          answeredAt: data.answeredAt
            ? data.answeredAt
            : new Date().toISOString(),
        } as Performance);
      });
      return perfs;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.LIST,
        `users/${auth.currentUser.uid}/performances`,
      );
      return [];
    }
  },

  savePerformance: async (performance: Performance) => {
    if (!auth.currentUser) return;
    try {
      // Check if already answered to prevent double counting in ranking
      const perfQuery = query(
        collection(db, `users/${auth.currentUser.uid}/performances`),
        where("questionId", "==", performance.questionId)
      );
      const existingPerf = await getDocs(perfQuery);
      const isFirstAnswer = existingPerf.empty;

      const docRef = doc(
        collection(db, `users/${auth.currentUser.uid}/performances`),
      );
      const dataToSave: any = {
        userId: auth.currentUser.uid,
        questionId: performance.questionId,
        isCorrect: performance.isCorrect,
        answeredAt: performance.answeredAt || new Date().toISOString(),
        timeSpent: performance.timeSpent || 0,
        topic: performance.topic || "a",
        discipline: performance.discipline || "a",
      };
      if (performance.selectedAlternativeId !== undefined) {
        dataToSave.selectedAlternativeId = performance.selectedAlternativeId;
      }
      await setDoc(docRef, dataToSave);

      // Update weekly ranking for every answered question
      const weekId = getWeekId();
      const currentSeries = localStorage.getItem(`apses_current_series_${auth.currentUser.uid}`) || 'E';
      const rankRef = doc(db, `leaderboards/${weekId}_${currentSeries}/users/${auth.currentUser.uid}`);
      await setDoc(rankRef, {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || auth.currentUser.email || 'Usuário',
        photoURL: auth.currentUser.photoURL || '',
        score: increment(performance.isCorrect ? 1 : -1),
        correctCount: increment(performance.isCorrect ? 1 : 0),
        incorrectCount: increment(performance.isCorrect ? 0 : 1),
        lastUpdated: serverTimestamp()
      }, { merge: true });

      if (performance.isCorrect && isFirstAnswer) {
          const seasonRef = doc(db, `leaderboards/season13/users/${auth.currentUser.uid}`);
          await setDoc(seasonRef, {
            uid: auth.currentUser.uid,
            displayName: auth.currentUser.displayName || auth.currentUser.email || 'Usuário',
            photoURL: auth.currentUser.photoURL || '',
            seasonCorrectCount: increment(1),
            lastUpdated: serverTimestamp()
          }, { merge: true });
          
          const userDoc = doc(db, 'users', auth.currentUser.uid);
          await setDoc(userDoc, { seasonCorrectCount: increment(1) }, { merge: true });
      }

    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        `users/${auth.currentUser.uid}/performances`,
      );
    }
  },

  syncTasks: async (): Promise<any[]> => {
    if (!auth.currentUser) return [];
    try {
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/tasks`),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `users/${auth.currentUser.uid}/tasks`);
      return [];
    }
  },

  syncCycleConfig: async (): Promise<any | null> => {
    if (!auth.currentUser) return null;
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/config/cycle`);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? snapshot.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser.uid}/config/cycle`);
      return null;
    }
  },

  syncSavedFilters: async (): Promise<any[]> => {
    if (!auth.currentUser) return [];
    try {
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/savedFilters`),
        orderBy("isFavorite", "desc"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `users/${auth.currentUser.uid}/savedFilters`);
      return [];
    }
  },

  saveFilter: async (filter: any) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(collection(db, `users/${auth.currentUser.uid}/savedFilters`), filter.id || undefined);
      const id = docRef.id;
      const data = {
        ...filter,
        id,
        createdAt: filter.createdAt || new Date().toISOString(),
      };
      await setDoc(docRef, data);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${auth.currentUser.uid}/savedFilters`);
      return null;
    }
  },

  getFavoriteCourses: async (): Promise<string[]> => {
    if (!auth.currentUser) return [];
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/config/favorites`);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists() && snapshot.data().courses) {
        return snapshot.data().courses;
      }
      return [];
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser.uid}/config/favorites`);
      return [];
    }
  },

  toggleFavoriteCourse: async (courseId: string, isFavorite: boolean): Promise<void> => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/config/favorites`);
      const snapshot = await getDoc(docRef);
      let courses = [];
      if (snapshot.exists() && snapshot.data().courses) {
        courses = snapshot.data().courses;
      }
      
      if (isFavorite && !courses.includes(courseId)) {
        courses.push(courseId);
      } else if (!isFavorite && courses.includes(courseId)) {
        courses = courses.filter((id: string) => id !== courseId);
      }
      
      await setDoc(docRef, { courses }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}/config/favorites`);
    }
  },
  deleteFilter: async (filterId: string) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/savedFilters`, filterId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${auth.currentUser.uid}/savedFilters`);
    }
  },

  getUserSettings: async () => {
    if (!auth.currentUser) return null;
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().settings;
      }
      return null;
    } catch (error) {
      console.warn(error);
      return null;
    }
  },

  saveUserSettings: async (settings: any) => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(
        userRef,
        {
          settings,
        },
        { merge: true },
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `users/${auth.currentUser.uid}`,
      );
    }
  },

  incrementDailyQuestions: async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const todayStr = getBrazilTodayStr();
        if (data.lastQuestionResetDate !== todayStr) {
          await updateDoc(docRef, { 
            dailyQuestionsCount: 1,
            lastQuestionResetDate: todayStr
          });
        } else {
          await updateDoc(docRef, { dailyQuestionsCount: increment(1) });
        }
      } else {
        const todayStr = getBrazilTodayStr();
        await setDoc(docRef, { dailyQuestionsCount: 1, lastQuestionResetDate: todayStr }, { merge: true });
      }
    } catch (error) {
      console.warn("Failed to increment daily questions", error);
    }
  },

  incrementAIFlashcards: async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(docRef, { aiFlashcardsUsedCount: increment(1) }, { merge: true });
    } catch (error) {
      console.warn("Failed to increment AI flashcards", error);
    }
  },

  saveFlashcard: async (flashcard: any) => {
    if (!auth.currentUser) return;
    try {
      const docRef = flashcard.id 
        ? doc(db, `users/${auth.currentUser.uid}/flashcards`, flashcard.id)
        : doc(collection(db, `users/${auth.currentUser.uid}/flashcards`));
      
      const data = {
        ...flashcard,
        id: docRef.id,
        createdAt: flashcard.createdAt || Date.now(),
      };
      await setDoc(docRef, data);
      
      if (flashcard.source === 'ai') {
        await firebaseStorageService.incrementAIFlashcards();
      }
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${auth.currentUser.uid}/flashcards`);
    }
  },

  deleteFlashcard: async (flashcardId: string) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/flashcards`, flashcardId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${auth.currentUser.uid}/flashcards`);
    }
  },

  getFlashcardsCountForQuestion: async (questionId: string): Promise<{ questionFlashcards: number; commentFlashcards: number }> => {
    if (!auth.currentUser) return { questionFlashcards: 0, commentFlashcards: 0 };
    try {
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/flashcards`),
        where("sourceQuestionId", "==", questionId)
      );
      const querySnapshot = await getDocs(q);
      let questionFlashcards = 0;
      let commentFlashcards = 0;
      querySnapshot.forEach(doc => {
        if (doc.data().source === 'community') {
          commentFlashcards++;
        } else {
          questionFlashcards++;
        }
      });
      return { questionFlashcards, commentFlashcards };
    } catch (error) {
      console.warn(error);
      return { questionFlashcards: 0, commentFlashcards: 0 };
    }
  },

  syncFlashcards: async (): Promise<any[]> => {
    if (!auth.currentUser) return [];
    try {
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/flashcards`),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `users/${auth.currentUser.uid}/flashcards`);
      return [];
    }
  },

  syncOwnedPacks: async (): Promise<string[]> => {
    if (!auth.currentUser) return [];
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.ownedPacks || [];
      }
      return [];
    } catch (error) {
      console.warn("Error syncing owned packs:", error);
      return [];
    }
  },

  saveOwnedPacks: async (packs: string[]) => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { ownedPacks: packs }, { merge: true });
    } catch (error) {
      console.warn("Error saving owned packs:", error);
    }
  },

  getUserProfile: async () => {
    if (!auth.currentUser) return null;
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.warn("Error fetching user profile:", error);
      return null;
    }
  },

  // Study Sessions
  saveStudySession: async (session: Partial<StudySession>) => {
    if (!auth.currentUser) return;
    try {
      const sessionId = session.id || doc(collection(db, `users/${auth.currentUser.uid}/activeSessions`)).id;
      const docRef = doc(db, `users/${auth.currentUser.uid}/activeSessions`, sessionId);
      
      const data = {
        ...session,
        id: sessionId,
        userId: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
        createdAt: session.createdAt || serverTimestamp(),
      };
      
      await setDoc(docRef, data, { merge: true });
      return sessionId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser?.uid}/activeSessions`);
    }
  },

  getStudySessions: async (status: 'active' | 'completed' = 'active'): Promise<StudySession[]> => {
    if (!auth.currentUser) return [];
    try {
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/activeSessions`),
        where("status", "==", status),
        orderBy("updatedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StudySession));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `users/${auth.currentUser?.uid}/activeSessions`);
      return [];
    }
  },

  deleteStudySession: async (sessionId: string) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/activeSessions`, sessionId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${auth.currentUser?.uid}/activeSessions`);
    }
  },

  getStudySession: async (sessionId: string): Promise<StudySession | null> => {
    if (!auth.currentUser) return null;
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/activeSessions`, sessionId);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? snapshot.data() as StudySession : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}/activeSessions`);
      return null;
    }
  },

  ensureUserExists: async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    const uid = currentUser.uid;
    const now = Date.now();
    
    // 1. Skip if synced within the cooldown to avoid spamming the server
    if (lastSyncTimeByUid[uid] && (now - lastSyncTimeByUid[uid] < SYNC_COOLDOWN)) {
      console.log("[STORAGE] Sync skipped: synced recently within cooldown period.");
      return;
    }
    
    // 2. Reuse in-progress promise if another sync is currently running
    if (activeSyncPromise) {
      console.log("[STORAGE] Sync already in-progress, reusing active promise.");
      return activeSyncPromise;
    }
    
    activeSyncPromise = (async () => {
      let retries = 3;
      let delay = 1000;
      
      while (retries > 0) {
        try {
          const idToken = await currentUser.getIdToken();
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          const response = await fetch('/api/profile/initialize', {
            signal: controller.signal,
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          clearTimeout(timeoutId);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Sync failed: ${response.status} ${response.statusText} - ${errorText}`);
          }

          const userData = await response.json();
          
          // Sync theme on startup if possible
          if (userData?.settings?.darkMode) {
            document.documentElement.classList.add("dark");
          }
          
          console.log("[STORAGE] User synced with server successfully");
          lastSyncTimeByUid[uid] = Date.now();
          activeSyncPromise = null;
          return userData;
        } catch (error) {
          retries--;
          console.warn(`Failed to sync user with server (attempts left: ${retries})`, error);
          if (retries === 0) {
            activeSyncPromise = null;
            // Return fallback user profile instead of crashing UI on quota limit
            return {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Usuário',
              photoURL: currentUser.photoURL || '',
              planStatus: 'free'
            };
          } else {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          }
        }
      }
    })();
    
    return activeSyncPromise;
  },
};
