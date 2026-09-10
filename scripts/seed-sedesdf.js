import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "ai-studio-adcdca29-b4a0-4f4a-b4be-30a238c77fbd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedCourse() {
  const courseId = 'sedes-df';
  
  // Seed Course
  await setDoc(doc(db, 'courses', courseId), {
    title: 'SEDES DF',
    subtitle: 'Secretaria de Estado de Desenvolvimento Social do DF',
    color: 'from-[#0b1f3c] to-[#040f21]',
    accent: '#54ACBF',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=800'
  });
  console.log('Created course sedes-df');

  // Seed Disciplines
  const disc1 = doc(collection(db, 'disciplines'));
  await setDoc(disc1, { courseId: courseId, title: 'Língua Portuguesa' });
  const disc2 = doc(collection(db, 'disciplines'));
  await setDoc(disc2, { courseId: courseId, title: 'Realidade do DF' });
  const disc3 = doc(collection(db, 'disciplines'));
  await setDoc(disc3, { courseId: courseId, title: 'Conhecimentos Específicos' });
  console.log('Created disciplines');

  // Seed Lessons
  await setDoc(doc(collection(db, 'lessons')), {
    courseId: courseId, disciplineId: disc1.id, type: 'video', title: 'Aula 01 - Compreensão de Textos', module: 'Módulo 1', order: 1, duration: 1800
  });
  await setDoc(doc(collection(db, 'lessons')), {
    courseId: courseId, disciplineId: disc1.id, type: 'video', title: 'Aula 02 - Ortografia Oficial', module: 'Módulo 1', order: 2, duration: 2100
  });
  await setDoc(doc(collection(db, 'lessons')), {
    courseId: courseId, disciplineId: disc1.id, type: 'pdf', title: 'Teoria + Questões - Tipologia', module: 'Módulo 1', order: 3, pages: 45, size: '2.5 MB'
  });
  await setDoc(doc(collection(db, 'lessons')), {
    courseId: courseId, disciplineId: disc2.id, type: 'video', title: 'Aula 01 - História do DF', module: 'Módulo Único', order: 1, duration: 1500
  });
  await setDoc(doc(collection(db, 'lessons')), {
    courseId: courseId, disciplineId: disc3.id, type: 'video', title: 'Aula 01 - LOAS', module: 'Módulo Único', order: 1, duration: 2400
  });
  await setDoc(doc(collection(db, 'lessons')), {
    courseId: courseId, disciplineId: disc3.id, type: 'pdf', title: 'Legislação Específica - SEDES', module: 'Módulo Único', order: 2, pages: 60, size: '4.1 MB'
  });
  console.log('Created lessons');

  process.exit(0);
}

seedCourse().catch((err) => {
  console.error(err);
  process.exit(1);
});
