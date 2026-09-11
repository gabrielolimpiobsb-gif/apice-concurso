const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const firebaseConfig = require('./firebase-applet-config.json');
admin.initializeApp({ projectId: firebaseConfig.projectId });
const db = getFirestore();
db.collection('users').get().then((snap) => console.log('users count:', snap.size)).catch(console.error);
