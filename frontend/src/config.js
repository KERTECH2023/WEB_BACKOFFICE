import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDgBbTBbjIo8hVD128y5TG9FswyZVO8XGE",
    authDomain: "prd-transport.firebaseapp.com",
    databaseURL: "https://prd-transport-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "prd-transport",
    storageBucket: "prd-transport.appspot.com",
    messagingSenderId: "824880668007",
    appId: "1:824880668007:web:51fd327f9a2da5e4c0a3c2",
    measurementId: "G-H6XHHDMSSH"
  };

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, uploadBytesResumable, getDownloadURL };
