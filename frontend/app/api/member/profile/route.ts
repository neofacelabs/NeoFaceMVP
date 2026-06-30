import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { authenticateRequest } from "@/lib/member/auth";
import { generateNeoId, isNeoIdUnique, generateQRCode } from "@/lib/member/utils";

export async function GET(req: Request) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userDocRef = adminDb.collection("users").doc(auth.uuid);
    let userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      // Auto-create NeoID profile if it does not exist (Self-healing mechanism)
      let neoId = generateNeoId();
      let unique = await isNeoIdUnique(adminDb, neoId);
      let attempts = 0;
      while (!unique && attempts < 10) {
        neoId = generateNeoId();
        unique = await isNeoIdUnique(adminDb, neoId);
        attempts++;
      }

      const firebaseUid = auth.uid || auth.uuid;
      const qrCodeDataUrl = await generateQRCode(neoId, firebaseUid);

      let photoURL = "";
      let name = auth.email.split("@")[0];
      try {
        if (auth.uid && !auth.uid.startsWith("demo-uid-")) {
          const userRecord = await adminAuth.getUser(auth.uid);
          photoURL = userRecord.photoURL || "";
          name = userRecord.displayName || name;
        } else if (auth.uid?.startsWith("demo-uid-")) {
          // Capitalize first part of email for demo name
          const firstPart = name.split(".")[0];
          name = firstPart.charAt(0).toUpperCase() + firstPart.slice(1) + " User";
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
        role: "user",
        created_at: now,
        updated_at: now
      });

      return NextResponse.json({
        ...profileData,
        id: auth.uuid
      });
    }

    const data = userDoc.data();
    return NextResponse.json({
      ...data,
      id: auth.uuid
    });
  } catch (err: any) {
    console.error("Error in /api/member/profile:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
