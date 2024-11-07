import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCOLPeAJY2yo8-9QuT275KFsCGHEWEqVjs",
  projectId: "transport-app-36443",
  storageBucket: "transport-app-36443.appspot.com",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, uploadBytesResumable, getDownloadURL };
