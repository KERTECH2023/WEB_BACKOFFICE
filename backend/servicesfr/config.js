const { initializeApp } = require("firebase/app");
const admin = require("firebase-admin");
const firebaseServiceAccount = require("../firebase.json");
const { getAuth } = require("firebase-admin/auth");

require("dotenv").config();
const cr ="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCXGyTr9fSiVzdK\n3av0eHxaj8fygY/24UfoSdZYSEhoJM1RwNsjyop1OtXucQ7zTVsoobX/oCgMqBpD\nckyEBvmYvkvNGNsXUDE2MhYj/w7IawLFXDgeUfGyYDVsUVON2/RihX90KFTefMNF\nzq68O1X1Q9A9wzdQ7PaJiiUZRVVTK5P4K6ciF0cakvn97vj53bTOeARxDGKRb2IJ\nsYajAEAH4wBPOiaYVeU24yWQWDBo4wWou0AYkmdWWl/JDxurO42HT9u178yfQbKp\nFtYWdLN5DQz50PDaNqZy9piGdVQF0hXGCwdOGeuGHpoIfc4GU6BlqbcSKu5Zihnt\nUbG+atpTAgMBAAECggEAEhJ4MSkVTUCNcjdJOcUak6w5l4/rsMpofWgt/24EYZbx\nNX4Rgi+BrXFQJSNBd1OWUP7nk6n10ERfVmy6U69lNQxMEudjoLSscL+/H9FWqnKz\nU05rFHlBenorjt0P11oUrvR/dgbdgPnpUuqGwdLTk4YSRv4XmhFVOnBFbUclDtFq\nzB3r1WFu1K0KSTULaz9T7b3LMu1Jx9uFlfQQZ+6v+zLOYyk1Mtp56/RMQOyoVXgQ\nXREjsQphqSfYLef0MiSU7APF82q128NvSJ5HI3q8s1VMzueRreKC9f9RRS0FpyQ9\ncl0G0h57ueQdh4bQbwcr1HFbPgICPJeZzcB82A8i5QKBgQDSHFByQS8oc2jxB57Z\nkl7Gs7lHy3WN6A0/EZORaS0XgpAs2uks0yyjMVQAclE7ahVIv6fC+dxNwooFAFpH\nWJB28oQ/hiaHJ73t7Nt53kL79dIkSIDUx+Hqy+R8LYHkjo6S4kahcOJijmTICPzl\nKrG8D5uleuqAziHbgAxYoddW1QKBgQC4G8WFfz967qbcKPFN9qUhxXzpRT2UHSk8\n8jeE/jG5hvJ6xU/N8WT1RttoCCRX3E5xYNknW6SWUt+UdGIKxUVloiAcIloaB2tI\nRkaXsnat8jjXXWletjoenT9Cx0e0osmfxlRyhVVZMdLTHWHfUhsLxpIHObmaHLsY\nuCyTx5PQhwKBgQCRfnXeiHDla/WxYnuHYiorIm0c4DEJETWLBNrRCKnm68x2oyhw\nl9MDNrdaj87ce7s9YyoChA8f8aStje72FMgE9i7J5lVrpgOJbEkW/OgZncHkyigc\nMEWq14Hi04htAqKL6BDM3mSFpuD2+/JTptroxU4cqx8UDqm3W9Yw0fFR+QKBgCRg\ncF2ZL9zFTLjRaiRCaIxMrgqVQL6EKIK/RRME+qQysrRpSgRh/tWrw2xBt5SYlfM2\n9JEfPVzqUPzPJhQEuFqFdxy3+N+NubfVEtukSmjCJFMBRPGOxdsIrNgv8c4SIA5u\nrH7YM23lN0e5VX4/hdKE0JOW50I5DQqsUTp9w4n/AoGBAKO1rJ1FENlSBaiyZmtb\ngOhorbsYE1bcLfsLYsqZN+a5O2EZjRTjmo1DkSrcciZxxyHdEfpZrrOOqmrNFY6O\nTEAQaX1t3HuCJoEvFMaqaP90BIHQCtoP0brr6u76ASn9O0YgzdWTppjMQN0ngNtW\nRoAlh1xbgFzIki5YdVIXuPoz\n-----END PRIVATE KEY-----\n"
const config = {
  type: process.env.TYPEfr,
  projectId: process.env.PROJECT_IDfr,
  privateKeyId: process.env.PRIVATE_KEY_IDfr,
  privateKey: cr, // Replace literal \n with actual new lines
  clientEmail: process.env.CLIENT_EMAILfr,
  clientId: process.env.CLIENT_IDfr,
  authUri: process.env.AUTH_URIfr,
  tokenUri: process.env.TOKEN_URIfr,
  authProviderCertUrl: process.env.AUTH_PROVIDER_X509_CERT_URLfr,
  clientCertUrl: process.env.CLIENT_X509_CERT_URLfr,
  universeDomain: process.env.UNIVERSE_DOMAINfr,
};
const firestoreApp = admin.initializeApp(
  {
    credential:  admin.credential.cert(config),
    databaseURL: "https://inchalha-vtc-default-rtdb.europe-west1.firebasedatabase.app",
  },
  "firestoreAppfr"
);
const adminAppfr = admin.initializeApp(
  {
    credential: admin.credential.cert(config),
  },
  "adminAppfr"
);



const db = adminAppfr.firestore();
module.exports = {
  adminAppfr,
  firestoreApp,
  db,

};
