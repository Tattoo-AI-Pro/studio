
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// This is a server-side only file. 
// It is used by API routes and server components.

const firebaseConfig: FirebaseOptions = {
  "projectId": "studio-7677990074-c0d5a",
  "appId": "1:499828709736:web:0b496f8ce6c747b2e11edd",
  "apiKey": "AIzaSyC7p8i4AH1lUNxCNPZirkkjhzQR1Duf1f8",
  "authDomain": "studio-7677990074-c0d5a.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "499828709736"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const firestore: Firestore = getFirestore(app);

export function initializeFirebase() {
  return { firestore };
}
