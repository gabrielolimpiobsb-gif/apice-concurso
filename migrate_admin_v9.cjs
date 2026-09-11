const fs = require('fs');
let content = fs.readFileSync('server/adminRoutes.ts', 'utf-8');

// 1. Add V9 imports
const v9Imports = `
import { doc, getDoc, collection, getDocs, updateDoc, setDoc, query, where, limit } from 'firebase/firestore';
`;
content = v9Imports + content;

// 2. Replacements
content = content.replace(/db\.collection\("users"\)\.doc\(user\.uid\)\.get\(\)/g, 'getDoc(doc(db, "users", user.uid))');
content = content.replace(/!userDoc\.exists/g, '!userDoc.exists()');
content = content.replace(/userDoc\.data\(\)/g, 'userDoc.data()');

content = content.replace(/db\.collection\('users'\)\.get\(\)/g, 'getDocs(collection(db, "users"))');
content = content.replace(/usersSnap\.size/g, 'usersSnap.size');

content = content.replace(/db\.collection\('users'\)\.limit\(500\)\.get\(\)/g, 'getDocs(query(collection(db, "users"), limit(500)))');

content = content.replace(/db\.collection\('users'\)\.where\('planStatus', '==', 'premium'\)\.get\(\)/g, 'getDocs(query(collection(db, "users"), where("planStatus", "==", "premium")))');

content = content.replace(/db\.collection\('users'\)\.doc\(uid\)\.update\(\{ role: newRole \}\)/g, 'updateDoc(doc(db, "users", uid), { role: newRole })');

content = content.replace(/db\.collection\('users'\)\.doc\(req\.params\.uid\)\.set\(/g, 'setDoc(doc(db, "users", req.params.uid), ');

fs.writeFileSync('server/adminRoutes.ts', content);
