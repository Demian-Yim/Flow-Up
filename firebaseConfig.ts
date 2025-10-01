// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Specify Firestore type for db
let db: firebase.firestore.Firestore;

try {
    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();

    // --- Optional: Use this for local development with Firebase Emulator ---
    // Make sure you have the Firebase Emulator Suite running.
    // if (window.location.hostname === "localhost") {
    //   console.log("Connecting to Firestore Emulator");
    //   db.useEmulator('localhost', 8080);
    // }
    // --------------------------------------------------------------------

} catch (error) {
    console.error("Firebase initialization failed:", error);
    // Handle the error appropriately, maybe show a message to the user
    // that the application cannot connect to the database.
    db = null as any;
}


export { db };