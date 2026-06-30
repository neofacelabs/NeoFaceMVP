import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { authenticateRequest } from "@/lib/member/auth";
import { generateNeoId, isNeoIdUnique, generateQRCode } from "@/lib/member/utils";

export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userDocRef = adminDb.collection("users").doc(auth.uuid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      // 1. Generate unique NeoID
      let neoId = generateNeoId();
      let unique = await isNeoIdUnique(adminDb, neoId);
      let attempts = 0;
      while (!unique && attempts < 10) {
        neoId = generateNeoId();
        unique = await isNeoIdUnique(adminDb, neoId);
        attempts++;
      }

      // 2. Generate permanent QR code (containing signed JSON payload)
      // If we don't have the firebase uid in auth (because backend token was used somehow),
      // we fallback to the uuid. But in create, it will always be a Firebase ID token with uid.
      const firebaseUid = auth.uid || auth.uuid;
      const qrCodeDataUrl = await generateQRCode(neoId, firebaseUid);

      // 3. Fetch photoURL from Firebase Auth if not passed or parse picture
      let photoURL = "";
      let name = auth.email.split("@")[0];
      try {
        if (auth.uid) {
          const userRecord = await adminAuth.getUser(auth.uid);
          photoURL = userRecord.photoURL || "";
          name = userRecord.displayName || name;
        }
      } catch (err) {
        console.error("Failed to fetch Firebase user photoURL:", err);
      }

      const now = new Date().toISOString();
      const profileData = {
        uid: firebaseUid,
        neoId,
        qrCode: qrCodeDataUrl,
        name,
        email: auth.email.toLowerCase(),
        photoURL,
        role: "MEMBER",
        status: "ACTIVE",
        phone: "",
        createdAt: now,
        lastLogin: now,
        biometricEnrolled: false,
        faceEnrolled: false,
        fingerprintEnrolled: false,
        membershipTier: "FREE",
        authMethods: ["google"],
        verificationLevel: "VERIFIED"
      };

      // Store in Firestore under the deterministic UUID
      await userDocRef.set(profileData);
      
      // Also update is_active, is_enrolled for compatibility with other endpoints
      await userDocRef.update({
        is_active: true,
        is_enrolled: false,
        role: "user", // FastAPI backend expects lowercase "user" / "admin"
        created_at: now,
        updated_at: now
      });

      return NextResponse.json({ ...profileData, id: auth.uuid });
    } else {
      // User exists, update lastLogin
      const now = new Date().toISOString();
      const existingData = userDoc.data();

      await userDocRef.update({
        lastLogin: now,
        updated_at: now
      });

      return NextResponse.json({
        ...existingData,
        id: auth.uuid,
        lastLogin: now
      });
    }
  } catch (err: any) {
    console.error("Error in /api/member/create:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
