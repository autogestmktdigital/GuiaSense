"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dashboardApi, transactionsApi, UpcomingPayment } from "@/lib/api";
import { formatBRL, formatDayMonth } from "@/lib/format";

export function UpcomingPayments({ onPaid }: { onPaid: () => void }) {
  const [data, setData] = useState<{ total: number; items: UpcomingPayment[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await dashboardApi.upcomingPayments();
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markPaid(id: string) {
    setPayingId(id);
    try {
      await transactionsApi.update(id, { paid: true });
      await load();
      onPaid();
    } finally {
      setPayingId(null);
    }
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="O que eu preciso pagar em breve?"
        subtitle="Vencimentos dos próximos 5 dias"
      />
      {loading ? (
        <p className="text-sm text-slate-400">Carregando…</p>
      ) : data && data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-6 py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-500 shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Tudo certo por enquanto!</h3>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Você não tem pagamentos vencendo nos próximos 5 dias.
          </p>
        </div>
      ) : (
        <ul
          className={`divide-y divide-slate-100 ${
            data && data.items.length > 5 ? "max-h-80 overflow-y-auto pr-1" : ""
          }`}
        >
          {data?.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
                <span className="text-xs font-bold text-slate-700">
                  {formatDayMonth(item.date)}
                </span>
                {item.overdue && (
                  <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-600">
                    Atrasado
                  </span>
                )}
              </div>
              <p className="min-w-0 flex-1 truncate text-sm text-slate-700">
                <span className="font-semibold text-slate-800">
                  {item.subcategory || "Sem categoria"}
                </span>
                {item.description ? ` / ${item.description}` : ""}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-bold text-slate-900">−{formatBRL(item.amount)}</span>
                <Button
                  size="sm"
                  variant="warning"
                  onClick={() => markPaid(item.id)}
                  disabled={payingId === item.id}
                  className="gap-1 px-2.5"
                >
                  {payingId === item.id ? "Salvando…" : "Já paguei"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
