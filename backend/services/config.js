const { initializeApp } = require("firebase/app");
const admin = require("firebase-admin");
const { MongoClient } = require("mongodb");
const config = require("../config.json");
require("dotenv").config();

const BUCKET = "transport-app-36443.appspot.com";
const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCyOYau+MN5LcmR
1YAzgxBXnydFd5zMHPMvsrSKtiBcYzjEjGpMMnQ6tgy+u4bsPaHaG5+ekYFf4rjO
2boTdNpCyBLeNLv5duciAteOg3v0a8/Op77MAqRVSa6Vb+iJWYS1Wblo1znsEZj2
reTl+lwvfSjQKZ+doR75thmvHJK1AH3I1YJem10U8q49pLz/EQ4iQIPHFeLuFdeX
lR0UKzXGZP8T4OHkfYy0cGbRKwyi3GRzt6w4rHjo3lpEkVE1n7vbb1LRtRNQBQSX
lH6BqOLEVIjWXc9OdNQ88QShF6Z31U9xLK9PYafQ8USsgE/ZayAA2KOt/fz6ddFH
yptgkPebAgMBAAECggEAIhMhjv580QRSD5HUSwT58Oa66WsvDU9Tp4DxR7v+f+tw
hROblynmUvtPgH/2EeDOuxag8/450A1W7CVwkBu9RxtdkCJg9hcnpbcJY3P8FQUv
3ADyV6sBpFTMDkIxIWF+H/YhnsvXhSzwI+mnY9j0GxhA31u16rtNYszQKEy8N+Kn
iElxbmolg6f3g32Vw5dXdSaaKuLH5H6a0B/Lid2xDVc3BzsZhNRx3Uacw4dhRjlP
ROefZcznr5EUOlUILYSWChHIkoGDxNkajt01sV7kIwx8Fi7ydCBhQZiKp88i2L4L
FHiVPwlueI+OA0yiATutwPXxB5katkoPIr2jn+S5gQKBgQD40y9V6sl4IasrviJy
QdqfQPhRMJ5FwvMC4ACyjjTubg+ivCHYyXu2mgONp1PgYT3WhybwB5vvD/JZsOiK
7jaZbsKdaj3+Bf+pMPm2E6kx1R31iedlgmmsJ3NiPtDM8yl/h98PdqVSni45p3md
8Ecoi9qq1pyx9Cg2jFj00Bh84QKBgQC3XSxetytCxflbm83Hd3BQJEtbn6RNDZUt
QAFcZFkvyZjl3/owNjjSg1lQw3AFXSX7Lzvb1KD0fMM56wmGcP4V011CiQ1JN51/
hf3HrqvaPz+/Ad5P6NWO7xWtKg4UPURk7J6zQ4jwRPxcUELmGBjp6yvHSQOsCxF3
qATJeFBn+wKBgEzDCeVdi03ORTo3a/UHr+RVbMXPU+R9oe6PIGf1SwsLVTOFCoQQ
lGPe253FszCTjzoxc6e1ETwNFVzqILNLjfiDnPJnJjzJqPePLloncpj3AEkRhBti
wirj+MqkSlIP6gt35S6mEZaNSgFrUy+QQsOVcZ4mmyyjAAzj+0V7NTLBAoGAEgvX
fBLm7RFy8zMoU4NLyHdp+0CA+RxnHCb6e09c/7kFlUov42LSwNUwiyRQ+BYs0MXb
TE1m8ej9hcu+Cj9AooFE4nF+n0Ab/hr/2RE11Kr46SGT8aVmr0SUi5BiBlfpTU2E
aPwylAMWGzfcL60bdpowmtJyzBHizDX7EqEGuNUCgYBhMxDksOwtLZ7B1F7q+m4f
x4W1En9wrUDMvjY52GrUI0H7pr727mhex8xsavPertSQWdUul4by201S1ywkObrc
nq5zO/9W0513M4ynXHYVfAuN3JEiXbgrdPKCJhEgj37HhRhM5p1iuGAbDIpwNQef
Gl9Irf85ziBE3cbrHwKBlQ==
-----END PRIVATE KEY-----`;


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
      privateKey,
      clientEmail: firebaseKey.client_email,
      clientId: firebaseKey.client_id,
      authUri: firebaseKey.auth_uri,
      tokenUri: firebaseKey.token_uri,
      authProviderCertUrl: firebaseKey.auth_provider_x509_cert_url,
      clientCertUrl: firebaseKey.client_x509_cert_url,
    };

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
    const firestore = admin.firestore();

    
 

    module.exports = {
      admin,
      firestoreApp,
      db,
      bucket,
    };
