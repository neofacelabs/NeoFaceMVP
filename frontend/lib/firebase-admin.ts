import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  try {
    const credsEnv = process.env.FIREBASE_CREDENTIALS_JSON;
    if (!credsEnv) {
      throw new Error("FIREBASE_CREDENTIALS_JSON environment variable is missing");
    }

    const cleanJson = credsEnv.trim().replace(/^'|'$/g, "").replace(/\\\\n\\",/g, '\\\\n",');
    const certInfo = JSON.parse(cleanJson);
    
    if (certInfo.private_key) {
      certInfo.private_key = certInfo.private_key.replace(/\\n/g, "\n");
    }

    initializeApp({
      credential: cert(certInfo),
    });
  } catch (err) {
    console.error("Error initializing Firebase Admin SDK:", err);
    // Graceful fallback to default initialization
    initializeApp();
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
