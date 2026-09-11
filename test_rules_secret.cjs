const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');
const firebaseConfig = require('./firebase-applet-config.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'ai-studio-adcdca29-b4a0-4f4a-b4be-30a238c77fbd');

async function test() {
  try {
    await updateDoc(doc(db, 'users', '12345'), { webhookSecret: 'YOUR_SUPER_SECRET_KEY', planStatus: 'premium' });
    console.log('Success!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
test();
