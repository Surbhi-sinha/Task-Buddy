// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore';
import {getAuth , GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArJeGqn-zHFuK6vqnm8U7bXRbuiD4fHkQ",
  authDomain: "taskbuddy-fa68a.firebaseapp.com",
  projectId: "taskbuddy-fa68a",
  storageBucket: "taskbuddy-fa68a.firebasestorage.app",
  messagingSenderId: "354746743168",
  appId: "1:354746743168:web:306a3964cca92968186965",
  measurementId: "G-NPX7EBMKDM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();