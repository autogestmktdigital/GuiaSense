import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Wallet,
  CalendarClock,
  Search,
  TrendingDown,
  Info,
  AlertTriangle,
  Eye,
  ListChecks,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  PenLine,
  LineChart,
  ChevronDown,
  Shield,
  CreditCard,
  ScrollText,
  Mail,
  Check,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LandingFaq } from "@/components/landing-faq";

const situations = [
  {
    icon: Search,
    title: "Para onde foi meu dinheiro?",
    description:
      "O mês começou bem, mas os gastos foram acontecendo e ficou difícil entender para onde o dinheiro foi.",
    color: "bg-sky-50 text-sky-600",
  },
  {
    icon: CalendarClock,
    title: "O que ainda falta pagar?",
    description:
      "Contas espalhadas durante o mês tornam fácil esquecer o que ainda está por vencer.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: TrendingDown,
    title: "Será que estou gastando mais?",
    description:
      "Sem comparar seus gastos, pequenas mudanças podem passar despercebidas até começarem a pesar no orçamento.",
    color: "bg-rose-50 text-rose-600",
  },
];

const benefits = [
  {
    icon: Eye,
    title: "Veja seu mês de uma vez",
    description:
      "Entradas, saídas e saldo organizados para você entender rapidamente como está sua situação.",
    color: "bg-brand-50 text-brand-600",
  },
  {
    icon: ListChecks,
    title: "Saiba o que ainda vem pela frente",
    description:
      "Acompanhe suas contas e veja o que ainda precisa ser pago nos próximos dias.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: TrendingUp,
    title: "Entenda seus gastos",
    description:
      "Veja onde seu dinheiro está sendo usado e acompanhe como seus gastos mudam ao longo do tempo.",
    color: "bg-emerald-50 text-emerald-600",
  },
];

const demoPayments = [
  { day: "03 set", name: "Energia", amount: "R$ 178,40" },
  { day: "05 set", name: "Internet", amount: "R$ 129,90" },
  { day: "08 set", name: "Cartão de crédito", amount: "R$ 320,00" },
];

const demoExpenses = [
  { name: "Alimentação", amount: "R$ 780,00", percent: 42, bar: "bg-amber-500" },
  { name: "Moradia", amount: "R$ 1.240,00", percent: 35, bar: "bg-violet-500" },
  { name: "Transporte", amount: "R$ 320,00", percent: 9, bar: "bg-sky-500" },
];

const demoMonths = [
  { label: "Jun", amount: "+R$ 890" },
  { label: "Jul", amount: "+R$ 1.120" },
  { label: "Ago", amount: "+R$ 1.240" },
];

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Crie sua conta",
    description:
      "Informe seus dados básicos e comece seu teste gratuito. Não precisa cadastrar cartão de crédito.",
    color: "bg-brand-50 text-brand-600",
  },
  {
    number: "02",
    icon: PenLine,
    title: "Registre suas movimentações",
    description:
      "Adicione o que entra, o que sai e suas contas do dia a dia de forma simples.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    number: "03",
    icon: LineChart,
    title: "Acompanhe seu mês",
    description:
      "Veja sua situação, acompanhe seus gastos e receba alertas e orientações quando algo merecer sua atenção.",
    color: "bg-violet-50 text-violet-600",
  },
];

const trust = [
  {
    icon: Shield,
    title: "Você mantém o controle",
    description:
      "O GuiaSense não movimenta seu dinheiro e não precisa acessar sua conta bancária. Você registra as informações que deseja acompanhar.",
  },
  {
    icon: CreditCard,
    title: "Teste sem cartão de crédito",
    description:
      "Experimente o GuiaSense por 8 dias sem cadastrar cartão. Você só escolhe um plano se decidir continuar.",
  },
  {
    icon: ScrollText,
    title: "Privacidade com transparência",
    description:
      "Seus dados são tratados conforme nossa Política de Privacidade, com informações claras sobre como o GuiaSense utiliza os dados necessários para prestar o serviço.",
  },
];

