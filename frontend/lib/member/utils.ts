import crypto from "crypto";
import QRCode from "qrcode";
import { v5 as uuidv5 } from "uuid";

// Standard DNS Namespace UUID for UUID v5 generation
const NAMESPACE_UUID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

/**
 * Generates a deterministic UUID v5 from a given Firebase UID.
 * This keeps IDs in Firestore standard UUIDs for compatibility with the FastAPI backend.
 */
export function getUuidFromFirebaseUid(firebaseUid: string): string {
  return uuidv5(firebaseUid, NAMESPACE_UUID);
}

/**
 * Generates a random NeoID in the format: NEO-XXXX-XXXX-XXXX-XXXX
 */
export function generateNeoId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const genGroup = () => {
    let group = "";
    for (let i = 0; i < 4; i++) {
      group += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return group;
  };
  return `NEO-${genGroup()}-${genGroup()}-${genGroup()}-${genGroup()}`;
}

/**
 * Checks if a NeoID is unique in Firestore
 */
export async function isNeoIdUnique(db: any, neoId: string): Promise<boolean> {
  const snapshot = await db.collection("users").where("neoId", "==", neoId).limit(1).get();
  return snapshot.empty;
}

/**
 * Creates the signed payload for the QR code
 */
export function getQRPayloadWithSignature(neoId: string, uid: string): any {
  const payload = {
    neoId,
    uid,
    version: "1",
    issuer: "NeoFace Labs"
  };
  const payloadStr = JSON.stringify(payload);
  const secret = process.env.JWT_SECRET || "change-this-to-a-secure-random-64-char-secret-before-deploying";
  const sig = crypto.createHmac("sha256", secret).update(payloadStr).digest("hex");
  return { ...payload, sig };
}

/**
 * Generates a base64 Data URL PNG QR code for the signed payload
 */
export async function generateQRCode(neoId: string, uid: string): Promise<string> {
  const payload = getQRPayloadWithSignature(neoId, uid);
  const payloadStr = JSON.stringify(payload);
  
  const qrDataUrl = await QRCode.toDataURL(payloadStr, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 600,
    color: {
      dark: "#000000",
      light: "#FFFFFF"
    }
  });
  
  return qrDataUrl;
}
