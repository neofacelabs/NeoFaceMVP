import jwt from "jsonwebtoken";
import { adminAuth } from "@/lib/firebase-admin";
import { getUuidFromFirebaseUid } from "@/lib/member/utils";

/**
 * Verifies a JWT token issued by the FastAPI backend using HS256 and the shared JWT_SECRET.
 */
export function verifyBackendToken(token: string): { sub: string; email: string; role: string } | null {
  try {
    const secret = process.env.JWT_SECRET || "change-this-to-a-secure-random-64-char-secret-before-deploying";
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
    return payload as any;
  } catch (err) {
    console.error("verifyBackendToken error using jsonwebtoken:", err);
    return null;
  }
}

/**
 * Authenticates an incoming API request by verifying the Authorization header.
 * Supports both Firebase ID tokens and FastAPI-issued JWT access tokens.
 */
export async function authenticateRequest(req: Request): Promise<{ uid?: string; email: string; uuid: string } | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);

  // 1. Try to verify as FastAPI backend access token
  const backendPayload = verifyBackendToken(token);
  if (backendPayload) {
    return {
      email: backendPayload.email,
      uuid: backendPayload.sub,
    };
  }

  // 2. Try to verify as Firebase ID Token
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uuid = getUuidFromFirebaseUid(decodedToken.uid);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      uuid,
    };
  } catch (err) {
    // 3. Fallback: Check if it is a local development demo token
    if (token.startsWith("demo-token-")) {
      const email = token.substring(11);
      const mockUid = `demo-uid-${email}`;
      const uuid = getUuidFromFirebaseUid(mockUid);
      return {
        uid: mockUid,
        email,
        uuid,
      };
    }
    console.error("Token verification failed for Firebase, FastAPI, and Demo:", err);
    return null;
  }
}
