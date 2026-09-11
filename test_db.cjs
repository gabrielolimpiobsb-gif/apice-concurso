const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const firebaseConfig = require('./firebase-applet-config.json');
const app = admin.initializeApp({ projectId: firebaseConfig.projectId });
console.log(getFirestore.toString());
const db = getFirestore(firebaseConfig.firestoreDatabaseId); // or getFirestore(app, dbId)
db.collection('users').limit(1).get().then(console.log).catch(console.error);
