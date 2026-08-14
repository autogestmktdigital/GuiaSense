"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, RefreshCw, TrendingUp } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";
import { adminApi, AdminRevenueMonth } from "@/lib/api";
import { formatBRL, monthLabel } from "@/lib/format";
import { AdminNav } from "../admin-nav";

export default function AdminRevenuePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [months, setMonths] = useState<AdminRevenueMonth[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.revenue();
      setMonths((data as { months: AdminRevenueMonth[] }).months.filter(
        (item) => item.amountBRL > 0,
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "ADMIN") load();
  }, [user?.role]);

  if (loading && !months) return <PageLoader />;
  if (user && user.role !== "ADMIN") return null;
  if (error && !months) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm font-medium text-rose-600">{error}</p>
        <Button onClick={() => load()}>
          <RefreshCw className="h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    );
  }

  const total = (months ?? []).reduce((sum, item) => sum + item.amountBRL, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <Wallet className="h-6 w-6 text-brand-600" /> Receita mensal
          </h1>
          <p className="text-sm text-slate-500">Fluxo de caixa por mês (pagamentos aprovados).</p>
        </div>
        <Button variant="secondary" onClick={() => load()}>
          <RefreshCw className="h-4 w-4" /> Atualizar
        </Button>
      </div>

      <AdminNav />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Receita total (aprovados)</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            {formatBRL(total)}
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Fluxo de caixa por mês" />
          {months !== null && months.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {months
                .slice()
                .reverse()
                .map((item) => (
                  <li
                    key={item.month}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span className="font-semibold text-slate-700">{monthLabel(item.month)}</span>
                    <span className="font-bold text-slate-900">{formatBRL(item.amountBRL)}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Nenhuma receita registrada.</p>
          )}
        </Card>
      </div>
    </div>
  );
}