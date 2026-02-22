import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import * as firestore from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAzpnTVb-AbFhTuuJU13lLU29Do1bHNFNE",
  authDomain: "pitugym-2d8a0.firebaseapp.com",
  projectId: "pitugym-2d8a0",
  storageBucket: "pitugym-2d8a0.firebasestorage.app",
  messagingSenderId: "526652949432",
  appId: "1:526652949432:web:6326f832672b828369854d",
  measurementId: "G-TDCFZCTFGM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = firestore.getFirestore(app);
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Firebase Analytics not initialized:", e);
  }
}

const { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, getDocs, getDoc, where, limit } = firestore;

export { 
  auth, 
  db,
  messaging,
  getToken,
  onMessage,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocs,
  getDoc,
  where,
  limit
};
export type { User };