import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { authenticateRequest } from "@/lib/member/auth";

export async function GET(req: Request) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const externalUserId = searchParams.get("external_user_id");

    if (!externalUserId) {
      return NextResponse.json({ error: "Missing external_user_id parameter" }, { status: 400 });
    }

    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("uid", "==", externalUserId).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ profile: null, message: "No NeoID profile created for this identity yet." });
    }

    const doc = snapshot.docs[0];
    return NextResponse.json({
      profile: {
        ...doc.data(),
        id: doc.id
      }
    });
  } catch (err: any) {
    console.error("Error in /api/admin/identity-profile:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
