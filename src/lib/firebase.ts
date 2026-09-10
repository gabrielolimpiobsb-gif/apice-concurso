import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, setLogLevel } from 'firebase/firestore';

setLogLevel('silent');
import { getAnalytics, isSupported } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}),
  experimentalForceLongPolling: true
}, (firebaseConfig as any).firestoreDatabaseId || "ai-studio-adcdca29-b4a0-4f4a-b4be-30a238c77fbd");
export const auth = getAuth(app);

// Analytics is only supported in certain environments
export const analytics = typeof window !== 'undefined' ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

