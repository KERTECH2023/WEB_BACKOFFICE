const admin = require("firebase-admin");
const { MongoClient } = require("mongodb");
const config = require("../config.json");
require("dotenv").config();

const BUCKET = process.env.FIREBASE_BUCKET || "prd-transport.appspot.com";


// Fonction pour récupérer la configuration Firebase depuis MongoDB
async function getFirebaseKey() {
  const client = new MongoClient(config.database, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(); 
    const collection = db.collection("firebasekey");

    const key = await collection.findOne();
    if (!key) {
        throw new Error("Firebase key not found in MongoDB");
    }

    return key;
} catch (error) {
    console.error("Error fetching Firebase key from MongoDB:", error);
    throw error;
} finally {
    await client.close();
}
}

// Fonction pour initialiser Firebase
async function initializeFirebase() {
  try {
    const firebaseKey = await getFirebaseKey();

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
        databaseURL: "https://prd-transport-default-rtdb.europe-west1.firebasedatabase.app",
      },
      "firestoreApp"
    );

    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      storageBucket: BUCKET,
    });

    const bucket = admin.storage().bucket();
    const db = admin.firestore();
    const realtimeDB = admin.database();

    console.log("Firebase initialized successfully");

    return { admin, firestoreApp, db, realtimeDB, bucket, tokenSecret }; // Inclure le tokenSecret dans la réponse
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
}

module.exports = initializeFirebase;
