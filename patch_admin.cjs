const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');
content = content.replace(/if \(\!admin\.apps\.length\) \{[\s\S]*?\}/g, '');
fs.writeFileSync('server.ts', content);
