"use client";

import { openConsentPreferences } from "@/lib/consent";

export function ConsentPreferencesLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openConsentPreferences} className={className}>
      Preferências de cookies
    </button>
  );
}