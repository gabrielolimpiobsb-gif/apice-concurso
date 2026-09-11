const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const firebaseConfig = require('./firebase-applet-config.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'ai-studio-adcdca29-b4a0-4f4a-b4be-30a238c77fbd');

async function test() {
  try {
    await setDoc(doc(db, 'users', '12345'), {
      role: 'admin',
      displayName: 'Test Admin',
      planStatus: 'premium'
    }, { merge: true });
    console.log('User created');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
