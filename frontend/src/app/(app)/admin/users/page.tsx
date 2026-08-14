"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw, Loader2, CreditCard, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";
import { adminApi, AdminUser, AdminUserDetail } from "@/lib/api";
import { formatBRL, formatDateShort, formatDate } from "@/lib/format";
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

const paymentStatusLabel: Record<string, string> = {
  APPROVED: "Aprovado",
  PENDING: "Pendente",
  REJECTED: "Recusado",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
};

const planLabel: Record<string, string> = {
  mensal: "Mensal",
  semestral: "Semestral",
  anual: "Anual",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<TabKey>("LIBERADO");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [roleLoading, setRoleLoading] = useState<string | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<AdminUser | null>(null);
  const [promoteCode, setPromoteCode] = useState("");
  const [promoteError, setPromoteError] = useState("");

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  async function openDetail(item: AdminUser) {
    setSelectedUser(item);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const data = await adminApi.userDetail(item.id);
      setDetail(data);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Não foi possível carregar os dados.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function changeRole(item: AdminUser, role: "ADMIN" | "USER") {
    if (role === "ADMIN") {
      setPromoteTarget(item);
      setPromoteCode("");
      setPromoteError("");
      return;
    }
    setRoleLoading(item.id);
    try {
      await adminApi.setUserRole(item.id, "USER");
      setUsers((current) =>
        (current ?? []).map((entry) => (entry.id === item.id ? { ...entry, role: "USER" } : entry)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível alterar o papel.");
    } finally {
      setRoleLoading(null);
    }
  }

  async function confirmPromote() {
    if (!promoteTarget) return;
    if (!promoteCode.trim()) {
      setPromoteError("A senha de administrador é obrigatória.");
      return;
    }
    setRoleLoading(promoteTarget.id);
    setPromoteError("");
    try {
      await adminApi.setUserRole(promoteTarget.id, "ADMIN", promoteCode.trim());
      setUsers((current) =>
        (current ?? []).map((entry) =>
          entry.id === promoteTarget.id ? { ...entry, role: "ADMIN" } : entry,
        ),
      );
      setPromoteTarget(null);
    } catch (err) {
      setPromoteError(err instanceof Error ? err.message : "Não foi possível alterar o papel.");
    } finally {
      setRoleLoading(null);
    }
  }

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
                <th className="px-4 py-3 font-semibold">Meses contratados</th>
                <th className="px-4 py-3 font-semibold">Último pagamento</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-slate-50">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openDetail(item)}
                      className="text-left"
                    >
                      <p className="font-semibold text-slate-800 underline-offset-2 transition-colors hover:text-brand-600 hover:underline">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">{item.email}</p>
                    </button>
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
                  <td className="px-4 py-3">
                    {item.role === "ADMIN" ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-brand-600">Admin</span>
                        {item.id !== user?.id && (
                          <button
                            type="button"
                            onClick={() => changeRole(item, "USER")}
                            disabled={roleLoading === item.id}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
                          >
                            {roleLoading === item.id ? "..." : "Remover admin"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => changeRole(item, "ADMIN")}
                        disabled={roleLoading === item.id}
                        className="rounded-lg border border-brand-200 bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-50"
                      >
                        {roleLoading === item.id ? "..." : "Promover a admin"}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDateShort(item.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                      <CalendarDays className="h-3.5 w-3.5" /> {item.monthsHired}{" "}
                      {item.monthsHired === 1 ? "mês" : "meses"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.lastPayment ? (
                      <div className="flex items-center gap-2">
                        <Badge severity={paymentBadge[item.lastPayment.status] ?? "neutral"}>
                          {paymentStatusLabel[item.lastPayment.status] ?? item.lastPayment.status}
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

      <Modal
        open={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        title={selectedUser ? `Plano e pagamentos de ${selectedUser.name}` : "Detalhes"}
      >
        {selectedUser && (
          <p className="mb-3 text-xs text-slate-500">{selectedUser.email}</p>
        )}
        {detailLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        )}
        {detailError && <p className="text-sm font-medium text-rose-600">{detailError}</p>}
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Plano cadastrado</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-brand-700">
                  <CreditCard className="h-4 w-4" /> {planLabel[detail.currentPlan ?? ""] ?? "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Meses contratados</p>
                <p className="mt-1 text-sm font-extrabold text-slate-900">
                  {detail.monthsHired} {detail.monthsHired === 1 ? "mês" : "meses"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-bold text-slate-800">Histórico de pagamentos</h3>
              {detail.payments.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-400">
                  Nenhum pagamento registrado.
                </p>
              ) : (
                <div className="max-h-[55vh] overflow-y-auto">
                  <ul className="divide-y divide-slate-100">
                    {detail.payments.map((payment) => (
                      <li key={payment.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            {planLabel[payment.plan] ?? payment.plan}
                          </p>
                          <p className="text-xs text-slate-400">{formatDate(payment.createdAt)}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="text-sm font-bold text-slate-900">
                            {formatBRL(payment.amountBRL)}
                          </span>
                          <Badge severity={paymentBadge[payment.status] ?? "neutral"}>
                            {paymentStatusLabel[payment.status] ?? payment.status}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={promoteTarget !== null}
        onClose={() => setPromoteTarget(null)}
        title={promoteTarget ? `Promover ${promoteTarget.name} a admin` : "Promover a admin"}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Digite a senha exclusiva de administrador para confirmar a promoção.
          </p>
          <input
            type="password"
            value={promoteCode}
            onChange={(event) => setPromoteCode(event.target.value)}
            placeholder="Senha de administrador"
            autoFocus
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          {promoteError && <p className="text-sm font-medium text-rose-600">{promoteError}</p>}
          <div className="flex gap-2">
            <Button onClick={confirmPromote} loading={roleLoading !== null}>
              Promover
            </Button>
            <Button variant="secondary" onClick={() => setPromoteTarget(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}