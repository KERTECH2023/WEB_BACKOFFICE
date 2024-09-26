const { initializeApp } = require("firebase/app");
const admin = require("firebase-admin");
const firebaseServiceAccount = require("../firebase.json");
const { getAuth } = require("firebase-admin/auth");
const BUCKET = "transport-app-36443.appspot.com";

const firestoreApp = admin.initializeApp(
  {
    credential: admin.credential.cert(firebaseServiceAccount),
    databaseURL: "https://transport-app-36443-default-rtdb.firebaseio.com",
  },
  "firestoreApp"
);
admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
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
