"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, CreditCard, RefreshCw } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";
import { adminApi, AdminUsersMonth } from "@/lib/api";
import { monthLabel } from "@/lib/format";
import { AdminNav } from "../admin-nav";

export default function AdminUsersByMonthPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [months, setMonths] = useState<AdminUsersMonth[] | null>(null);
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
      const data = await adminApi.usersByMonth();
      setMonths(data.months);
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

  const totals = (months ?? []).reduce(
    (acc, item) => ({
      newUsers: acc.newUsers + item.newUsers,
      payingUsers: acc.payingUsers + item.payingUsers,
    }),
    { newUsers: 0, payingUsers: 0 },
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <Users className="h-6 w-6 text-brand-600" /> Usuários por mês
          </h1>
          <p className="text-sm text-slate-500">
            Novos cadastros e assinantes pagantes por mês.
          </p>
        </div>
        <Button variant="secondary" onClick={() => load()}>
          <RefreshCw className="h-4 w-4" /> Atualizar
        </Button>
      </div>

      <AdminNav />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Total de cadastros</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <UserPlus className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              {totals.newUsers}
            </p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Pagamentos aprovados</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              {totals.payingUsers}
            </p>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader title="Usuários por mês" />
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
                    <div className="flex items-center gap-6">
                      <span className="text-slate-500">
                        <strong className="font-bold text-slate-900">{item.newUsers}</strong>{" "}
                        novos
                      </span>
                      <span className="text-slate-500">
                        <strong className="font-bold text-slate-900">{item.payingUsers}</strong>{" "}
                        pagantes
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Nenhum usuário registrado.</p>
          )}
        </Card>
      </div>
    </div>
  );
}