const plans = [
  {
    name: "Mensal",
    price: "R$ 24,90",
    period: "por mês",
    equivalent: null,
    deal: null,
    description: "Para quem prefere continuar mês a mês.",
  },
  {
    name: "Semestral",
    price: "R$ 139,00",
    period: "por 6 meses",
    equivalent: "Equivale a R$ 23,17/mês",
    deal: null,
    description: "Mais praticidade para os próximos meses.",
  },
  {
    name: "Anual",
    price: "R$ 249,00",
    period: "por 12 meses",
    equivalent: "Equivale a R$ 20,75/mês",
    deal: "12 meses pelo preço de 10",
    description: "A melhor condição para acompanhar suas finanças durante todo o ano.",
    featured: true,
  },
];

const planBenefits = [
  "Controle de entradas e saídas",
  "Contas e compromissos do mês",
  "Visão dos principais gastos",
  "Acompanhamento da evolução financeira",
  "Alertas e orientações do GuiaSense",
  "Acesso pelo celular e computador",
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
              Testar grátis
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pt-10 pb-20 sm:px-6 lg:pt-24 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              8 dias grátis · Sem cartão de crédito
            </div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Entenda para onde seu dinheiro está indo — e saiba o que fazer{" "}
              <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
                antes do fim do mês
              </span>
              .
            </h1>
            <p className="mt-4 max-w-lg text-lg text-slate-600">
              O GuiaSense organiza suas entradas, gastos e contas a vencer e transforma seus
              números em alertas e orientações simples. Sem planilhas e sem precisar entender de
              finanças.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700 sm:w-auto"
              >
                Testar grátis por 8 dias
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="mt-3 text-sm text-slate-500">
                <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Sem cartão de crédito</span>
                  <span className="text-slate-300">•</span>
                  <span>Acesso imediato</span>
                  <span className="text-slate-300">•</span>
                  <span>Você só assina se quiser continuar</span>
                </span>
              </p>
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
                  <span className="font-medium text-slate-700">Energia</span>
                  <span className="font-bold text-slate-900">R$ 178,40</span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-amber-600">Vence amanhã.</p>
                <div className="my-2 border-t border-slate-100" />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Internet</span>
                  <span className="font-bold text-slate-900">R$ 129,90</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Vence em 3 dias.</p>
              </div>
              <div className="mt-3 rounded-2xl bg-brand-600 p-4 text-white shadow-lg shadow-brand-600/20">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-brand-100">
                      Orientação do GuiaSense
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/95">
                      Se continuar nesse ritmo, você pode guardar cerca de R$ 380 este mês.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Controlar seu dinheiro não deveria ser complicado.
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Na correria do dia a dia, é fácil perder de vista pequenas coisas que fazem diferença
            no fim do mês.
          </p>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-6">
          {situations.map((situation) => (
            <div
              key={situation.title}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${situation.color}`}
              >
                <situation.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{situation.title}</h3>
              <p className="mt-1.5 text-base text-slate-600">{situation.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-lg font-semibold text-slate-800">
          É aqui que o{" "}
          <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text font-bold text-transparent">
            GuiaSense
          </span>{" "}
          começa a ajudar.
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-2 lg:items-center">
          <div className="lg:self-start">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Você registra. O GuiaSense ajuda a{" "}
              <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
                perceber o que importa
              </span>
              .
            </h2>
            <p className="mt-4 max-w-lg text-lg text-slate-600">
              Com base nas suas movimentações, o GuiaSense acompanha o que está acontecendo e traz
              alertas e orientações simples para ajudar você a tomar decisões melhores ao longo do
              mês.
            </p>
          </div>

          <div className="space-y-3 rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-brand-50 p-6 shadow-xl">
            <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    Conta próxima do vencimento
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Sua conta de energia vence em breve. Vale conferir se ela já está programada
                    para pagamento.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <Info className="h-5 w-5 text-sky-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">Seus gastos mudaram</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Os gastos com alimentação aumentaram em relação aos últimos meses. Pode valer a
                    pena dar uma olhada nessa categoria.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-brand-600 p-5 text-white shadow-lg shadow-brand-600/25">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                  <Sparkles className="h-4 w-4" />
                </span>
                <p className="text-[11px] font-bold uppercase tracking-wide text-brand-100">
                  Orientação do GuiaSense
                </p>
              </div>
              <p className="mt-3 text-base font-semibold leading-relaxed">
                Seu mês está caminhando bem.
              </p>
              <p className="mt-1 text-sm text-white/90">
                Mantendo esse ritmo, você pode chegar ao fim do mês com dinheiro sobrando.
              </p>
            </div>
          </div>

          <div>
            <p className="max-w-lg text-lg text-slate-700">
              Mais do que registrar números, o GuiaSense ajuda você a{" "}
              <span className="font-semibold text-brand-600">
                entender o que está acontecendo
              </span>{" "}
              com eles.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700 sm:w-auto"
              >
                Testar grátis por 8 dias
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="mt-3 text-sm text-slate-500">Sem cartão de crédito</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Seu mês financeiro,{" "}
            <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
              mais fácil de entender
            </span>
            .
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Veja o que entrou, o que saiu, o que ainda precisa pagar e como seus gastos estão
            evoluindo — tudo de forma simples e visual.
          </p>
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5 shadow-xl sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">Como estão suas finanças</p>
                  <p className="text-xs text-slate-500">Agosto de 2026</p>
                </div>
                <span className="hidden items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white sm:inline-flex">
                  <Plus className="h-3.5 w-3.5" />
                  Nova movimentação
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium text-slate-500 sm:text-xs">Saldo do mês</p>
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 sm:h-7 sm:w-7">
                      <Wallet className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-extrabold text-slate-900 sm:text-lg">
                    R$ 1.240,00
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium text-slate-500 sm:text-xs">Entradas</p>
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 sm:h-7 sm:w-7">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-extrabold text-slate-900 sm:text-lg">
                    R$ 4.800,00
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium text-slate-500 sm:text-xs">Saídas</p>
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 text-rose-600 sm:h-7 sm:w-7">
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-extrabold text-slate-900 sm:text-lg">
                    R$ 3.560,00
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">
                    O que eu preciso pagar em breve?
                  </p>
                  <ul className="mt-2 divide-y divide-slate-100">
                    {demoPayments.map((payment) => (
                      <li
                        key={payment.name}
                        className="flex items-center justify-between gap-2 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="text-xs font-bold text-slate-700">
                            {payment.day}
                          </span>
                          <p className="truncate text-sm font-medium text-slate-700">
                            {payment.name}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-rose-600">
                          −{payment.amount}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Principais gastos</p>
                  <div className="mt-3 space-y-3">
                    {demoExpenses.map((expense) => (
                      <div key={expense.name}>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-slate-700">
                            {expense.name}
                          </span>
                          <span className="shrink-0 text-sm font-bold text-slate-900">
                            {expense.amount}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-1.5 rounded-full ${expense.bar}`}
                            style={{ width: `${expense.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-900">Evolução financeira</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {demoMonths.map((month) => (
                    <div
                      key={month.label}
                      className="rounded-xl bg-slate-50 p-2 text-center sm:p-2.5"
                    >
                      <p className="text-[10px] font-semibold text-slate-500 sm:text-xs">
                        {month.label}
                      </p>
                      <p className="mt-0.5 text-xs font-extrabold text-emerald-600 sm:text-sm">
                        {month.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${benefit.color}`}
                >
                  <benefit.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">{benefit.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{benefit.description}</p>
                </div>
              </div>
            ))}
            <p className="pt-4 text-lg text-slate-700">
              Você não precisa fazer contas para{" "}
              <span className="font-semibold text-brand-600">entender suas contas.</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Começar é{" "}
            <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
              simples
            </span>
            .
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Em poucos minutos você organiza as primeiras informações e já começa a enxergar seu mês
            com mais clareza.
          </p>
        </div>

        <div className="relative mt-12">
          <div className="pointer-events-none absolute left-[14%] right-[14%] top-8 hidden border-t-2 border-dashed border-brand-200 lg:block" />
          <div className="grid items-start gap-8 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="contents">
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                    <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
                      {step.number}
                    </span>
                  </div>
                  <div
                    className={`mt-4 flex h-12 w-12 items-center justify-center rounded-2xl ${step.color}`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-sm text-slate-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex justify-center lg:hidden">
                    <ChevronDown className="h-4 w-4 text-brand-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/register"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700 sm:w-auto"
          >
            Testar grátis por 8 dias
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Sem cartão de crédito • Leva menos de 1 minuto para criar sua conta
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Você começa simples. O GuiaSense ajuda você a acompanhar o restante.
          </p>
        </div>
      </section>

      <section className="bg-brand-50/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Seu dinheiro é pessoal.{" "}
              <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
                Seus dados também.
              </span>
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              O GuiaSense foi pensado para ajudar você a acompanhar suas finanças com transparência
              e respeito à sua privacidade.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:gap-6">
            {trust.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center rounded-3xl bg-white/90 p-6 text-center shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                {item.title === "Privacidade com transparência" && (
                  <a
                    href="/privacidade"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
                  >
                    Ver Política de Privacidade
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100 sm:flex-row sm:gap-6 sm:text-left">
              <div>
                <p className="font-semibold text-slate-800">
                  GuiaSense é um produto da DevCerto Tecnologia.
                </p>
                <p className="mt-1 text-sm text-slate-500">CNPJ: 68.827.410/0001-44</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-brand-600" />
                <span className="text-slate-600">Dúvidas sobre privacidade?</span>
                <a
                  href="mailto:lgpd@devcerto.com"
                  className="font-semibold text-brand-600 hover:underline"
                >
                  lgpd@devcerto.com
                </a>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-base font-medium text-slate-600">
            Você decide quais informações financeiras registrar. E você decide se quer continuar.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Escolha como quer{" "}
            <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
              continuar
            </span>
            .
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Teste o GuiaSense grátis por 8 dias. Se fizer sentido para você, escolha o período que
            combina melhor com sua rotina.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Todos os planos incluem acesso completo ao GuiaSense.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl bg-white p-6 ${
                plan.featured
                  ? "border-2 border-brand-600 shadow-xl ring-1 ring-brand-600/20"
                  : "border border-slate-100 shadow-sm"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-brand-600 to-violet-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                  Melhor custo-benefício
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  {plan.price}
                </span>
                <span className="text-sm text-slate-500"> {plan.period}</span>
              </div>
              {plan.equivalent && (
                <p className="mt-1 text-xs text-slate-500">{plan.equivalent}</p>
              )}
              {plan.deal && (
                <p className="mt-1 text-xs font-medium text-emerald-600">{plan.deal}</p>
              )}
              <p className="mt-3 text-sm text-slate-600">{plan.description}</p>
              <div className="mt-6 flex-1" />
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700"
              >
                Testar grátis
              </Link>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-slate-100 bg-slate-50/60 p-6 sm:p-8">
          <p className="text-center text-base font-bold text-slate-800">
            Em qualquer plano, você tem acesso a:
          </p>
          <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {planBenefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="h-3 w-3" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 text-center text-lg font-bold text-slate-900">
          Os primeiros 8 dias são grátis.
        </p>
        <p className="mt-1 text-center text-sm text-slate-500">
          Sem cartão de crédito para começar.
        </p>
        <p className="mt-4 text-center text-sm text-slate-500">
          Comece sem pagar nada. Você escolhe se quer continuar depois do período gratuito.
        </p>
      </section>

      <LandingFaq />

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-violet-600">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -bottom-40 h-80 w-80 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              Pronto para entender melhor o seu mês?
            </h2>
            <p className="mt-4 text-lg text-brand-100">
              Comece agora e experimente o GuiaSense gratuitamente por 8 dias.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-white px-8 text-base font-bold text-brand-700 shadow-xl shadow-brand-900/25 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
            >
              Testar grátis por 8 dias
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-5 text-sm text-brand-100">
              Sem cartão de crédito • Leva menos de 1 minuto para criar sua conta
            </p>
            <p className="mt-2 text-sm text-brand-200">
              Você só escolhe um plano se decidir continuar.
            </p>
          </div>
        </div>
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
        <div className="mt-3 text-center">
          <a
            href="/privacidade"
            className="text-xs text-slate-400 underline-offset-4 hover:text-slate-600 hover:underline"
          >
            Política de Privacidade
          </a>
        </div>
      </footer>
    </div>
  );
}
