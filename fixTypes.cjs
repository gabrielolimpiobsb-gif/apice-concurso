const fs = require('fs');
const file = 'server/adminRoutes.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /Object\.values\(historyMap\)\.sort\(\(a, b\) => b\.date\.localeCompare\(a\.date\)\)/,
  `Object.values(historyMap).sort((a: any, b: any) => b.date.localeCompare(a.date))`
);

fs.writeFileSync(file, code);
