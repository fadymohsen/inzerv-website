"use client";

import { useEffect, useState } from "react";
import { account, type Profile } from "@/lib/api-client";

/** Loads the signed-in user's full profile once. */
export function useProfile(enabled: boolean) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    account
      .profile()
      .then((p) => alive && setProfile(p))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [enabled]);

  return { profile, setProfile, failed };
}
