const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const firebaseConfig = require('./firebase-applet-config.json');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function test() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, 'backend@apice.com', 'SuperSecretPassword123');
    console.log('Created backend user:', userCredential.user.uid);
    process.exit(0);
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      console.log('Backend user already exists.');
      process.exit(0);
    }
    console.error('Error:', e);
    process.exit(1);
  }
}
test();
