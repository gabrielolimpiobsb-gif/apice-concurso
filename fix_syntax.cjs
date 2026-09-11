const fs = require('fs');
let content = fs.readFileSync('src/data/flashcardPacks.ts', 'utf-8');
content = content.replace(/\]\s*\}\s*\]\s*\]\s*;\s*\{/, ']},{');
content = content.replace(/\]\s*\}\s*\]\s*;\s*\{/, ']},{');
fs.writeFileSync('src/data/flashcardPacks.ts', content);
