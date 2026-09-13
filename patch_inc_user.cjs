const fs = require('fs');
let code = fs.readFileSync('src/services/firebaseStorageService.ts', 'utf8');

const regex = /const todayStr = getBrazilTodayStr\(\);[\s\S]*?else \{[\s\S]*?await updateDoc\(docRef, \{ dailyQuestionsCount: increment\(1\) \}\);[\s\S]*?\}/g;
const newCode = `await updateDoc(docRef, { dailyQuestionsCount: increment(1) });`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/services/firebaseStorageService.ts', code);
