const { initializeApp } = require("firebase/app");
const admin = require("firebase-admin");
const { MongoClient } = require("mongodb");
const config = require("../config.json");
require("dotenv").config();

const BUCKET = "prd-transport.appspot.com";
const DATABASE_URL = "https://prd-transport-default-rtdb.firebaseio.com";

// Fonction pour récupérer la clé Firebase depuis MongoDB
async function getFirebaseKeyFromMongoDB() {
    const databaseUri = config.database;
    if (!databaseUri) {
        throw new Error("MongoDB connection URI is not defined in config.js");
    }

    const client = new MongoClient(databaseUri, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    });

    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(); 
        const collection = db.collection("firebasekey");

        const firebaseKey = await collection.findOne({});
        if (!firebaseKey) {
            throw new Error("Firebase key not found in MongoDB");
        }

        return firebaseKey;
    } catch (error) {
        console.error("Error fetching Firebase key from MongoDB:", error);
        throw error;
    } finally {
        await client.close();
    }
}

// Fonction d'initialisation de Firebase Admin
async function initFirebaseAdmin() {
    try {
        // Récupérer la clé Firebase depuis MongoDB
        const firebaseKey = await getFirebaseKeyFromMongoDB();

        // Configuration Firebase
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

        // Première initialisation pour Firestore
        const firestoreApp = admin.initializeApp(
            {
                credential: admin.credential.cert(firebaseConfig),
                databaseURL: DATABASE_URL,
            },
            "firestoreApp"
        );

        // Deuxième initialisation pour Storage
        admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
            storageBucket: BUCKET,
        }, "storageApp");

        // Récupérer les instances
        const bucket = admin.storage().bucket();
        const db = admin.firestore;

        console.log("Firebase Admin initialized successfully from MongoDB key");

        return {
            admin,
            firestoreApp,
            db,
            bucket,
        };
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
        throw error;
    }
}

// Exporter la fonction d'initialisation
module.exports = initFirebaseAdmin;

// Pour une initialisation immédiate, décommentez la ligne suivante :
// module.exports = initFirebaseAdmin();
