import { collection, doc, setDoc, getDocs, getDoc, query, where, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  accent: string;
  status: 'available' | 'preparing';
  image: string;
}

export interface Discipline {
  id: string;
  courseId: string;
  title: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  disciplineId: string;
  type: 'video' | 'pdf';
  title: string;
  module: string;
  order: number;
  // Video specific
  duration?: number;
  videoUrl?: string;
  // PDF specific
  pages?: number;
  pdfUrl?: string;
  size?: string;
}

export interface UserProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  lastLessonId?: string;
  progressPercent: number;
}

export const courseService = {
  getCourses: async (): Promise<Course[]> => {
    try {
      const q = query(collection(db, 'courses'));
      const snapshot = await getDocs(q);
      const courses: Course[] = [];
      snapshot.forEach(doc => courses.push({ id: doc.id, ...doc.data() } as Course));
      return courses;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'courses');
      return [];
    }
  },

  getDisciplines: async (courseId: string): Promise<Discipline[]> => {
    try {
      const q = query(collection(db, 'disciplines'), where('courseId', '==', courseId));
      const snapshot = await getDocs(q);
      const disciplines: Discipline[] = [];
      snapshot.forEach(doc => disciplines.push({ id: doc.id, ...doc.data() } as Discipline));
      return disciplines;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'disciplines');
      return [];
    }
  },

  getLessons: async (courseId: string, disciplineId?: string): Promise<Lesson[]> => {
    try {
      let q = query(collection(db, 'lessons'), where('courseId', '==', courseId));
      if (disciplineId) {
        q = query(collection(db, 'lessons'), where('courseId', '==', courseId), where('disciplineId', '==', disciplineId));
      }
      const snapshot = await getDocs(q);
      const lessons: Lesson[] = [];
      snapshot.forEach(doc => lessons.push({ id: doc.id, ...doc.data() } as Lesson));
      return lessons.sort((a, b) => a.order - b.order);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'lessons');
      return [];
    }
  },

  getUserProgress: async (courseId: string): Promise<UserProgress | null> => {
    if (!auth.currentUser) return null;
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/courseProgress`, courseId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserProgress;
      }
      return {
        userId: auth.currentUser.uid,
        courseId,
        completedLessons: [],
        progressPercent: 0
      };
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `users/${auth.currentUser?.uid}/courseProgress/${courseId}`);
      return null;
    }
  },

  markLessonCompleted: async (courseId: string, lessonId: string, totalCourseLessons: number) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/courseProgress`, courseId);
      const snapshot = await getDoc(docRef);
      
      let completedLessons: string[] = [];
      if (snapshot.exists()) {
        completedLessons = snapshot.data().completedLessons || [];
      }
      
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }
      
      const progressPercent = totalCourseLessons > 0 ? Math.round((completedLessons.length / totalCourseLessons) * 100) : 0;
      
      await setDoc(docRef, {
        userId: auth.currentUser.uid,
        courseId,
        completedLessons,
        lastLessonId: lessonId,
        progressPercent
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${auth.currentUser?.uid}/courseProgress`);
    }
  }
};
