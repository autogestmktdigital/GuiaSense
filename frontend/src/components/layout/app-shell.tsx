"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  Shield,
  Users,
  Wallet,
  CalendarDays,
  Clock,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/ui/logo";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { paymentsApi, Plan, PlanId } from "@/lib/api";
import { formatBRL } from "@/lib/format";

type NavItem = {
  kind?: "section";
  href?: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/transactions", label: "Movimentações", icon: ArrowLeftRight },
  { href: "/alerts", label: "Alertas", icon: Bell },
  { href: "/settings", label: "Configurações", icon: Settings },
];

function useNavItems(): NavItem[] {
  const { user } = useAuth();
  const items = [...navItems];
  if (user?.role === "ADMIN") {
    items.push(
      { kind: "section", label: "Administração" },
      { href: "/admin", label: "Painel", icon: Shield },
      { href: "/admin/users", label: "Usuários", icon: Users },
      { href: "/admin/users-by-month", label: "Usuários por mês", icon: CalendarDays },
      { href: "/admin/revenue", label: "Receita", icon: Wallet },
    );
  }
  return items;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = useNavItems();
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        if (item.kind === "section") {
          return (
            <p
              key={item.label}
              className="mt-4 mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400"
            >
              {item.label}
            </p>
          );
        }
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href!}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-50 text-brand-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {item.icon && <item.icon className="h-5 w-5" />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccessGate() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<{
    mode: "simulated" | "mercadopago";
    paymentId: string;
    initPoint?: string;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("mensal");

  useEffect(() => {
    paymentsApi
      .plans()
      .then((data) => setPlans(data.plans))
      .catch(() => {});
  }, []);

  const status = user?.accessStatus ?? "PAGAMENTO_PENDENTE";

  const trialExpired =
    user?.trialExpiresAt != null && new Date(user.trialExpiresAt).getTime() < Date.now();

  const config =
    status === "BLOQUEADO"
      ? {
          icon: Ban,
          title: "Acesso bloqueado",
          description: "Seu acesso está bloqueado. Entre em contato para regularizar sua situação.",
          accent: "bg-rose-100 text-rose-600",
        }
      : status === "CANCELADO"
        ? {
            icon: Ban,
            title: "Assinatura cancelada",
            description: "Sua assinatura foi cancelada. Renove para continuar usando o GuiaSense.",
            accent: "bg-slate-100 text-slate-600",
          }
        : trialExpired
          ? {
              icon: Clock,
              title: "Seu teste gratuito terminou",
              description: "Aproveite o GuiaSense assinando um plano.",
              accent: "bg-amber-100 text-amber-600",
            }
          : {
              icon: Clock,
              title: "Pagamento pendente",
              description: "Assine o GuiaSense para liberar todas as funcionalidades.",
              accent: "bg-amber-100 text-amber-600",
            };

  async function handleCheckout() {
    setLoading(true);
    setMessage("");
    try {
      const result = await paymentsApi.checkout(selectedPlan);
      setCheckoutResult(result);
      if (result.mode === "mercadopago" && result.initPoint) {
        window.location.href = result.initPoint;
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível gerar o pagamento.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulate() {
    if (!checkoutResult) return;
    setLoading(true);
    setMessage("");
    try {
      await paymentsApi.simulate(checkoutResult.paymentId);
      setMessage("Pagamento confirmado! Seu acesso foi liberado.");
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao confirmar pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${config.accent}`}>
              <config.icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{config.title}</h2>
              <p className="text-sm text-slate-500">{config.description}</p>
            </div>
          </div>

          {status !== "BLOQUEADO" && (
            <div className="space-y-3">
              <div
                className={`rounded-xl p-4 text-sm text-slate-600 ${
                  status === "CANCELADO" ? "bg-slate-50" : "bg-slate-50"
                }`}
              >
                <p className="font-semibold text-slate-900">
                  {status === "CANCELADO"
                    ? "Sua assinatura não está ativa. Escolha um plano para voltar a usar o GuiaSense."
                    : "Escolha um plano para acessar o GuiaSense."}
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {plans.map((plan) => {
                    const active = selectedPlan === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlan(plan.id)}
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
                        <p className="mt-1 text-sm font-extrabold text-brand-600">
                          {formatBRL(plan.priceBRL)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">{plan.note}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button fullWidth size="lg" onClick={handleCheckout} loading={loading}>
                <ShieldCheck className="h-5 w-5" />
                {status === "CANCELADO"
                  ? "Assinar novamente"
                  : plans.find((plan) => plan.id === selectedPlan)
                    ? `Assinar ${plans.find((plan) => plan.id === selectedPlan)?.label}`
                    : "Quero liberar meu acesso"}
              </Button>

              {checkoutResult?.mode === "simulated" && (
                <Button fullWidth variant="success" onClick={handleSimulate} loading={loading}>
                  <CheckCircle2 className="h-5 w-5" />
                  Simular confirmação (dev)
                </Button>
              )}

              {message && (
                <p className="text-center text-sm font-medium text-emerald-600">{message}</p>
              )}

              <p className="text-center text-xs text-slate-400">
                Pagamento processado com segurança pelo Mercado Pago.
              </p>
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <Link href="/settings" className="flex-1">
              <Button variant="secondary" fullWidth>
                Configurações
              </Button>
            </Link>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) return null;

  if (user.accessStatus !== "LIBERADO") {
    return <AccessGate />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
        <div className="mb-8 px-2">
          <Logo />
        </div>
        <NavLinks />
        <div className="mt-auto px-2">
          <div className="rounded-xl bg-brand-50 p-3">
            <p className="text-xs font-semibold text-brand-700">Assinatura ativa</p>
            <p className="text-xs text-brand-500">Seu plano está em dia.</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-8">
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Logo size="sm" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden text-sm font-semibold text-slate-700 sm:block">
              {user.name.split(" ")[0]}
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white p-4 shadow-xl">
            <div className="mb-6 px-2">
              <Logo />
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
            <button
              type="button"
              onClick={logout}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-4">
          {navItems.filter((item) => item.href).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href!}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                  active ? "text-brand-600" : "text-slate-500"
                }`}
              >
                {item.icon && <item.icon className="h-5 w-5" />}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
