import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { authenticateRequest } from "@/lib/member/auth";

export async function GET(req: Request) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userDocRef = adminDb.collection("users").doc(auth.uuid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return new Response("User not found", { status: 404 });
    }

    const userData = userDoc.data();
    const qrCodeBase64 = userData?.qrCode;

    if (!qrCodeBase64 || !qrCodeBase64.startsWith("data:image/png;base64,")) {
      return new Response("QR Code not generated", { status: 400 });
    }

    // Strip the data:image/png;base64, prefix and convert to binary buffer
    const base64Data = qrCodeBase64.replace(/^data:image\/png;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, "base64");

    return new Response(imgBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Length": imgBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (err: any) {
    console.error("Error in /api/member/qr:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
