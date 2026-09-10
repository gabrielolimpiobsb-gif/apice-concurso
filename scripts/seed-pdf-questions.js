import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "ai-studio-adcdca29-b4a0-4f4a-b4be-30a238c77fbd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addQuestions() {
  const courseId = 'sedes-df';
  const lQuery = query(collection(db, 'lessons'), where('courseId', '==', courseId), where('title', '==', 'Cartão Prato Cheio'));
  const lSnap = await getDocs(lQuery);
  if (lSnap.empty) {
    console.log('Lesson not found');
    process.exit(1);
  }
  const lessonId = lSnap.docs[0].id;
  const disciplineId = lSnap.docs[0].data().disciplineId;

  // Check if questions already exist to avert duplicates
  const qQuestions = query(collection(db, 'questions'), where('lessonId', '==', lessonId));
  const qSnap = await getDocs(qQuestions);
  if (!qSnap.empty) {
     console.log('Questions already seeded');
     process.exit(0);
  }

  const questions = [
    {
      text: "O Programa Cartão Prato Cheio possui natureza de benefício de prestação continuada, sendo concedido de forma vitalícia às famílias do Distrito Federal com renda per capita de até um salário mínimo.",
      options: ["CERTO", "ERRADO"],
      correctAnswer: 1,
      explanation: "O benefício é emergencial e temporário, não é de prestação continuada nem vitalício. O limite de renda é de meia (1/2) salário mínimo per capita.",
      source: "Inédita/Assistência Social",
      year: 2026,
      subject: "Assistência Social",
      topic: "Cartão Prato Cheio",
      courseId,
      lessonId,
      disciplineId
    },
    {
      text: "Para a concessão do Cartão Prato Cheio, a lei estabelece critérios de prioridade, encontrando-se no topo dessa lista as famílias monoparentais chefiadas por mulheres e as famílias que possuem crianças de 0 a 6 anos.",
      options: ["CERTO", "ERRADO"],
      correctAnswer: 0,
      explanation: "A Lei nº 7.009/2021 estabelece os referidos grupos como prioritários para concessão do benefício, juntamente com pessoas com deficiência, idosos e pessoas em situação de rua.",
      source: "Inédita/Assistência Social",
      year: 2026,
      subject: "Assistência Social",
      topic: "Cartão Prato Cheio",
      courseId,
      lessonId,
      disciplineId
    },
    {
      text: "O uso do Cartão Prato Cheio para a compra de materiais de higiene pessoal e limpeza é permitido, uma vez que tais produtos compunham as antigas cestas básicas entregues fisicamente pelo GDF.",
      options: ["CERTO", "ERRADO"],
      correctAnswer: 1,
      explanation: "Destina-se exclusivamente à aquisição de gêneros alimentícios. Cosméticos, limpeza e bebidas alcoólicas são vedados.",
      source: "Inédita/Assistência Social",
      year: 2026,
      subject: "Assistência Social",
      topic: "Cartão Prato Cheio",
      courseId,
      lessonId,
      disciplineId
    },
    {
      text: "Caso a equipe de assistência social identifique que uma família beneficiária mudou-se para o município de Valparaíso de Goiás (Entorno do DF), o benefício deverá ser imediatamente cancelado.",
      options: ["CERTO", "ERRADO"],
      correctAnswer: 0,
      explanation: "A residência no DF é requisito. Valparaíso pertence a GO e a mudança de estado cessa o requisito de residência.",
      source: "Inédita/Assistência Social",
      year: 2026,
      subject: "Assistência Social",
      topic: "Cartão Prato Cheio",
      courseId,
      lessonId,
      disciplineId
    }
  ];

  for (const q of questions) {
    await setDoc(doc(collection(db, 'questions')), q);
  }
  console.log('Added 4 questions for Cartão Prato Cheio');
  process.exit(0);
}

addQuestions().catch(console.error);
