const { MongoClient } = require("mongodb");
const admin = require("firebase-admin");
const config = require("../config.json");  // Assuming config contains the Firebase project credentials

// Firebase storage bucket from environment variable
const BUCKET = process.env.FIREBASE_BUCKET || "prd-transport.appspot.com";

// Function to retrieve Firebase key from MongoDB
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

// Firebase configuration (use MongoDB fetched data here if needed)
const firebaseKey = getFirebaseKey(); // Assuming you might want to fetch the key dynamically

const firebaseConfig = {

    type: firebaseKey.type,
    projectId: firebaseKey.project_id,
    privateKeyId: firebaseKey.private_key_id,
    privateKey: firebaseKey.private_key.replace(/\\n/g, "\n"), // Handle line breaks
    clientEmail: firebaseKey.client_email,
    clientId: firebaseKey.client_id,
    authUri: firebaseKey.auth_uri,
    tokenUri: firebaseKey.token_uri,
    authProviderCertUrl: firebaseKey.auth_provider_x509_cert_url,
    clientCertUrl: firebaseKey.client_x509_cert_url,
 
};

// Initialize Firebase for Firestore and Storage
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

// Access the Firestore and Storage instances
const bucket = admin.storage().bucket();
const db = admin.firestore();

module.exports = {
  admin,
  firestoreApp,
  db,
  bucket,
};
