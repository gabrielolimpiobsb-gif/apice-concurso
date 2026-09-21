import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { 
  PdfCourse, 
  UserPdfProgress, 
  PdfBookmark, 
  PdfAnnotation 
} from '../types';
import { MOCK_PDF_COURSES } from '../data/mockPdfCourses';

const LOCAL_STORAGE_PROGRESS_KEY = 'apses_pdf_progress_';
const LOCAL_STORAGE_FAVORITES_KEY = 'apses_pdf_favorites_';
const LOCAL_STORAGE_COURSES_KEY = 'apses_pdf_custom_courses';

export const pdfCourseService = {
  /**
   * Fetches all PDF courses: reads from Firestore collection 'pdf_courses',
   * merges with curated pre-configured courses, and returns the sorted list.
   */
  getAllCourses: async (): Promise<PdfCourse[]> => {
    try {
      const coursesMap = new Map<string, PdfCourse>();

      // 1. Load curated baseline courses
      MOCK_PDF_COURSES.forEach(course => {
        coursesMap.set(course.id, course);
      });

      // 2. Load local custom courses (fallback / snappy load)
      try {
        const localCustom = localStorage.getItem(LOCAL_STORAGE_COURSES_KEY);
        if (localCustom) {
          const parsed = JSON.parse(localCustom) as PdfCourse[];
          parsed.forEach(c => coursesMap.set(c.id, c));
        }
      } catch (e) {
        console.warn('Falha ao ler cursos PDF do cache local:', e);
      }

      // 3. Fetch from Firestore (cloud source of truth)
      try {
        const querySnapshot = await getDocs(collection(db, 'pdf_courses'));
        querySnapshot.forEach(docSnap => {
          const data = docSnap.data() as PdfCourse;
          coursesMap.set(docSnap.id, { ...data, id: docSnap.id });
        });
      } catch (cloudErr) {
        console.info('Aviso: usando catálogo sincronizado de cursos PDF.');
      }

      return Array.from(coursesMap.values());
    } catch (err) {
      console.error('Erro ao listar cursos PDF:', err);
      return MOCK_PDF_COURSES;
    }
  },

  /**
   * Saves or updates a PDF course in the cloud (Firestore)
   */
  saveCourse: async (course: PdfCourse): Promise<boolean> => {
    try {
      // 1. Save to local storage for instant offline availability
      try {
        const localCustom = localStorage.getItem(LOCAL_STORAGE_COURSES_KEY);
        let list: PdfCourse[] = localCustom ? JSON.parse(localCustom) : [];
        const index = list.findIndex(c => c.id === course.id);
        if (index >= 0) {
          list[index] = course;
        } else {
          list.push(course);
        }
        localStorage.setItem(LOCAL_STORAGE_COURSES_KEY, JSON.stringify(list));
      } catch (e) {}

      // 2. Persist in Firestore
      const courseRef = doc(db, 'pdf_courses', course.id);
      await setDoc(courseRef, {
        ...course,
        updatedAt: Date.now()
      }, { merge: true });

      return true;
    } catch (err) {
      console.error('Erro ao salvar curso na nuvem:', err);
      return false;
    }
  },

  /**
   * Deletes a PDF course from Firestore
   */
  deleteCourse: async (courseId: string): Promise<boolean> => {
    try {
      try {
        const localCustom = localStorage.getItem(LOCAL_STORAGE_COURSES_KEY);
        if (localCustom) {
          let list: PdfCourse[] = JSON.parse(localCustom);
          list = list.filter(c => c.id !== courseId);
          localStorage.setItem(LOCAL_STORAGE_COURSES_KEY, JSON.stringify(list));
        }
      } catch (e) {}

      await deleteDoc(doc(db, 'pdf_courses', courseId));
      return true;
    } catch (err) {
      console.error('Erro ao deletar curso na nuvem:', err);
      return false;
    }
  },

  /**
   * Gets user reading progress for all courses
   */
  getAllUserProgress: async (userId?: string): Promise<Record<string, UserPdfProgress>> => {
    const progressMap: Record<string, UserPdfProgress> = {};
    const uid = userId || auth.currentUser?.uid;

    // 1. Read from local storage first (instant)
    if (uid) {
      try {
        const saved = localStorage.getItem(`${LOCAL_STORAGE_PROGRESS_KEY}${uid}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.assign(progressMap, parsed);
        }
      } catch (e) {}
    }

    // 2. Read from Firestore subcollection /users/{uid}/pdf_progress
    if (uid) {
      try {
        const colRef = collection(db, 'users', uid, 'pdf_progress');
        const snap = await getDocs(colRef);
        snap.forEach(docSnap => {
          const data = docSnap.data() as UserPdfProgress;
          progressMap[docSnap.id] = data;
        });

        // Update local cache
        try {
          localStorage.setItem(`${LOCAL_STORAGE_PROGRESS_KEY}${uid}`, JSON.stringify(progressMap));
        } catch (e) {}
      } catch (e) {
        // quiet fallback
      }
    }

    return progressMap;
  },

  /**
   * Saves user reading progress in the cloud
   */
  saveUserProgress: async (
    courseId: string, 
    progressUpdate: Partial<UserPdfProgress>,
    userId?: string
  ): Promise<UserPdfProgress> => {
    const uid = userId || auth.currentUser?.uid || 'guest';
    const now = Date.now();

    // Default template
    const existing = (await pdfCourseService.getAllUserProgress(uid))[courseId] || {
      courseId,
      currentPage: 1,
      totalPages: 100,
      completedChapters: [],
      status: 'not_started',
      lastReadAt: now,
      totalReadMinutes: 0
    };

    const updated: UserPdfProgress = {
      ...existing,
      ...progressUpdate,
      courseId,
      lastReadAt: now
    };

    // Auto-calculate status
    if (updated.currentPage >= updated.totalPages && updated.totalPages > 0) {
      updated.status = 'completed';
    } else if (updated.currentPage > 1) {
      updated.status = 'reading';
    }

    // 1. Local Cache
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PROGRESS_KEY}${uid}`);
      const map: Record<string, UserPdfProgress> = saved ? JSON.parse(saved) : {};
      map[courseId] = updated;
      localStorage.setItem(`${LOCAL_STORAGE_PROGRESS_KEY}${uid}`, JSON.stringify(map));
    } catch (e) {}

    // 2. Firestore Cloud Sync
    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        const progressDocRef = doc(db, 'users', uid, 'pdf_progress', courseId);
        await setDoc(progressDocRef, updated, { merge: true });
      } catch (err) {
        console.warn('Aviso: progresso salvo localmente, sincronizará com a nuvem na próxima conexão.');
      }
    }

    return updated;
  },

  /**
   * Gets user bookmarks for a course
   */
  getBookmarks: async (courseId: string, userId?: string): Promise<PdfBookmark[]> => {
    const uid = userId || auth.currentUser?.uid || 'guest';
    const key = `apses_pdf_bookmarks_${uid}_${courseId}`;
    let list: PdfBookmark[] = [];

    try {
      const saved = localStorage.getItem(key);
      if (saved) list = JSON.parse(saved);
    } catch (e) {}

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        const colRef = collection(db, 'users', uid, 'pdf_bookmarks');
        const q = query(colRef, where('courseId', '==', courseId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const cloudBookmarks: PdfBookmark[] = [];
          snap.forEach(d => cloudBookmarks.push(d.data() as PdfBookmark));
          list = cloudBookmarks.sort((a, b) => a.page - b.page);
          localStorage.setItem(key, JSON.stringify(list));
        }
      } catch (e) {}
    }

    return list;
  },

  /**
   * Toggles bookmark for a specific page
   */
  toggleBookmark: async (
    courseId: string, 
    page: number, 
    chapterTitle?: string,
    userId?: string
  ): Promise<{ added: boolean; bookmarks: PdfBookmark[] }> => {
    const uid = userId || auth.currentUser?.uid || 'guest';
    const current = await pdfCourseService.getBookmarks(courseId, uid);
    const existingIndex = current.findIndex(b => b.page === page);
    let added = false;
    let updated: PdfBookmark[] = [];

    const bookmarkId = `${courseId}_p${page}`;

    if (existingIndex >= 0) {
      updated = current.filter(b => b.page !== page);
      added = false;
      if (auth.currentUser && auth.currentUser.uid === uid) {
        deleteDoc(doc(db, 'users', uid, 'pdf_bookmarks', bookmarkId)).catch(() => {});
      }
    } else {
      const newBm: PdfBookmark = {
        id: bookmarkId,
        courseId,
        page,
        chapterTitle: chapterTitle || `Página ${page}`,
        createdAt: Date.now()
      };
      updated = [...current, newBm].sort((a, b) => a.page - b.page);
      added = true;
      if (auth.currentUser && auth.currentUser.uid === uid) {
        setDoc(doc(db, 'users', uid, 'pdf_bookmarks', bookmarkId), newBm, { merge: true }).catch(() => {});
      }
    }

    try {
      localStorage.setItem(`apses_pdf_bookmarks_${uid}_${courseId}`, JSON.stringify(updated));
    } catch (e) {}

    return { added, bookmarks: updated };
  },

  /**
   * Gets user notes / annotations for a course
   */
  getNotes: async (courseId: string, userId?: string): Promise<PdfAnnotation[]> => {
    const uid = userId || auth.currentUser?.uid || 'guest';
    const key = `apses_pdf_notes_${uid}_${courseId}`;
    let list: PdfAnnotation[] = [];

    try {
      const saved = localStorage.getItem(key);
      if (saved) list = JSON.parse(saved);
    } catch (e) {}

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        const colRef = collection(db, 'users', uid, 'pdf_notes');
        const q = query(colRef, where('courseId', '==', courseId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const cloudNotes: PdfAnnotation[] = [];
          snap.forEach(d => cloudNotes.push(d.data() as PdfAnnotation));
          list = cloudNotes.sort((a, b) => b.updatedAt - a.updatedAt);
          localStorage.setItem(key, JSON.stringify(list));
        }
      } catch (e) {}
    }

    return list;
  },

  /**
   * Saves a note in the cloud
   */
  saveNote: async (
    courseId: string,
    note: Omit<PdfAnnotation, 'id' | 'createdAt' | 'updatedAt' | 'courseId'> & { id?: string; courseId?: string },
    userId?: string
  ): Promise<PdfAnnotation> => {
    const uid = userId || auth.currentUser?.uid || 'guest';
    const now = Date.now();
    const id = note.id || `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const fullNote: PdfAnnotation = {
      ...note,
      id,
      courseId,
      createdAt: now,
      updatedAt: now
    };

    const currentNotes = await pdfCourseService.getNotes(courseId, uid);
    const existingIdx = currentNotes.findIndex(n => n.id === id);
    let updated: PdfAnnotation[];
    if (existingIdx >= 0) {
      updated = [...currentNotes];
      updated[existingIdx] = { ...currentNotes[existingIdx], ...fullNote, updatedAt: now };
    } else {
      updated = [fullNote, ...currentNotes];
    }

    try {
      localStorage.setItem(`apses_pdf_notes_${uid}_${courseId}`, JSON.stringify(updated));
    } catch (e) {}

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        await setDoc(doc(db, 'users', uid, 'pdf_notes', id), fullNote, { merge: true });
      } catch (e) {}
    }

    return fullNote;
  },

  /**
   * Deletes a note
   */
  deleteNote: async (courseId: string, noteId: string, userId?: string): Promise<boolean> => {
    const uid = userId || auth.currentUser?.uid || 'guest';
    const currentNotes = await pdfCourseService.getNotes(courseId, uid);
    const filtered = currentNotes.filter(n => n.id !== noteId);

    try {
      localStorage.setItem(`apses_pdf_notes_${uid}_${courseId}`, JSON.stringify(filtered));
    } catch (e) {}

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        await deleteDoc(doc(db, 'users', uid, 'pdf_notes', noteId));
      } catch (e) {}
    }

    return true;
  },

  /**
   * Toggles course favorite
   */
  toggleFavorite: async (courseId: string, userId?: string): Promise<boolean> => {
    const uid = userId || auth.currentUser?.uid || 'guest';
    const key = `${LOCAL_STORAGE_FAVORITES_KEY}${uid}`;
    let favs: string[] = [];

    try {
      const saved = localStorage.getItem(key);
      if (saved) favs = JSON.parse(saved);
    } catch (e) {}

    const isFav = favs.includes(courseId);
    if (isFav) {
      favs = favs.filter(id => id !== courseId);
    } else {
      favs.push(courseId);
    }

    try {
      localStorage.setItem(key, JSON.stringify(favs));
    } catch (e) {}

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, { favoritePdfCourses: favs }, { merge: true });
      } catch (e) {}
    }

    return !isFav;
  },

  /**
   * Gets favorite course IDs
   */
  getFavorites: async (userId?: string): Promise<string[]> => {
    const uid = userId || auth.currentUser?.uid || 'guest';
    const key = `${LOCAL_STORAGE_FAVORITES_KEY}${uid}`;
    let favs: string[] = [];

    try {
      const saved = localStorage.getItem(key);
      if (saved) favs = JSON.parse(saved);
    } catch (e) {}

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        if (snap.exists() && snap.data().favoritePdfCourses) {
          favs = snap.data().favoritePdfCourses as string[];
          localStorage.setItem(key, JSON.stringify(favs));
        }
      } catch (e) {}
    }

    return favs;
  }
};
