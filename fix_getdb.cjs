const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');
content = content.replace('let backendUserReady = false;', 'export function getDb() { return db; }\nlet backendUserReady = false;');
fs.writeFileSync('server.ts', content);
