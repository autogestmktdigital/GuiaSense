"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  CreditCard,
  TrendingUp,
  Shield,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";
import { adminApi, AdminOverview, AdminUser } from "@/lib/api";
import { formatBRL, formatDateShort } from "@/lib/format";
import { AdminNav } from "./admin-nav";

const accessBadge: Record<string, "success" | "warning" | "danger"> = {
  LIBERADO: "success",
  PAGAMENTO_PENDENTE: "warning",
  BLOQUEADO: "danger",
};

const paymentBadge: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger",
  CANCELLED: "neutral",
  EXPIRED: "neutral",
};

const paymentStatusLabel: Record<string, string> = {
  APPROVED: "Aprovado",
  PENDING: "Pendente",
  REJECTED: "Recusado",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
};

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>{icon}</div>
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
    </Card>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
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
      const [overviewData, usersData] = await Promise.all([adminApi.overview(), adminApi.users()]);
      setOverview(overviewData as AdminOverview);
      setUsers((usersData as { users: AdminUser[] }).users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "ADMIN") load();
  }, [user?.role]);

  if (loading && !overview) return <PageLoader />;
  if (user && user.role !== "ADMIN") return null;
  if (error && !overview) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm font-medium text-rose-600">{error}</p>
        <Button onClick={() => load()}>
          <RefreshCw className="h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    );
  }

  const totals = overview?.totals;
  const byAccess = overview?.users?.byAccess ?? {};
  const byStatus = overview?.payments?.byStatus ?? {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <Shield className="h-6 w-6 text-brand-600" /> Painel Administrativo
          </h1>
          <p className="text-sm text-slate-500">Visão geral de usuários e pagamentos do GuiaSense.</p>
        </div>
        <Button variant="secondary" onClick={() => load()}>
          <RefreshCw className="h-4 w-4" /> Atualizar
        </Button>
      </div>

      <AdminNav />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Usuários cadastrados"
          value={String(totals?.users ?? 0)}
          icon={<Users className="h-4 w-4" />}
          accent="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Novos nos últimos 30 dias"
          value={String(totals?.newUsersLast30d ?? 0)}
          icon={<UserCheck className="h-4 w-4" />}
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Pagamentos aprovados (30d)"
          value={String(totals?.approvedPaymentsLast30d ?? 0)}
          icon={<CreditCard className="h-4 w-4" />}
          accent="bg-sky-50 text-sky-600"
        />
        <StatCard
          label="Receita total (aprovados)"
          value={formatBRL(totals?.revenue ?? 0)}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Acesso dos usuários" />
          <ul className="space-y-3">
            <li className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <Badge severity="success">Ativo</Badge> Liberado
              </span>
              <span className="font-bold text-slate-900">{byAccess.LIBERADO ?? 0}</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <Badge severity="warning">Pendente</Badge> Pagamento pendente
              </span>
              <span className="font-bold text-slate-900">{byAccess.PAGAMENTO_PENDENTE ?? 0}</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <Badge severity="danger">Bloqueado</Badge> Bloqueado
              </span>
              <span className="font-bold text-slate-900">{byAccess.BLOQUEADO ?? 0}</span>
            </li>
          </ul>
        </Card>

        <Card>
          <CardHeader title="Status dos pagamentos" />
          <ul className="space-y-3">
            {Object.entries(byStatus).map(([status, count]) => (
              <li key={status} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <Badge severity={paymentBadge[status] ?? "neutral"}>
                    {paymentStatusLabel[status] ?? status}
                  </Badge>
                </span>
                <span className="font-bold text-slate-900">{String(count)}</span>
              </li>
            ))}
            {Object.keys(byStatus).length === 0 && (
              <li className="text-sm text-slate-400">Nenhum pagamento registrado.</li>
            )}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Extras" />
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-center justify-between">
              <span>Usuários administradores</span>
              <span className="font-bold text-slate-900">{overview?.users?.byRole?.ADMIN ?? 0}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Receita no mês vigente</span>
              <span className="font-bold text-slate-900">{formatBRL(totals?.revenueCurrentMonth ?? 0)}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Total de usuários</span>
              <span className="font-bold text-slate-900">{overview?.users?.total ?? 0}</span>
            </li>
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="Usuários recentes" subtitle="Últimos cadastros no sistema" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2 font-semibold">Usuário</th>
                <th className="px-3 py-2 font-semibold">Acesso</th>
                <th className="px-3 py-2 font-semibold">Cadastro</th>
                <th className="px-3 py-2 font-semibold">Movimentações</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).slice(0, 10).map((item) => (
                <tr key={item.id} className="border-b border-slate-50">
                  <td className="px-3 py-2.5">
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.email}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge severity={accessBadge[item.accessStatus] ?? "neutral"}>{item.accessStatus}</Badge>
                    {item.role === "ADMIN" && <span className="ml-1.5 text-xs font-semibold text-brand-600">Admin</span>}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">{formatDateShort(item.createdAt)}</td>
                  <td className="px-3 py-2.5 text-slate-600">{item.transactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Pagamentos recentes" subtitle="Últimas cobranças registradas" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2 font-semibold">Usuário</th>
                <th className="px-3 py-2 font-semibold">Valor</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Data</th>
              </tr>
            </thead>
            <tbody>
              {(overview?.recentPayments ?? []).slice(0, 10).map((payment) => (
                <tr key={payment.id} className="border-b border-slate-50">
                  <td className="px-3 py-2.5 font-semibold text-slate-800">
                    {payment.userName ?? "Usuário"}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">{formatBRL(payment.amountBRL)}</td>
                  <td className="px-3 py-2.5">
                    <Badge severity={paymentBadge[payment.status] ?? "neutral"}>
                      {paymentStatusLabel[payment.status] ?? payment.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">{formatDateShort(payment.createdAt)}</td>
                </tr>
              ))}
              {(overview?.recentPayments ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-400">
                    Nenhum pagamento registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="flex items-center justify-end gap-1 text-xs text-slate-400">
        <ArrowRight className="h-3 w-3" /> Dados atualizados em tempo real.
      </p>
    </div>
  );
}