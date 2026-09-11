const fs = require('fs');
let content = fs.readFileSync('src/data/flashcardPacks.ts', 'utf-8');
content = content.replace(/"imageUrl": "\/prf-banner.png",\s+"cardsCount": 170/g, '"imageUrl": "/pacote_detran_sp.jpg",\n  "cardsCount": 170');
fs.writeFileSync('src/data/flashcardPacks.ts', content);
