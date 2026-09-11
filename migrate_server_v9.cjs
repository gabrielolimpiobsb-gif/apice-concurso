const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// 1. Remove firebase-admin
content = content.replace(/import admin from "firebase-admin";\n/g, '');
content = content.replace(/import \{ getFirestore, FieldValue \} from "firebase-admin\/firestore";\n/g, '');
content = content.replace(/const firebaseConfig = require\('\.\.\/firebase-applet-config\.json'\);\n/g, '');
content = content.replace(/import firebaseConfig from '\.\/firebase-applet-config\.json';\n/g, '');

// 2. Add V9 imports
const v9Imports = `
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, runTransaction, collection, getDocs, serverTimestamp, query, where } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

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

content = content.replace(/admin\.initializeApp\(\{[\s\S]*?\}\);\n/g, '');
content = content.replace(/let dbInstance: any = null;\nfunction getDb\(\) \{[\s\S]*?\n\}\n/g, v9Imports);

// 3. Replace FieldValue.serverTimestamp() -> serverTimestamp()
content = content.replace(/FieldValue\.serverTimestamp\(\)/g, 'serverTimestamp()');

// 4. Replace db.doc(X).get() -> getDoc(doc(db, X))
content = content.replace(/await db\.doc\(\`users\/\$\{user\.uid\}\`\)\.get\(\)/g, 'await getDoc(doc(db, `users/${user.uid}`))');
content = content.replace(/const userRef = db\.doc\(\`users\/\$\{user\.uid\}\`\);/g, 'const userRef = doc(db, `users/${user.uid}`);');
content = content.replace(/await withFirestoreTimeout\(userRef\.get\(\), 4000, null\)/g, 'await withFirestoreTimeout(getDoc(userRef), 4000, null)');

// 5. Replace userDoc.data() -> userDoc.exists() ? userDoc.data() : null
// (Actually v9 getDoc snap has exists() and data())
content = content.replace(/!snap\.exists/g, '!snap.exists()');
content = content.replace(/!doc\.exists/g, '!doc.exists()');

// 6. Replace userRef.set(..., { merge: true }) -> setDoc(userRef, ..., { merge: true })
content = content.replace(/userRef\.set\(([\s\S]*?), \{ merge: true \}\)/g, 'setDoc(userRef, $1, { merge: true })');

// 7. Replace db.doc(X).set(..., { merge: true })
content = content.replace(/await db\.doc\(\`users\/\$\{userId\}\`\)\.set\(\{([\s\S]*?)\}, \{ merge: true \}\);/g, 'await setDoc(doc(db, `users/${userId}`), {$1}, { merge: true });');

// 8. Replace db.runTransaction(async (t: any) => ...) -> runTransaction(db, async (t: any) => ...)
content = content.replace(/await db\.runTransaction\(/g, 'await runTransaction(db, ');

// 9. Inside transactions: t.get(userRef) -> t.get(userRef) (works in V9)
// t.set(userRef, ...) -> t.set(userRef, ...) (works in V9)
// t.update(userRef, ...) -> t.update(userRef, ...) (works in V9)

// 10. Replace setupAdminRoutes getDb signature usage (if any, we'll rewrite setupAdminRoutes too)
content = content.replace(/setupAdminRoutes\(app, authenticate as any, getDb\);/g, 'setupAdminRoutes(app, authenticate as any, db);');

fs.writeFileSync('server.ts', content);
