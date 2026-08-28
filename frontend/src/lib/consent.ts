"use client";

export type ConsentSettings = {
  analytics: boolean;
  marketing: boolean;
};

export const CONSENT_STORAGE_KEY = "guiasense_consent";

export const OPEN_CONSENT_PREFS_EVENT = "guiasense:open-consent-preferences";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function readConsentSettings(): ConsentSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentSettings>;
    if (typeof parsed.analytics !== "boolean" || typeof parsed.marketing !== "boolean") {
      return null;
    }
    return { analytics: parsed.analytics, marketing: parsed.marketing };
  } catch {
    return null;
  }
}

export function saveConsentSettings(settings: ConsentSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    return;
  }
}

function toSignal(value: boolean): "granted" | "denied" {
  return value ? "granted" : "denied";
}

export function applyConsentMode(settings: ConsentSettings): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  const marketing = toSignal(settings.marketing);
  window.gtag("consent", "update", {
    analytics_storage: toSignal(settings.analytics),
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    wait_for_update: 500,
  });
}

export function acceptAllConsent(): void {
  const settings: ConsentSettings = { analytics: true, marketing: true };
  saveConsentSettings(settings);
  applyConsentMode(settings);
}

export function declineOptionalConsent(): void {
  const settings: ConsentSettings = { analytics: false, marketing: false };
  saveConsentSettings(settings);
  applyConsentMode(settings);
}

export function defaultConsentSettings(): ConsentSettings {
  return { analytics: false, marketing: false };
}

export function openConsentPreferences(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_CONSENT_PREFS_EVENT));
}