import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Wallet,
  BellRing,
  CalendarClock,
  PieChart,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const features = [
  {
    icon: Wallet,
    title: "Entradas e saídas simples",
    description: "Cadastre seus ganhos e gastos em poucos segundos, sem planilhas complicadas.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: CalendarClock,
    title: "Pagamentos em dia",
    description: "Saiba o que precisa pagar antes do vencimento e evite contas atrasadas.",
    color: "bg-brand-50 text-brand-600",
  },
  {
    icon: BellRing,
    title: "Alertas que ajudam",
    description: "Avisos quando seus gastos aumentam ou algo precisa da sua atenção.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Sparkles,
    title: "Orientações inteligentes",
    description: "Explicações fáceis sobre a sua vida financeira e o que merece atenção.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: PieChart,
    title: "Resumo visual",
    description: "Cards e gráficos simples para você entender tudo rapidinho.",
    color: "bg-sky-50 text-sky-600",
  },
  {
    icon: Smartphone,
    title: "No celular e no computador",
    description: "Use onde preferir, com a mesma experiência simples e rápida.",
    color: "bg-rose-50 text-rose-600",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 hover:bg-brand-700"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pt-16 pb-20 sm:px-6 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              8 dias grátis para testar
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Suas finanças com{" "}
              <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
                clareza
              </span>{" "}
              e sem complicação
            </h1>
            <p className="mt-4 max-w-lg text-lg text-slate-600">
              Registre entradas e saídas, receba alertas e orientações simples para cuidar do seu
              dinheiro. Você não precisa entender de finanças.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700"
              >
                Começar agora
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Já tenho conta
              </Link>
            </div>
            <div className="mt-6 space-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Seus dados financeiros são protegidos e privados.
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-600" />
                Teste grátis por 8 dias, sem cartão de crédito.
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-brand-50 p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Saldo do mês</p>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  +R$ 1.240,00
                </span>
              </div>
              <div className="mb-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-medium text-slate-400">Entradas</p>
                  <p className="text-sm font-bold text-emerald-600">R$ 4.800</p>
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-medium text-slate-400">Saídas</p>
                  <p className="text-sm font-bold text-rose-500">R$ 3.560</p>
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-medium text-slate-400">Guardado</p>
                  <p className="text-sm font-bold text-brand-600">26%</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="mb-2 text-xs font-semibold text-slate-600">A pagar em breve</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Internet</span>
                  <span className="font-bold text-slate-900">R$ 129,90</span>
                </div>
                <p className="mt-1 text-[11px] text-amber-600">Vence em 3 dias.</p>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-brand-600 p-3 text-white">
                <Sparkles className="h-4 w-4 shrink-0" />
                <p className="text-xs">
                  Se continuar nesse ritmo, você pode guardar cerca de R$ 380 este mês. 
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50/60 py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Tudo o que você precisa, sem poluição
            </h2>
            <p className="mt-3 text-slate-600">
              O GuiaSense transforma seus dados em informações claras — e diz o que merece a sua
              atenção.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Organize suas finanças em poucos minutos
        </h2>
        <div className="mx-auto mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700"
          >
            Criar minha conta
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          8 dias grátis para testar. Acesso imediato. Cancelamento quando quiser.
        </p>
      </section>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <p className="text-xs text-slate-400">
              DevCerto Tecnologia LTDA - CNPJ: 68.827.410/0001-44
            </p>
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} GuiaSense. Seu guia financeiro.
          </p>
        </div>
      </footer>
    </div>
  );
}
