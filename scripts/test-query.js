import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "ai-studio-adcdca29-b4a0-4f4a-b4be-30a238c77fbd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  const q = query(
    collection(db, `leaderboards/2026_5_15_E/users`),
    orderBy("score", "desc")
  );
  try {
    const snap = await getDocs(q);
    console.log("Success! Docs:", snap.size);
  } catch (err) {
    console.error("Query failed:", err.message);
  }
}

test().catch(console.error);
