"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";
import { adminApi, AdminUser } from "@/lib/api";
import { formatBRL, formatDateShort } from "@/lib/format";
import { AdminNav } from "../admin-nav";

type TabKey = "LIBERADO" | "PAGAMENTO_PENDENTE" | "CANCELADO" | "BLOQUEADO";

const TABS: { key: TabKey; label: string }[] = [
  { key: "LIBERADO", label: "Ativos" },
  { key: "PAGAMENTO_PENDENTE", label: "Pendentes" },
  { key: "CANCELADO", label: "Cancelados" },
  { key: "BLOQUEADO", label: "Bloqueados" },
];

const accessBadge: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  LIBERADO: "success",
  PAGAMENTO_PENDENTE: "warning",
  BLOQUEADO: "danger",
  CANCELADO: "neutral",
};

const paymentBadge: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger",
  CANCELLED: "neutral",
  EXPIRED: "neutral",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<TabKey>("LIBERADO");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.users();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "ADMIN") load();
  }, [user?.role]);

  const counts = useMemo(() => {
    const map: Record<TabKey, number> = { LIBERADO: 0, PAGAMENTO_PENDENTE: 0, CANCELADO: 0, BLOQUEADO: 0 };
    for (const item of users ?? []) {
      const key = item.accessStatus as TabKey;
      if (key in map) map[key] += 1;
    }
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (users ?? []).filter((item) => {
      if (item.accessStatus !== tab) return false;
      if (!term) return true;
      return (
        item.name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term)
      );
    });
  }, [users, tab, search]);

  if (loading && !users) return <PageLoader />;
  if (user && user.role !== "ADMIN") return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Usuários</h1>
          <p className="text-sm text-slate-500">
            Gestão de acesso dos usuários do GuiaSense por status.
          </p>
        </div>
        <Button variant="secondary" onClick={() => load()}>
          <RefreshCw className="h-4 w-4" /> Atualizar
        </Button>
      </div>

      <AdminNav />

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((item) => {
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {counts[item.key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome ou e-mail"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-semibold">Usuário</th>
                <th className="px-4 py-3 font-semibold">Acesso</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Cadastro</th>
                <th className="px-4 py-3 font-semibold">Movimentações</th>
                <th className="px-4 py-3 font-semibold">Último pagamento</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge severity={accessBadge[item.accessStatus] ?? "neutral"}>
                      {item.accessStatus === "LIBERADO"
                        ? "Ativo"
                        : item.accessStatus === "PAGAMENTO_PENDENTE"
                          ? "Pendente"
                          : item.accessStatus === "CANCELADO"
                            ? "Cancelado"
                            : "Bloqueado"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.role === "ADMIN" ? (
                      <span className="font-semibold text-brand-600">Admin</span>
                    ) : (
                      "Usuário"
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDateShort(item.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-600">{item.transactions}</td>
                  <td className="px-4 py-3">
                    {item.lastPayment ? (
                      <div className="flex items-center gap-2">
                        <Badge severity={paymentBadge[item.lastPayment.status] ?? "neutral"}>
                          {item.lastPayment.status}
                        </Badge>
                        <span className="text-slate-600">
                          {formatBRL(Number(item.lastPayment.amountBRL))}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                    {search
                      ? "Nenhum usuário encontrado para esta busca."
                      : "Nenhum usuário neste status."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}