"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  OPEN_CONSENT_PREFS_EVENT,
  readConsentSettings,
  saveConsentSettings,
  applyConsentMode,
  acceptAllConsent,
  declineOptionalConsent,
  defaultConsentSettings,
  type ConsentSettings,
} from "@/lib/consent";

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-brand-600" : "bg-slate-200"
      } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function ConsentBanner() {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [draft, setDraft] = useState<ConsentSettings>(defaultConsentSettings());

  useEffect(() => {
    if (!readConsentSettings()) {
      setBannerVisible(true);
    }
  }, []);

  useEffect(() => {
    const onOpenRequest = () => openPreferences(readConsentSettings() ?? defaultConsentSettings());
    window.addEventListener(OPEN_CONSENT_PREFS_EVENT, onOpenRequest);
    return () => window.removeEventListener(OPEN_CONSENT_PREFS_EVENT, onOpenRequest);
  }, []);

  function openPreferences(initial: ConsentSettings) {
    setDraft(initial);
    setPreferencesOpen(true);
    setBannerVisible(false);
  }

  function handleAcceptAll() {
    acceptAllConsent();
    setBannerVisible(false);
    setPreferencesOpen(false);
  }

  function handleDecline() {
    declineOptionalConsent();
    setBannerVisible(false);
    setPreferencesOpen(false);
  }

  function handleSave() {
    saveConsentSettings(draft);
    applyConsentMode(draft);
    setPreferencesOpen(false);
    setBannerVisible(false);
  }

  function handleClosePreferences() {
    setPreferencesOpen(false);
  }

  if (!bannerVisible && !preferencesOpen) return null;

  return (
    <>
      {bannerVisible && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4">
          <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl shadow-slate-900/10 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Cookie className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                Respeitamos sua privacidade
              </h2>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
              Usamos cookies necessários para o funcionamento do GuiaSense e, com sua autorização,
              cookies de análise e marketing para entender o uso do site e melhorar nossas
              comunicações.{" "}
              <Link
                href="/privacidade"
                className="font-semibold text-brand-600 hover:underline"
              >
                Política de Privacidade
              </Link>
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleAcceptAll} variant="primary" className="flex-1">
                Aceitar todos
              </Button>
              <Button onClick={handleDecline} variant="secondary" className="flex-1">
                Recusar opcionais
              </Button>
              <Button
                onClick={() => openPreferences(readConsentSettings() ?? defaultConsentSettings())}
                variant="ghost"
                className="flex-1"
              >
                Configurar
              </Button>
            </div>
          </div>
        </div>
      )}

      {preferencesOpen && (
        <Modal open onClose={handleClosePreferences} title="Configurar preferências">
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Necessários</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Necessários para o funcionamento e segurança do GuiaSense.
                  </p>
                </div>
                <span className="mt-0.5 shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-600">
                  Sempre ativos
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Analytics</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Ajuda a entender como o site é utilizado e a melhorar a experiência.
                  </p>
                </div>
                <Toggle
                  checked={draft.analytics}
                  onChange={(checked) => setDraft({ ...draft, analytics: checked })}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Marketing</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Permite medir campanhas e melhorar a relevância das nossas comunicações.
                  </p>
                </div>
                <Toggle
                  checked={draft.marketing}
                  onChange={(checked) => setDraft({ ...draft, marketing: checked })}
                />
              </div>
            </div>

            <Button onClick={handleSave} fullWidth>
              Salvar preferências
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}