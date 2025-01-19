import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Import the functions you need from the SDKs you need

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdKxu1np5MS85XKuSQbiyd0HyoENyWOVs",
  authDomain: "drag-app-a4294.firebaseapp.com",
  projectId: "drag-app-a4294",
  storageBucket: "drag-app-a4294.firebasestorage.app",
  messagingSenderId: "992415125308",
  appId: "1:992415125308:web:9e784d17505e68f5841839"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
