import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let functionsInstance: Functions | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (appInstance) return appInstance;
  if (!getApps().length) {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
    appInstance = initializeApp(config);
  } else {
    appInstance = getApps()[0]!;
  }
  return appInstance;
}

export function getDb(): Firestore {
  if (dbInstance) return dbInstance;
  dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
}

export function getAuthInstance(): Auth {
  if (authInstance) return authInstance;
  authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

export function getFunctionsInstance(): Functions {
  if (functionsInstance) return functionsInstance;
  const region = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || "us-central1";
  functionsInstance = getFunctions(getFirebaseApp(), region);
  return functionsInstance;
}

export async function ensureAnonymousAuth(): Promise<string> {
  const auth = getAuthInstance();
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          const cred = await signInAnonymously(auth);
          resolve(cred.user.uid);
        } else {
          resolve(user.uid);
        }
      } catch (err) {
        reject(err);
      } finally {
        unsub();
      }
    });
  });
}
