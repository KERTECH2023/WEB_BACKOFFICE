const { MongoClient } = require("mongodb");
const admin = require("firebase-admin");
const config = require("../config.json"); // Importation de la configuration JSON

// Utilisation des valeurs depuis le fichier JSON
const mongoUri = config.database; // URL MongoDB
const tokenSecret = config.token_secret; // Secret des tokens
const databaseName = "PRD_TRANSPORT"; // Nom de la base de données MongoDB
const collectionName = "firebaseConfig"; // Nom de la collection Firebase
require('dotenv').config();

const BUCKET = "transport-app-36443.appspot.com"; // Nom du bucket Firebase

// Fonction pour récupérer la configuration Firebase depuis MongoDB
async function getFirebaseConfigFromMongo() {
  const client = new MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    const firebaseConfig = await collection.findOne();
    if (!firebaseConfig) {
      throw new Error("Firebase configuration not found in MongoDB");
    }

    return {
      type: firebaseConfig.type,
      projectId: firebaseConfig.project_id,
      privateKeyId: firebaseConfig.private_key_id,
      privateKey: firebaseConfig.private_key.replace(/\\n/g, "\n"),
      clientEmail: firebaseConfig.client_email,
      clientId: firebaseConfig.client_id,
      authUri: firebaseConfig.auth_uri,
      tokenUri: firebaseConfig.token_uri,
      authProviderCertUrl: firebaseConfig.auth_provider_x509_cert_url,
      clientCertUrl: firebaseConfig.client_x509_cert_url,
    };
  } catch (error) {
    console.error("Error fetching Firebase configuration from MongoDB:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Fonction pour initialiser Firebase
async function initializeFirebase() {
  try {
    const firebaseConfig = await getFirebaseConfigFromMongo();

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

    return { admin, firestoreApp, db,realtimeDB, bucket, tokenSecret }; // Inclure le tokenSecret dans la réponse
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
}

module.exports = initializeFirebase;
