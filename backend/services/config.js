const { initializeApp } = require("firebase/app");
const admin = require("firebase-admin");
const firebaseServiceAccount = require("../firebase.json");
const { getAuth } = require("firebase-admin/auth");
const BUCKET = "prd-transport.appspot.com";
require("dotenv").config();
const cr ="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDlIMV9CUL5VEoL\nkWiIS0cS80JucZ693pdpqRAqYG8Vpuc5IVkDnT2v2psYSk8xM9C2v9MhTPFXr9Bu\ncPMg6lW4MQ6j/0uNvL7TVG/t8i2HP5d2JTtGOV5J2/SFRHvz4EkP12rvmE+SQxTV\npLkAYmshyP/OASEiX8WjMZJ/EQALou8GmBdIVA2hYB4SIYFRH8np9zReguTfr9pc\nyiKBN0RV8mdD+LJgG7K6p+Sz9WU8L/p40QERAnPKDTbTagiwF2JDCHVE6lsMxJeK\nzHaSd+7GeYd4+x0Us0HNezZfd5fVokGHSGmnmAeQm0OTMEPeuCG+uJaZ9i0r9epX\nKDmu34ZLAgMBAAECggEAC5xahZiHjUzpJ6bpriZqZppvHluhmKuD7rXDfPJADs/T\nXcDD2vwH2TZxr4xscOjYRbp4v3I/tJrTLBWLLHrTdy79N/BC6t7KqLjZpywjhHwD\nd9gxJcDYd1OvE2XCBjyyVxwqbhPAzH+buavMOCnElgSyecTy4eQKhteHPeslnnE9\nscMfnSIRw568r5jGRxStknTJ5r/sn60512jVoa2xG/L7bXEEPK3RaGQxLPoN+s/z\nDZUokdTNdx+C1RvUnHxE9lhjyTIsWEon7B3Uef6iTePOMCUOWc2wxzdRAvqk6Llx\nbYoEGC4i54VR3t5IFOMG9E38nREZzXgALZRKE+dqoQKBgQDzPmUCsFZcyc5XVm+k\ntw5wq3lnz1Ha5aSEMqHJgvHzK8NhYZFoXw6SZu+djJTmyho/NAYD6RCzLW4oIXhe\n1hArrdSurhR3XwrAkCi4EFRnNQvUteMVw85mKffmAuxHNRiLs6FiCwdNgGN7qqAI\nnWeUPmJJXXtOigd9bQC6fKmDEQKBgQDxJN64YUjvEuLsZvFQAnHPGNiT7/Jqv9tF\nxgyERo1BASrU01ZupJ8yMdVLnJsVANonr8VZlP3BO/VRtiHwvudD8sGt9DBYgQ4T\n2voIrYd8bWvXnNc9Id5qQOnlk2DZgIU6QrKypgdueByKJhDQP3TLh4K1h0ZOv2Sf\n0sLtVgR7mwKBgQCodbHnJtDo+iqZehdf8BdkGJ3AM2jxPNGvbJF3yeRfERQDQVs+\n+XZSFlAkwNPu8lEzLIht9N/H99KuoF+I7p/MYFtHjvBFq+D6c9x/fW+2+pny+vUG\ngdFUGATDm4qf1jnlpsZB7HlmR2CeqRCkZr7xgDL5tHBNeHKvfupePS/4wQKBgAYa\ns9ShCdKbfMkVNgibdzwR2fGswks3fhp/D/QNQSgjGm12yBpW6ny/zDF0zmwysFMO\n3QUOg3nvxZ8C6EsK2hnbPFHl+49R/QQ9p9SuZ96ben5jxwMSJ2ozKHiaSXpYCYdX\nBuUE1O1T9wz8N7K92HwKeyGTQhFeQPLWx/5wDf7/AoGBAPMRi6UaAMNOskskyTng\n7K5lezTlx7f5d8w9tf+6GfKmqLA0EUONFJZRoRva9RzhiCdYTdjAgABMPpRxZyhZ\ne/irLL64qDxf9bQSZLfWXhv0uqsDeYcKu61lruKZ6fLF4uhpOoUmVFV/0DaEIqii\n4qZe2eNKkyJjcq5UC960+cPr\n-----END PRIVATE KEY-----"
const config = {
  type: process.env.TYPE,
  projectId: process.env.PROJECT_ID,
  privateKeyId: process.env.PRIVATE_KEY_ID,
  privateKey: cr, // Replace literal \n with actual new lines
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
    databaseURL: "https://prd-transport-default-rtdb.europe-west1.firebasedatabase.app",
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
