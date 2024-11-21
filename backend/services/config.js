const { initializeApp } = require("firebase/app");
const admin = require("firebase-admin");
const { MongoClient } = require("mongodb");
const config = require("../config.json");
require("dotenv").config();

const BUCKET = "transport-app-36443.appspot.com";

async function initializeServices() {
  const client = new MongoClient(config.database);

  await client.connect();
  const db = client.db();
  const collection = db.collection("firebasekey");
  const firebaseKey = await collection.findOne();

  if (!firebaseKey) {
    throw new Error("Firebase key not found in database");
  }

  const firebaseConfig = {
    type: firebaseKey.type,
    projectId: firebaseKey.project_id,
    privateKeyId: firebaseKey.private_key_id,
    privateKey: firebaseKey.private_key.replace(/\\n/g, "\n"),
    clientEmail: firebaseKey.client_email,
    clientId: firebaseKey.client_id,
    authUri: firebaseKey.auth_uri,
    tokenUri: firebaseKey.token_uri,
    authProviderCertUrl: firebaseKey.auth_provider_x509_cert_url,
    clientCertUrl: firebaseKey.client_x509_cert_url,
  };

  const app = admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: "https://prd-transport-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: BUCKET,
  });

  const firestore = admin.firestore();
  const bucket = admin.storage().bucket();
  const realtimeDB = admin.database(); // Access Realtime Database here

  return { admin, app, firestore, bucket, realtimeDB, db };
}

initializeServices()
  .then((services) => {
    module.exports = services;
  })
  .catch((err) => {
    console.error("Failed to initialize services:", err);
    process.exit(1);
  });
