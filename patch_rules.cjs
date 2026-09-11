const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf-8');

if (!content.includes('function isBackend()')) {
  content = content.replace(
    '      function isAdmin() {',
    `      function isBackend() { return isSignedIn() && request.auth.token.email == 'backend@apice.com'; }
      function isAdmin() {`
  );
}

content = content.replace(
  'allow read: if isOwner(userId) || isAdmin();',
  'allow read: if isOwner(userId) || isAdmin() || isBackend();'
);

content = content.replace(
  `allow update: if (isOwner(userId) && (!incoming().diff(existing()).affectedKeys().hasAny(['planStatus', 'subscription', 'ownedPacks', 'role', 'dailyQuestionsCount']))) || isAdmin() || incoming().webhookSecret == 'YOUR_SUPER_SECRET_KEY';`,
  `allow update: if (isOwner(userId) && (!incoming().diff(existing()).affectedKeys().hasAny(['planStatus', 'subscription', 'ownedPacks', 'role', 'dailyQuestionsCount']))) || isAdmin() || isBackend();`
);

content = content.replace(
  `          allow read, write: if isOwner(userId) || isAdmin();`,
  `          allow read, write: if isOwner(userId) || isAdmin() || isBackend();`
);

fs.writeFileSync('firestore.rules', content);
