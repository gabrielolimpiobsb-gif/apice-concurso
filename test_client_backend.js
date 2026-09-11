const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc } = require('firebase/firestore');
const firebaseConfig = require('./firebase-applet-config.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'ai-studio-adcdca29-b4a0-4f4a-b4be-30a238c77fbd');

async function test() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    console.log('users:', snap.size);
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
