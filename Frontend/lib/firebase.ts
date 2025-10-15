// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWIjyHNCVs0AWVA62Cdrk9-FiZSX20xwA",
  authDomain: "citysense-crono.firebaseapp.com",
  projectId: "citysense-crono",
  storageBucket: "citysense-crono.firebasestorage.app",
  messagingSenderId: "850336854481",
  appId: "1:850336854481:web:c42ccf51f5f7cd5d7370f0",
  measurementId: "G-QZ8SF5C5JX"
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Configure auth settings
if (typeof window !== 'undefined') {
  auth.useDeviceLanguage();
}

// Initialize Analytics only on client side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, analytics };
