"use client";
/**
 * FirebaseAuthProvider
 * ---------------------
 * Runs once at the app root. Subscribes to Firebase's persistent auth state
 * and keeps the Zustand store in sync.
 *
 * Fix for the "login loop" bug:
 *   The original code read `isAuthenticated` from a stale closure in useEffect,
 *   meaning the value was always `false` on the first render. Every time
 *   onAuthStateChanged fired it would re-set tokens/user and trigger a
 *   re-render, causing the dashboard guard to briefly see isAuthenticated=false
 *   and redirect back to /login.
 *
 *   Solution: read live state via useAuthStore.getState() inside the callback
 *   so we always get the current value, not the captured closure value.
 */

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { subscribeToAuthState, firebaseLogout } from "@/lib/firebase-auth";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api";
import type { User } from "@/types";
import type { User as FirebaseUser } from "firebase/auth";

function buildUserFromFirebase(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    name: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "User",
    email: fbUser.email ?? "",
    role: "user",
    is_active: true,
    is_enrolled: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function FirebaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand persist to rehydrate before checking authentication
  useEffect(() => {
    if ((useAuthStore as any).persist?.hasHydrated()) {
      setHydrated(true);
    } else {
      const unsub = (useAuthStore as any).persist?.onFinishHydration(() => {
        setHydrated(true);
      });
      return () => unsub?.();
    }
  }, []);

  // Global route guard — redirect to /login if unauthenticated on a protected page
  useEffect(() => {
    if (!hydrated) return;

    const isProtectedRoute =
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/") ||
      pathname === "/me" ||
      pathname.startsWith("/me/") ||
      pathname === "/org-admin" ||
      pathname.startsWith("/org-admin/") ||
      pathname === "/super" ||
      pathname.startsWith("/super/");

    const isPublicRoute = !isProtectedRoute || pathname.startsWith("/api/");

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, pathname, router]);

  // Sync Firebase logout when backend session terminates
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      const { firebaseUser, setFirebaseUser } = useAuthStore.getState();
      if (firebaseUser) {
        firebaseLogout()
          .then(() => setFirebaseUser(null))
          .catch(console.error);
      }
    }
  }, [hydrated, isAuthenticated]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((fbUser) => {
      // Always read fresh state via getState() — never rely on a closure value
      // which would be stale and always appear as `false` on first mount.
      const { isAuthenticated, setFirebaseUser, setUser, setTokens } =
        useAuthStore.getState();

      if (fbUser) {
        // Sync the Firebase user reference regardless
        setFirebaseUser(fbUser);

        // Only set user/tokens if there's no existing backend session or local token.
        const hasLocalSession = typeof window !== "undefined" && !!localStorage.getItem("bioid_access_token");

        if (!isAuthenticated && !hasLocalSession) {
          fbUser.getIdToken()
            .then(async (idToken) => {
              try {
                // Initialize NeoID and QR code profile in Firestore
                try {
                  const axios = (await import("axios")).default;
                  await axios.post("/api/member/create", {}, {
                    headers: { Authorization: `Bearer ${idToken}` }
                  });
                } catch (createErr) {
                  console.error("NeoID profile auto-creation failed:", createErr);
                }

                const { data: tokens } = await authApi.googleSignIn(idToken);
                setTokens(tokens.access_token, tokens.refresh_token);
                const { data: user } = await authApi.me();
                setUser(user);
              } catch (err) {
                console.error("Auto-token exchange failed, clearing Firebase session:", err);
                await firebaseLogout();
                useAuthStore.getState().logout();
              }
            })
            .catch(async (tokenErr) => {
              console.error("Failed to get Firebase ID token:", tokenErr);
              await firebaseLogout();
              useAuthStore.getState().logout();
            });
        }
      } else {
        // Firebase signed out — clear the firebase user reference.
        // Do NOT log out a backend-only session (they signed in via email/pw).
        setFirebaseUser(null);
      }
    });

    return () => unsubscribe();
    // Empty deps: subscribe exactly once for the lifetime of the app.
    // All state reads happen via getState() inside the callback.
  }, []);

  return <>{children}</>;
}
