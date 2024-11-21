const admin = require("firebase-admin");
const { MongoClient } = require("mongodb");
const config = require("../config.json");
require("dotenv").config();

const BUCKET = "prd-transport.appspot.com";

// Fonction pour récupérer la clé Firebase depuis MongoDB
async function getFirebaseKey() {
    const client = new MongoClient(config.database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
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

// Fonction pour initialiser Firebase avec la clé récupérée
async function initializeFirebase() {
    try {
        const firebaseKey = await getFirebaseKey();
        
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
        
        // Vérifier que toutes les clés requises sont présentes
        const requiredKeys = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id'];
        for (const key of requiredKeys) {
            if (!firebaseKey[key]) {
                throw new Error(`Missing required Firebase configuration key: ${key}`);
            }
        }
        
        // Initialisation de Firebase Admin pour Firestore et Storage
        const firestoreApp = admin.initializeApp(
            {
                credential: admin.credential.cert(firebaseConfig),
                databaseURL: `https://${firebaseKey.project_id}-default-rtdb.firebaseio.com`,
            },
            "firestoreApp"
        );
        
        const storageApp = admin.initializeApp(
            {
                credential: admin.credential.cert(firebaseConfig),
                storageBucket: BUCKET,
            },
            "storageApp"
        );
        
        const bucket = admin.storage().bucket(BUCKET);
        const db = admin.firestore();
        
        console.log("Firebase Admin SDK initialized successfully.");
        
        return { 
            admin, 
            firestoreApp, 
            storageApp,
            db, 
            bucket 
        };
    } catch (error) {
        console.error("Error initializing Firebase Admin SDK:", error);
        throw error; // Permettre à l'appelant de gérer l'erreur plutôt que de forcer l'arrêt
    }
}

// Exporter la fonction et les objets
module.exports = initializeFirebase;
