// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyAFygfe4erdQWHiECNEpixJS8atNf2D1wk",
  authDomain: "native-f303b.firebaseapp.com",
  projectId: "native-f303b",
  storageBucket: "native-f303b.appspot.com",
  messagingSenderId: "134804327506",
  appId: "1:134804327506:web:b1536d44e12bdf6eec638b",
  measurementId: "G-J2EXMM97FW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication, Firestore, and Storage
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app); // Initialize and export Firebase Storage
