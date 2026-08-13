"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Clock,
  Ban,
  LogOut,
  CheckCircle2,
  CreditCard,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";
import { paymentsApi, usersApi } from "@/lib/api";
import { formatBRL } from "@/lib/format";

const accessBadge: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  LIBERADO: {
    label: "Acesso liberado",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  PAGAMENTO_PENDENTE: {
    label: "Pagamento pendente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="h-4 w-4" />,
  },
  BLOQUEADO: {
    label: "Acesso bloqueado",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    icon: <Ban className="h-4 w-4" />,
  },
};

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const [name, setName] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [lastAmount, setLastAmount] = useState<number | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutPaymentId, setCheckoutPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) setName(user.name);
    paymentsApi
      .status()
      .then((status) => {
        setPaymentStatus(status.paymentStatus);
        if (status.lastPayment) {
          setLastAmount(Number(status.lastPayment.amountBRL));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <PageLoader />;

  const badge = accessBadge[user?.accessStatus ?? "PAGAMENTO_PENDENTE"];

  async function handleSaveName(event: React.FormEvent) {
    event.preventDefault();
    setNameMessage("");
    setSavingName(true);
    try {
      await usersApi.update({ name: name.trim() });
      await refreshUser();
      setNameMessage("Nome atualizado com sucesso.");
    } catch (error) {
      setNameMessage(error instanceof Error ? error.message : "Não foi possível atualizar.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleCheckout() {
    setCheckoutMessage("");
    setCheckoutLoading(true);
    try {
      const result = await paymentsApi.checkout();
      setCheckoutPaymentId(result.paymentId);
      if (result.mode === "mercadopago" && result.initPoint) {
        window.location.href = result.initPoint;
      } else {
        setCheckoutMessage("Pagamento em modo de teste. Use o botão abaixo para confirmar.");
      }
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : "Não foi possível gerar o pagamento.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleSimulate() {
    if (!checkoutPaymentId) return;
    setCheckoutMessage("");
    setCheckoutLoading(true);
    try {
      await paymentsApi.simulate(checkoutPaymentId);
      setCheckoutMessage("Pagamento confirmado! Seu acesso foi liberado.");
      await refreshUser();
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : "Não foi possível confirmar.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500">Sua conta e assinatura</p>
      </div>

      <Card>
        <CardHeader title="Perfil" subtitle="Seus dados de acesso" />
        <form onSubmit={handleSaveName} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" htmlFor="name">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </Field>
            <Field label="E-mail" htmlFor="email">
              <Input id="email" value={user?.email ?? ""} disabled />
            </Field>
          </div>
          {nameMessage && (
            <p className="text-sm font-medium text-emerald-600">{nameMessage}</p>
          )}
          <Button type="submit" loading={savingName}>
            <Save className="h-4 w-4" /> Salvar alterações
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Assinatura" subtitle="Situação do seu acesso ao GuiaSense" />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${badge.className}`}
            >
              {badge.icon}
              {badge.label}
            </span>
            {paymentStatus && (
              <span className="text-sm text-slate-500">
                Status do último pagamento: <strong className="text-slate-700">{paymentStatus}</strong>
              </span>
            )}
            {lastAmount !== null && (
              <span className="text-sm text-slate-500">
                Plano mensal · {formatBRL(lastAmount)}/mês
              </span>
            )}
          </div>

          {user?.accessStatus !== "LIBERADO" && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                Seu acesso está {user?.accessStatus === "BLOQUEADO" ? "bloqueado" : "pendente de pagamento"}.
                Ao confirmar o pagamento, o acesso é liberado automaticamente.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={handleCheckout} loading={checkoutLoading}>
                  <CreditCard className="h-4 w-4" /> Assinar agora
                </Button>
                {checkoutPaymentId && (
                  <Button variant="success" onClick={handleSimulate} loading={checkoutLoading}>
                    <CheckCircle2 className="h-4 w-4" /> Confirmar pagamento (teste)
                  </Button>
                )}
              </div>
              {checkoutMessage && (
                <p className="mt-2 text-sm font-medium text-emerald-700">{checkoutMessage}</p>
              )}
            </div>
          )}

          <p className="text-xs text-slate-400">
            Pagamentos processados com segurança pelo Mercado Pago.
          </p>
        </div>
      </Card>

      <Card className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800">Sair da conta</p>
          <p className="text-sm text-slate-500">Encerra a sessão neste dispositivo.</p>
        </div>
        <Button variant="danger" onClick={logout}>
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </Card>
    </div>
  );
}
