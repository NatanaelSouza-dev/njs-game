const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let db = null;

// Só inicializa se o usuário colocou o serviceAccountKey.json na pasta server/
const saPath = path.join(__dirname, 'serviceAccountKey.json');
if (fs.existsSync(saPath)) {
  const serviceAccount = require(saPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = admin.firestore();
  console.log('[🔥] Firebase Admin inicializado com sucesso.');
} else {
  console.warn('[!] serviceAccountKey.json ausente. O servidor rodará, mas NÃO salvará as moedas de vitória no banco!');
}

module.exports = { admin, db };
