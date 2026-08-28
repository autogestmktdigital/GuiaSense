"use client";

export const GA4_PLAN_PARAMS: Record<string, string> = {
  mensal: "monthly",
  semestral: "semiannual",
  anual: "annual",
};

export type DataLayerParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function pushDataLayerEvent(event: string, params?: DataLayerParams): void {
  if (typeof window === "undefined") return;
  const layer = (window.dataLayer = window.dataLayer || []);
  layer.push({ event, ...(params ?? {}) });
}

const PURCHASES_STORAGE_KEY = "guiasense_ga_purchases";

export function hasFiredPurchase(transactionId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(PURCHASES_STORAGE_KEY);
    const fired: string[] = raw ? JSON.parse(raw) : [];
    return fired.includes(transactionId);
  } catch {
    return false;
  }
}

export function markPurchaseFired(transactionId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(PURCHASES_STORAGE_KEY);
    const fired: string[] = raw ? JSON.parse(raw) : [];
    if (!fired.includes(transactionId)) {
      fired.push(transactionId);
      window.localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(fired));
    }
  } catch {
    return;
  }
}