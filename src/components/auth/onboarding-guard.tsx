"use client";

import { useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { OnboardingDialog } from "./onboarding-dialog";

/**
 * Checks if the signed-in user has completed onboarding (business profile).
 * Shows the onboarding dialog if not.
 */
export function OnboardingGuard({ children }: { readonly children: ReactNode }) {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const checkedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    // Skip if we already checked this user
    if (checkedUserIdRef.current === user.id) return;

    let cancelled = false;

    async function checkProfile() {
      try {
        const res = await fetch("/api/onboarding");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && !data.has_profile) {
          setShowOnboarding(true);
        }
      } catch {
        // Silently skip — don't block the user
      } finally {
        if (!cancelled) {
          checkedUserIdRef.current = user!.id;
        }
      }
    }

    void checkProfile();
    return () => { cancelled = true; };
  }, [user, loading]);

  // Reset when user logs out
  useEffect(() => {
    if (!user) {
      checkedUserIdRef.current = null;
      setShowOnboarding(false);
    }
  }, [user]);

  const handleComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  return (
    <>
      {children}
      <OnboardingDialog
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={handleComplete}
      />
    </>
  );
}
