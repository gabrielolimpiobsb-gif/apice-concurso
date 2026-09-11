const firebase = require('firebase/compat/app');
require('firebase/compat/firestore');
require('firebase/compat/auth');
const firebaseConfig = require('./firebase-applet-config.json');

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(firebase.app());
if (firebaseConfig.firestoreDatabaseId) {
    db._databaseId = firebase.firestore.DatabaseId.fromName(firebaseConfig.firestoreDatabaseId);
    // actually compat might just work with databaseId in newer versions?
}

async function test() {
  try {
    await auth.signInWithEmailAndPassword('backend@apice.com', 'SuperSecretPassword123');
    console.log('Logged in!');
    
    // Test compat API
    const snap = await db.collection('users').doc('12345').get();
    console.log('Got user:', snap.exists);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
test();
