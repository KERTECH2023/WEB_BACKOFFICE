const { initializeApp } = require("firebase/app");
const admin = require("firebase-admin");
const firebaseServiceAccount = require("../firebase.json");
const { getAuth } = require("firebase-admin/auth");
const BUCKET = "transport-app-36443.appspot.com";
require("dotenv").config();
const cer= "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCyOYau+MN5LcmR\n1YAzgxBXnydFd5zMHPMvsrSKtiBcYzjEjGpMMnQ6tgy+u4bsPaHaG5+ekYFf4rjO\n2boTdNpCyBLeNLv5duciAteOg3v0a8/Op77MAqRVSa6Vb+iJWYS1Wblo1znsEZj2\nreTl+lwvfSjQKZ+doR75thmvHJK1AH3I1YJem10U8q49pLz/EQ4iQIPHFeLuFdeX\nlR0UKzXGZP8T4OHkfYy0cGbRKwyi3GRzt6w4rHjo3lpEkVE1n7vbb1LRtRNQBQSX\nlH6BqOLEVIjWXc9OdNQ88QShF6Z31U9xLK9PYafQ8USsgE/ZayAA2KOt/fz6ddFH\nyptgkPebAgMBAAECggEAIhMhjv580QRSD5HUSwT58Oa66WsvDU9Tp4DxR7v+f+tw\nhROblynmUvtPgH/2EeDOuxag8/450A1W7CVwkBu9RxtdkCJg9hcnpbcJY3P8FQUv\n3ADyV6sBpFTMDkIxIWF+H/YhnsvXhSzwI+mnY9j0GxhA31u16rtNYszQKEy8N+Kn\niElxbmolg6f3g32Vw5dXdSaaKuLH5H6a0B/Lid2xDVc3BzsZhNRx3Uacw4dhRjlP\nROefZcznr5EUOlUILYSWChHIkoGDxNkajt01sV7kIwx8Fi7ydCBhQZiKp88i2L4L\nFHiVPwlueI+OA0yiATutwPXxB5katkoPIr2jn+S5gQKBgQD40y9V6sl4IasrviJy\nQdqfQPhRMJ5FwvMC4ACyjjTubg+ivCHYyXu2mgONp1PgYT3WhybwB5vvD/JZsOiK\n7jaZbsKdaj3+Bf+pMPm2E6kx1R31iedlgmmsJ3NiPtDM8yl/h98PdqVSni45p3md\n8Ecoi9qq1pyx9Cg2jFj00Bh84QKBgQC3XSxetytCxflbm83Hd3BQJEtbn6RNDZUt\nQAFcZFkvyZjl3/owNjjSg1lQw3AFXSX7Lzvb1KD0fMM56wmGcP4V011CiQ1JN51/\nhf3HrqvaPz+/Ad5P6NWO7xWtKg4UPURk7J6zQ4jwRPxcUULmGBjp6yvHSQOsCxF3\nqATJeFBn+wKBgEzDCeVdi03ORTo3a/UHr+RVbMXPU+R9oe6PIGf1SwsLVTOFCoQQ\nlGPe253FszCTjzoxc6e1ETwNFVzqILNLjfiDnPJnJjzJqPePLloncpj3AEkRhBti\nwirj+MqkSlIP6gt35S6mEZaNSgFrUy+QQsOVcZ4mmyyjAAzj+0V7NTLBAoGAEgvX\nfBLm7RFy8zMoU4NLyHdp+0CA+RxnHCb6e09c/7kFlUov42LSwNUwiyRQ+BYs0MXb\nTE1m8ej9hcu+Cj9AooFE4nF+n0Ab/hr/2RE11Kr46SGT8aVmr0SUi5BiBlfpTU2E\naPwylAMWGzfcL60bdpowmtJyzBHizDX7EqEGuNUCgYBhMxDksOwtLZ7B1F7q+m4f\nx4W1En9wrUDMvjY52GrUI0H7pr727mhex8xsavPertSQWdUul4by201S1ywkObrc\nnq5zO/9W0513M4ynXHYVfAuN3JEiXbgrdPKCJhEgj37HhRhM5p1iuGAbDIpwNQef\nGl9Irf85ziBE3cbrHwKBlQ==\n-----END PRIVATE KEY-----\n"
const config = {
  type: process.env.TYPE,
  projectId: process.env.PROJECT_ID,
  privateKeyId: process.env.PRIVATE_KEY_ID,
  privateKey: cer, // Replace literal \n with actual new lines
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
    credential:  admin.credential.cert(config),
    databaseURL: "https://transport-app-36443-default-rtdb.firebaseio.com",
  },
  "firestoreApp"
);
admin.initializeApp({
  credential: admin.credential.cert(config),
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
