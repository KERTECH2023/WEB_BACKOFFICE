const { initializeApp } = require("firebase/app");
const admin = require("firebase-admin");
const firebaseServiceAccount = require("../firebase.json");
const { getAuth } = require("firebase-admin/auth");
const BUCKET = "transport-app-36443.appspot.com";
require("dotenv").config();
const config = {
  type: process.env.TYPE,
  projectId: process.env.PROJECT_ID,
  privateKeyId: process.env.PRIVATE_KEY_ID,
  privateKey: process.env.PRIVATE_KEY, // Replace literal \n with actual new lines
  clientEmail: process.env.CLIENT_EMAIL,
  clientId: process.env.CLIENT_ID,
  authUri: process.env.AUTH_URI,
  tokenUri: process.env.TOKEN_URI,
  authProviderCertUrl: process.env.AUTH_PROVIDER_X509_CERT_URL,
  clientCertUrl: process.env.CLIENT_X509_CERT_URL,
  universeDomain: process.env.UNIVERSE_DOMAIN,
};

const firestoreApp = admin.initializeApp(
  {
    credential: credential: admin.credential.cert(config),
    databaseURL: "https://transport-app-36443-default-rtdb.firebaseio.com",
  },
  "firestoreApp"
);
admin.initializeApp({
  credential: credential: admin.credential.cert(config),
  storageBucket: BUCKET,
});

const bucket = admin.storage().bucket();

const db = admin.firestore;
module.exports = {
  admin,
  firestoreApp,
  db,
  bucket,
};
