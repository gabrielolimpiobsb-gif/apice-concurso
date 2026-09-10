import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "ai-studio-adcdca29-b4a0-4f4a-b4be-30a238c77fbd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  console.log("Checking DB...");
  const c = collection(db, 'courses');
  const snap = await getDocs(c);
  console.log("courses size:", snap.size);
  
  const d = collection(db, 'disciplines');
  const dSnap = await getDocs(d);
  console.log("disciplines size:", dSnap.size);

  const l = collection(db, 'lessons');
  const lSnap = await getDocs(l);
  console.log("lessons size:", lSnap.size);
  
  process.exit(0);
}
test().catch((err) => {
  console.error(err);
  process.exit(1);
});
