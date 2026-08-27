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
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";
import { paymentsApi, usersApi, Plan, PlanId } from "@/lib/api";
import { formatBRL, formatDateShort } from "@/lib/format";

const paymentStatusLabel: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
};

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
  CANCELADO: {
    label: "Assinatura cancelada",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: <UserX className="h-4 w-4" />,
  },
};

function PlanPicker({
  plans,
  value,
  onChange,
}: {
  plans: Plan[];
  value: PlanId;
  onChange: (plan: PlanId) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {plans.map((plan) => {
        const active = value === plan.id;
        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onChange(plan.id)}
            className={`relative rounded-xl border px-3 py-3 text-left transition-colors ${
              active
                ? "border-brand-600 bg-white ring-2 ring-brand-500/20"
                : plan.featured
                  ? "border-brand-200 bg-white hover:border-brand-300"
                  : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-2.5 right-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                ⭐ Recomendado
              </span>
            )}
            <p className="text-sm font-bold text-slate-800">{plan.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{plan.tagline}</p>
            <p className="mt-1 text-sm font-extrabold text-brand-600">{formatBRL(plan.priceBRL)}</p>
            <p className="mt-0.5 text-xs text-slate-400">{plan.note}</p>
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const [name, setName] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [lastAmount, setLastAmount] = useState<number | null>(null);
  const [lastPlan, setLastPlan] = useState<string | null>(null);
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [trialExpiresAt, setTrialExpiresAt] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("mensal");
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutPaymentId, setCheckoutPaymentId] = useState<string | null>(null);
  const [cancelConfirming, setCancelConfirming] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function refreshPaymentStatus() {
    const status = await paymentsApi.status();
    setPaymentStatus(status.paymentStatus);
    setPlanExpiresAt(status.planExpiresAt);
    setTrialExpiresAt(status.trialExpiresAt);
    if (status.lastPayment) {
      setLastAmount(Number(status.lastPayment.amountBRL));
      setLastPlan(status.lastPayment.plan);
    }
  }

  useEffect(() => {
    if (user) setName(user.name);
    paymentsApi
      .plans()
      .then((data) => {
        setPlans(data.plans);
        setSelectedPlan(data.plans[0]?.id ?? "mensal");
      })
      .catch(() => {});
    refreshPaymentStatus()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <PageLoader />;

  const badge = accessBadge[user?.accessStatus ?? "PAGAMENTO_PENDENTE"];

  const planExpires = planExpiresAt ? new Date(planExpiresAt) : null;
  const trialExpires = trialExpiresAt ? new Date(trialExpiresAt) : null;
  const inTrial = Boolean(trialExpires && trialExpires.getTime() >= Date.now());
  const trialOverdue = Boolean(trialExpires && trialExpires.getTime() < Date.now());
  const planOverdue = Boolean(
    user &&
      user.accessStatus === "LIBERADO" &&
      planExpires &&
      planExpires.getTime() < Date.now(),
  );
  const graceDaysLeft = planOverdue && planExpires
    ? Math.max(0, 10 - Math.floor((Date.now() - planExpires.getTime()) / 86400000))
    : null;

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
      const result = await paymentsApi.checkout(selectedPlan);
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
      await refreshPaymentStatus();
      await refreshUser();
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : "Não foi possível confirmar.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleCancelSubscription() {
    setCancelMessage("");
    setCancelLoading(true);
    try {
      await usersApi.cancelSubscription();
      await refreshUser();
      setCancelMessage("Sua assinatura foi cancelada com sucesso.");
    } catch (error) {
      setCancelMessage(error instanceof Error ? error.message : "Não foi possível cancelar.");
    } finally {
      setCancelLoading(false);
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
                Status do último pagamento:{" "}
                <strong className="text-slate-700">
                  {paymentStatusLabel[paymentStatus] ?? paymentStatus}
                </strong>
              </span>
            )}
            {lastAmount !== null && (
              <span className="text-sm text-slate-500">
                Plano{" "}
                {plans.find((plan) => plan.id === lastPlan)?.label ??
                  (lastPlan ? lastPlan.charAt(0).toUpperCase() + lastPlan.slice(1) : "Mensal")}{" "}
                · {formatBRL(lastAmount)}
                {lastPlan === "mensal" && "/mês"}
              </span>
            )}
            {user?.accessStatus === "LIBERADO" && planExpiresAt && (
              <span
                className={`text-sm ${planOverdue ? "font-semibold text-amber-600" : "text-slate-500"}`}
              >
                {planOverdue ? "Venceu em" : "Válido até"}{" "}
                <strong className="text-slate-700">{formatDateShort(planExpiresAt)}</strong>
              </span>
            )}
          </div>

          {inTrial && (
            <div className="space-y-3">
              <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
                <p className="text-sm text-brand-800">
                  🎉 Você está no <strong>teste grátis</strong> do GuiaSense! Aproveite o acesso
                  completo até <strong>{formatDateShort(trialExpiresAt!)}</strong>. Depois desse
                  período, escolha um plano para continuar usando.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-700">
                  Quer garantir seu plano desde já?
                </p>
                <div className="mt-3 space-y-3">
                  <PlanPicker plans={plans} value={selectedPlan} onChange={setSelectedPlan} />
                  <div className="flex flex-wrap gap-2">
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
              </div>
            </div>
          )}

          {planOverdue && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                Sua mensalidade venceu em {formatDateShort(planExpiresAt!)}, mas seu acesso ao
                GuiaSense continua disponível por 10 dias após o vencimento
                {graceDaysLeft !== null && graceDaysLeft > 0 && (
                  <> — você tem mais {graceDaysLeft} {graceDaysLeft === 1 ? "dia" : "dias"} para regularizar o pagamento.</>
                )}
                .
              </p>
              <div className="mt-3 space-y-3">
                <PlanPicker plans={plans} value={selectedPlan} onChange={setSelectedPlan} />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleCheckout} loading={checkoutLoading}>
                    <CreditCard className="h-4 w-4" /> Regularizar com plano{" "}
                    {plans.find((plan) => plan.id === selectedPlan)?.label?.toLowerCase() ?? "selecionado"}
                  </Button>
                  {checkoutPaymentId && (
                    <Button variant="success" onClick={handleSimulate} loading={checkoutLoading}>
                      <CheckCircle2 className="h-4 w-4" /> Confirmar pagamento (teste)
                    </Button>
                  )}
                </div>
              </div>
              {checkoutMessage && (
                <p className="mt-2 text-sm font-medium text-emerald-700">{checkoutMessage}</p>
              )}
            </div>
          )}

          {user?.accessStatus !== "LIBERADO" && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                {user?.accessStatus === "CANCELADO"
                  ? "Sua assinatura foi cancelada. Ao assinar novamente, o acesso é liberado."
                  : user?.accessStatus === "BLOQUEADO"
                    ? "Seu acesso está bloqueado."
                    : trialOverdue
                      ? "Seu teste gratuito de 8 dias terminou. Escolha um plano para continuar usando o GuiaSense."
                      : "Seu acesso está pendente de pagamento."}{" "}
                Ao confirmar o pagamento, o acesso é liberado automaticamente.
              </p>
              <div className="mt-3 space-y-3">
                <PlanPicker plans={plans} value={selectedPlan} onChange={setSelectedPlan} />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleCheckout} loading={checkoutLoading}>
                    <CreditCard className="h-4 w-4" /> Assinar agora
                  </Button>
                  {checkoutPaymentId && (
                    <Button variant="success" onClick={handleSimulate} loading={checkoutLoading}>
                      <CheckCircle2 className="h-4 w-4" /> Confirmar pagamento (teste)
                    </Button>
                  )}
                </div>
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

      <Card className="border-rose-100">
        <CardHeader
          title="Cancelar assinatura"
          subtitle="Encerra seu acesso ao GuiaSense."
        />
        <div className="space-y-3">
          {!cancelConfirming ? (
            <Button variant="danger" onClick={() => setCancelConfirming(true)}>
              <UserX className="h-4 w-4" /> Cancelar minha assinatura
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Tem certeza? Isso cancelará sua assinatura e você perderá o acesso ao GuiaSense.
                Você poderá assinar novamente quando quiser.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="danger" onClick={handleCancelSubscription} loading={cancelLoading}>
                  <UserX className="h-4 w-4" /> Sim, cancelar assinatura
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setCancelConfirming(false)}
                  disabled={cancelLoading}
                >
                  Voltar
                </Button>
              </div>
            </div>
          )}
          {cancelMessage && (
            <p className="text-sm font-medium text-emerald-600">{cancelMessage}</p>
          )}
        </div>
      </Card>
    </div>
  );
}
