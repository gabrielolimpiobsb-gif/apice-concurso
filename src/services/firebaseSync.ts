import { auth, db } from '../lib/firebase';
import { collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { storageService } from './storageService';

export const firebaseSync = {
  syncFromFirestore: async () => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;

    try {
      // 1. Get Tasks
      const tasksSnapshot = await getDocs(collection(db, 'users', userId, 'tasks'));
      const tasks = tasksSnapshot.docs.map(doc => doc.data());
      if (tasks.length > 0) {
        storageService.setTasks(tasks);
      }

      // 2. Get Performance
      const perfSnapshot = await getDocs(collection(db, 'users', userId, 'performances'));
      const performance = perfSnapshot.docs.map(doc => doc.data());
      if (performance.length > 0) {
        localStorage.setItem(`concurso_pro_performance_${userId}`, JSON.stringify(performance));
      }

      // 3. Get Cycle Config
      const cycleDoc = await getDoc(doc(db, 'users', userId, 'config', 'cycle'));
      if (cycleDoc.exists()) {
        storageService.setCycleConfig(cycleDoc.data());
      }

      // 4. Get User Profile / Settings
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.settings?.scheduleMode) {
          storageService.setScheduleMode(userData.settings.scheduleMode);
        }
      }
    } catch (error) {
      console.error("Error syncing from Firestore:", error);
    }
  },

  startRealtimeSync: () => {
    if (!auth.currentUser) return () => {};
    const userId = auth.currentUser.uid;

    const unsubTasks = onSnapshot(collection(db, 'users', userId, 'tasks'), (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return; // Ignore local changes as we already update localStorage
        const tasks = snapshot.docs.map(doc => doc.data());
        if (tasks.length > 0) {
            localStorage.setItem(`concurso_pro_tasks_${userId}`, JSON.stringify(tasks));
        }
    });

    return () => {
        unsubTasks();
    };
  }
};
