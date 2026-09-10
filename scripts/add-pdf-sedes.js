import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "ai-studio-adcdca29-b4a0-4f4a-b4be-30a238c77fbd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addDisciplineAndLesson() {
  const courseId = 'sedes-df';
  
  // 1. Check if 'Assistência Social' exists
  const q = query(collection(db, 'disciplines'), where('courseId', '==', courseId), where('title', '==', 'Assistência Social'));
  const snap = await getDocs(q);
  
  let discId;
  if (snap.empty) {
    const disc = doc(collection(db, 'disciplines'));
    await setDoc(disc, { courseId: courseId, title: 'Assistência Social' });
    discId = disc.id;
    console.log('Created discipline Assistência Social');
  } else {
    discId = snap.docs[0].id;
    console.log('Found discipline Assistência Social');
  }

  // 2. Add the lesson for 'Cartão Prato Cheio'
  const lesson = doc(collection(db, 'lessons'));
  await setDoc(lesson, {
    courseId: courseId,
    disciplineId: discId,
    type: 'pdf',
    title: 'Cartão Prato Cheio',
    module: 'Políticas Públicas DF',
    order: 1,
    pages: 10,
    size: '2.5 MB',
    pdfUrl: 'local://cartao-prato-cheio'
  });
  console.log('Created lesson Cartão Prato Cheio');

  process.exit(0);
}

addDisciplineAndLesson().catch(console.error);
