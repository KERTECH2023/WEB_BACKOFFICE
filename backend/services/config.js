const admin = require("firebase-admin");
const { MongoClient } = require("mongodb");
const config = require("../config.json");
require("dotenv").config();

const BUCKET = "transport-app-36443.appspot.com";

async function getFirebaseKey() {
 const client = new MongoClient(config.database, { 
   useNewUrlParser: true, 
   useUnifiedTopology: true 
 });
 try {
   await client.connect();
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

   // Use a unique name for the first app initialization
   const firestoreApp = admin.initializeApp(
     {
       credential: admin.credential.cert(firebaseConfig),
       databaseURL: "https://transport-app-36443-default-rtdb.europe-west1.firebasedatabase.app",
     },
     "firestoreApp"
   );

   // Initialize Realtime Database
   const realtimeDB = firestoreApp.database(); 

   // Initialize storage and firestore
   const bucket = firestoreApp.storage().bucket();
   const db = firestoreApp.firestore();

   return { 
     admin: firestoreApp, 
     firestoreApp, 
     db, 
     bucket,
     realtimeDB 
   };
 } catch (error) {
   console.error("Firebase initialization error:", error);
   throw error;
 }
}

module.exports = initializeFirebase();
