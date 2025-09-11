// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // Corrected: Use process.env instead of import.meta.env
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  // Corrected: Use process.env instead of import.meta.env
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  // Corrected: Use process.env instead of import.meta.env
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  // Corrected: Use process.env instead of import.meta.env
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  // Corrected: Use process.env instead of import.meta.env
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  // Corrected: Use process.env instead of import.meta.env
  appId: process.env.VITE_FIREBASE_APP_ID
};

let db: any;

try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);

    // --- Optional: Use this for local development with Firebase Emulator ---
    // Make sure you have the Firebase Emulator Suite running.
    // if (window.location.hostname === "localhost") {
    //   console.log("Connecting to Firestore Emulator");
    //   connectFirestoreEmulator(db, 'localhost', 8080);
    // }
    // --------------------------------------------------------------------

} catch (error) {
    console.error("Firebase initialization failed:", error);
    // Handle the error appropriately, maybe show a message to the user
    // that the application cannot connect to the database.
    db = null as any;
}


export { db };