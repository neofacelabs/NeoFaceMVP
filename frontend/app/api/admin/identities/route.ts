import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { authenticateRequest } from "@/lib/member/auth";

export async function GET(req: Request) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch all Firestore users
    const usersSnapshot = await adminDb.collection("users").get();
    const usersList = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // 2. Fetch all Firestore identities
    const identitiesSnapshot = await adminDb.collection("identities").get();
    const identitiesList = identitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Map identities by external_user_id
    const identitiesMap = new Map<string, any>();
    identitiesList.forEach(id => {
      identitiesMap.set(id.external_user_id, id);
    });

    // 3. Construct combined list
    const combinedIdentities = usersList.map(user => {
      const matchingIdentity = identitiesMap.get(user.uid);

      // Determine biometric enrollment
      const hasFace = user.faceEnrolled === true || !!user.face_embedding_id || !!matchingIdentity?.face_embedding_id;
      const hasFingerprint = user.fingerprintEnrolled === true || user.is_fingerprint_enrolled === true || !!matchingIdentity?.is_fingerprint_enrolled;
      const hasIris = user.irisEnrolled === true || user.is_iris_enrolled === true || !!matchingIdentity?.is_iris_enrolled;
      
      const isEnrolled = hasFace || hasFingerprint || hasIris || user.is_enrolled === true;

      return {
        id: matchingIdentity?.id || user.id,
        organization_id: matchingIdentity?.organization_id || user.organization_id || "default-org",
        application_id: matchingIdentity?.application_id || user.application_id || "default-app",
        external_user_id: user.uid || matchingIdentity?.external_user_id || user.id,
        enrollment_status: isEnrolled ? "enrolled" : "pending",
        face_embedding_id: hasFace ? (matchingIdentity?.face_embedding_id || "enrolled-face-id") : null,
        identity_type: (user.role || matchingIdentity?.identity_type || "member").toLowerCase(),
        site_id: matchingIdentity?.site_id || user.site_id || null,
        status: (user.status || matchingIdentity?.status || "active").toLowerCase(),
        metadata_fields: matchingIdentity?.metadata_fields || {},
        is_fingerprint_enrolled: hasFingerprint,
        is_iris_enrolled: hasIris,
        created_at: user.createdAt || user.created_at || matchingIdentity?.created_at || new Date().toISOString(),
        updated_at: user.updated_at || matchingIdentity?.updated_at || new Date().toISOString(),
        // Extra helper fields for frontend
        name: user.name || "Member User",
        email: user.email || "",
        phone: user.phone || "",
        photoURL: user.photoURL || "",
        neoId: user.neoId || ""
      };
    });

    return NextResponse.json({
      items: combinedIdentities,
      total: combinedIdentities.length
    });
  } catch (err: any) {
    console.error("Error in /api/admin/identities:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
