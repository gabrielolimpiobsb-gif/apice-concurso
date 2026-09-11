const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const topImports = `
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, runTransaction, collection, getDocs, serverTimestamp, query, where } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-adcdca29-b4a0-4f4a-b4be-30a238c77fbd');

let backendUserReady = false;
signInWithEmailAndPassword(auth, 'backend@apice.com', 'SuperSecretPassword123').then(() => {
  console.log('[FIREBASE] Backend user authenticated.');
  backendUserReady = true;
}).catch(console.error);

function getDb() { return db; }
`;

content = content.replace('let dbInstance: any = null;', topImports + '\n// let dbInstance: any = null;');

const functionStart = content.indexOf('function getDb() {');
const functionEnd = content.indexOf('return dbInstance;\n}') + 'return dbInstance;\n}'.length;
if (functionStart !== -1 && functionEnd !== -1) {
  content = content.slice(0, functionStart) + content.slice(functionEnd);
}

// Ensure getDb is defined once
if (content.split('function getDb()').length > 2) {
  // It's already defined in topImports, so the original one should be removed. 
  // (We just removed it above, but let's be careful).
}

// Stripe webhook uses getFirestore() directly
content = content.replace(/const db = getFirestore\(\);/g, 'const db = getDb();');

// getBrazilTodayStr
content = content.replace(/setupAdminRoutes\(app, authenticate as any, db\);/g, 'setupAdminRoutes(app, authenticate as any, getDb);');

fs.writeFileSync('server.ts', content);
