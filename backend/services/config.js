
const admin = require("firebase-admin");
const { MongoClient } = require("mongodb");
const config = require("../config.json");

const BUCKET = "transport-app-36443.appspot.com";

async function initializeFirebase() {
  const client = new MongoClient(config.database);
  
  try {
    await client.connect();
    const db = client.db(); 
    const collection = db.collection("firebasekey");
    const firebaseKey = await collection.findOne();

    const firebaseConfig = {
      type: firebaseKey.type,
      projectId: firebaseKey.project_id,
      privateKeyId: firebaseKey.private_key_id,
      privateKey: firebaseKey.private_key.replace(/\\n/g, '\n'),
      clientEmail: firebaseKey.client_email,
      clientId: firebaseKey.client_id,
      authUri: firebaseKey.auth_uri,
      tokenUri: firebaseKey.token_uri,
      authProviderCertUrl: firebaseKey.auth_provider_x509_cert_url,
      clientCertUrl: firebaseKey.client_x509_cert_url,
    };

    const firestoreApp = admin.initializeApp(
      {
        credential: admin.credential.cert(firebaseConfig),
        databaseURL: `https://${firebaseKey.project_id}-default-rtdb.europe-west1.firebasedatabase.app`,
      },
      "firestoreApp"
    );

    const realtimeDB = firestoreApp.database();
    const bucket = firestoreApp.storage().bucket(BUCKET);
    const db = firestoreApp.firestore();

    return { 
      admin: firestoreApp, 
      firestoreApp, 
      db, 
      bucket,
      realtimeDB 
    };
  } finally {
    await client.close();
  }
}

module.exports = initializeFirebase();
