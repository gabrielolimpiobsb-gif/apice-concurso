const fs = require('fs');
let code = fs.readFileSync('src/services/firebaseStorageService.ts', 'utf8');

const regex = /incrementDailyQuestions: async \(\) => \{\s*if \(\!auth\.currentUser\) return;/g;
const newCode = `incrementDailyQuestions: async () => {
    if (!auth.currentUser) {
      try {
        let count = parseInt(localStorage.getItem('apses_anon_questions') || '0', 10);
        localStorage.setItem('apses_anon_questions', (count + 1).toString());
        // dispatch event so hook updates
        window.dispatchEvent(new Event('apses:anon-updated'));
      } catch(e) {}
      return;
    }`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/services/firebaseStorageService.ts', code);
