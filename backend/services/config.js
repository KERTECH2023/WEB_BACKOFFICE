const admin = require("firebase-admin");
const { MongoClient } = require("mongodb");
const config = require("../config.json");
require("dotenv").config();

// Constants and environment variables
const BUCKET = process.env.FIREBASE_BUCKET || "prd-transport.appspot.com";
const MONGODB_URI = process.env.MONGODB_URI || config.database;
const REALTIME_DB_URL = process.env.FIREBASE_DB_URL || "https://prd-transport-default-rtdb.europe-west1.firebasedatabase.app";
const TOKEN_SECRET = process.env.TOKEN_SECRET || "your-default-secret-key";

// MongoDB connection options
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000
};

/**
 * Récupère la clé Firebase depuis MongoDB
 * @returns {Promise<Object>} Firebase credentials
 */
async function getFirebaseKey() {
    const client = new MongoClient(MONGODB_URI, mongoOptions);
    
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        
        const db = client.db();
        const collection = db.collection("firebasekey");
        const key = await collection.findOne({});
        
        if (!key) {
            throw new Error("Firebase key not found in MongoDB");
        }
        
        return key;
    } catch (error) {
        console.error("Error fetching Firebase key from MongoDB:", error);
        throw error;
    } finally {
        try {
            await client.close();
            console.log("MongoDB connection closed");
        } catch (error) {
            console.error("Error closing MongoDB connection:", error);
        }
    }
}

/**
 * Formate la configuration Firebase
 * @param {Object} firebaseKey - Les credentials Firebase bruts
 * @returns {Object} Configuration Firebase formatée
 */
function formatFirebaseConfig(firebaseKey) {
    return {
        type: firebaseKey.type,
        projectId: firebaseKey.project_id,
        privateKeyId: firebaseKey.private_key_id,
        privateKey: firebaseKey.private_key.replace(/\\n/g, '\n'),
        clientEmail: firebaseKey.client_email,
        clientId: firebaseKey.client_id,
        authUri: firebaseKey.auth_uri,
        tokenUri: firebaseKey.token_uri,
        authProviderCertUrl: firebaseKey.auth_provider_x509_cert_url,
        clientCertUrl: firebaseKey.client_x509_cert_url
    };
}

/**
 * Initialise Firebase avec tous les services nécessaires
 * @returns {Promise<Object>} Les instances Firebase initialisées
 */
async function initializeFirebase() {
    try {
        // Récupération et vérification des credentials Firebase
        const firebaseKey = await getFirebaseKey();
        const firebaseConfig = formatFirebaseConfig(firebaseKey);

        // Initialisation de l'application Firebase principale
        const app = admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
            databaseURL: REALTIME_DB_URL,
            storageBucket: BUCKET
        });

        // Initialisation des services
        const bucket = admin.storage().bucket();
        const db = admin.firestore();
        const realtimeDB = admin.database();
        const auth = admin.auth();

        console.log("Firebase initialized successfully");

        return {
            app,
            admin,
            db,
            realtimeDB,
            bucket,
            auth,
            tokenSecret: TOKEN_SECRET
        };
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        throw new Error(`Firebase initialization failed: ${error.message}`);
    }
}

/**
 * Vérifie l'état de la connexion Firebase
 * @returns {boolean} État de la connexion
 */
function checkFirebaseConnection() {
    try {
        const apps = admin.apps;
        return apps.length > 0 && apps[0] !== null;
    } catch (error) {
        console.error("Error checking Firebase connection:", error);
        return false;
    }
}

// Export des fonctionnalités
module.exports = {
    initializeFirebase,
    checkFirebaseConnection,
    getFirebaseKey
};
