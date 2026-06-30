import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { authenticateRequest } from "@/lib/member/auth";
import { getUuidFromFirebaseUid, generateNeoId, isNeoIdUnique, generateQRCode } from "@/lib/member/utils";

export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse payload
    const body = await req.json();
    const { name, email, password, role, organizationId } = body;

    if (!name || !email || !password || !role || !organizationId) {
      return NextResponse.json(
        { error: "Missing required fields (name, email, password, role, organizationId)" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 1. Check if user already exists in Firebase Auth
    try {
      await adminAuth.getUserByEmail(email.toLowerCase());
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 409 }
      );
    } catch (e: any) {
      // User doesn't exist, which is expected
      if (e.code !== "auth/user-not-found") {
        throw e;
      }
    }

    // 2. Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: email.toLowerCase(),
      password: password,
      displayName: name,
    });

    const firebaseUid = userRecord.uid;
    const deterministicUuid = getUuidFromFirebaseUid(firebaseUid);

    // 3. Generate a unique NeoID
    let neoId = generateNeoId();
    let unique = await isNeoIdUnique(adminDb, neoId);
    let attempts = 0;
    while (!unique && attempts < 10) {
      neoId = generateNeoId();
      unique = await isNeoIdUnique(adminDb, neoId);
      attempts++;
    }

    // 4. Generate signed QR Code containing credentials
    const qrCodeDataUrl = await generateQRCode(neoId, firebaseUid);

    // 5. Save user profile document to Firestore users collection
    const now = new Date().toISOString();
    const isOrgAdmin = role === "org_admin";

    const profileData = {
      uid: firebaseUid,
      neoId,
      qrCode: qrCodeDataUrl,
      name: name,
      email: email.toLowerCase(),
      photoURL: "",
      role: isOrgAdmin ? "admin" : "user", // For FastAPI compatibility
      org_role: isOrgAdmin ? "admin" : undefined, // Flag for Org Admin portal
      status: "ACTIVE",
      phone: "",
      createdAt: now,
      lastLogin: now,
      biometricEnrolled: false,
      faceEnrolled: false,
      fingerprintEnrolled: false,
      membershipTier: "FREE",
      authMethods: ["password"],
      verificationLevel: "VERIFIED",
      organization_id: organizationId,
      is_active: true,
      is_enrolled: false,
      created_at: now,
      updated_at: now,
    };

    await adminDb.collection("users").doc(deterministicUuid).set(profileData);

    // 6. Return response
    return NextResponse.json({
      success: true,
      user: {
        id: deterministicUuid,
        uid: firebaseUid,
        neoId,
        name,
        email,
        role,
        organizationId,
        qrCode: qrCodeDataUrl
      }
    });

  } catch (err: any) {
    console.error("Error in /api/admin/generate-credentials:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
