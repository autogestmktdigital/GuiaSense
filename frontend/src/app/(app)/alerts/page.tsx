"use client";

import { useEffect, useState } from "react";
import { BellRing, BellOff, Check, Eye, AlertTriangle, Info, AlertOctagon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/spinner";
import { alertsApi, Alert } from "@/lib/api";
import { formatDate } from "@/lib/format";

function AlertIcon({ severity }: { severity: string }) {
  if (severity === "DANGER") return <AlertOctagon className="h-5 w-5 text-rose-600" />;
  if (severity === "WARNING") return <AlertTriangle className="h-5 w-5 text-amber-600" />;
  return <Info className="h-5 w-5 text-sky-600" />;
}

const statusLabel: Record<string, string> = {
  ACTIVE: "Novo",
  READ: "Lido",
  DISMISSED: "Dispensado",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { alerts } = await alertsApi.list();
      setAlerts(alerts);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const active = alerts.filter((a) => a.status === "ACTIVE");
  const read = alerts.filter((a) => a.status === "READ");
  const dismissed = alerts.filter((a) => a.status === "DISMISSED");

  async function handleRead(alert: Alert) {
    await alertsApi.markRead(alert.id);
    load();
  }

  async function handleDismiss(alert: Alert) {
    await alertsApi.dismiss(alert.id);
    load();
  }

  function renderList(items: Alert[]) {
    if (items.length === 0) return null;
    return (
      <ul className="space-y-3">
        {items.map((alert) => (
          <li
            key={alert.id}
            className={`flex items-start gap-3 rounded-2xl border bg-white p-4 ${
              alert.status === "ACTIVE" ? "border-brand-100 shadow-sm" : "border-slate-100"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              <AlertIcon severity={alert.severity} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {statusLabel[alert.status]}
                </span>
                <span className="text-xs text-slate-400">· {formatDate(alert.createdAt)}</span>
              </div>
              <p className="mt-0.5 text-sm font-medium text-slate-800">{alert.message}</p>
            </div>
            {alert.status !== "DISMISSED" && (
              <div className="flex shrink-0 gap-1">
                {alert.status === "ACTIVE" && (
                  <button
                    onClick={() => handleRead(alert)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    title="Marcar como lido"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDismiss(alert)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  title="Dispensar"
                >
                  <BellOff className="h-4 w-4" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Alertas</h1>
        <p className="text-sm text-slate-500">Avisos sobre a sua vida financeira</p>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          icon={<BellRing className="h-6 w-6" />}
          title="Nenhum alerta por enquanto"
          description="Quando algo merecer atenção — como orçamento quase no limite — você será avisado aqui."
        />
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Check className="h-4 w-4 text-brand-600" /> Para sua atenção
              </h2>
              {renderList(active)}
            </section>
          )}
          {read.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-slate-500">Já vistos</h2>
              {renderList(read)}
            </section>
          )}
          {dismissed.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-slate-500">Dispensados</h2>
              {renderList(dismissed)}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
