"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Sparkles,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/spinner";
import { CategoryIcon } from "@/components/category-icon";
import { TransactionForm } from "@/components/transaction-form";
import { MonthlyEvolution } from "@/components/monthly-evolution";
import { TopExpenses } from "@/components/top-expenses";
import { UpcomingPayments } from "@/components/upcoming-payments";
import { dashboardApi, insightsApi, Overview, Insight } from "@/lib/api";
import { formatBRL, formatDateShort, monthLabel } from "@/lib/format";

function StatCard({
  label,
  value,
  icon,
  accent,
  delta,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  delta?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>{icon}</div>
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
      {delta && <p className="mt-1 text-xs text-slate-400">{delta}</p>}
    </Card>
  );
}

function InsightCard({ insight, expanded = false }: { insight: Insight; expanded?: boolean }) {
  const toneStyles = {
    positive: "border-emerald-100 bg-emerald-50/60",
    attention: "border-amber-100 bg-amber-50/60",
    neutral: "border-slate-100 bg-slate-50/60",
  } as const;
  const toneIcon = {
    positive: <ArrowUpRight className="h-4 w-4 text-emerald-600" />,
    attention: <ArrowDownRight className="h-4 w-4 text-amber-600" />,
    neutral: <Sparkles className="h-4 w-4 text-brand-600" />,
  } as const;

  return (
    <div className={`flex gap-3 rounded-2xl border p-4 ${toneStyles[insight.tone]}`}>
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
        {toneIcon[insight.tone]}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900">{insight.title}</p>
        <p className={`mt-0.5 text-sm text-slate-600 ${expanded ? "leading-relaxed" : ""}`}>
          {insight.message}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  async function load() {
    try {
      const [{ overview }, { insights }] = await Promise.all([
        dashboardApi.overview(),
        insightsApi.list(),
      ]);
      setOverview(overview);
      setInsights(insights);
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes("pagamento")) {
        router.replace("/settings");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handlePaymentsChanged() {
    await load();
    setRefreshKey((key) => key + 1);
  }

  if (loading) return <PageLoader />;
  if (!overview) return null;

  const { totals, recent, series, month } = overview;
  const balancePositive = totals.balance >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Como estão suas finanças
          </h1>
          <p className="text-sm text-slate-500">{monthLabel(month)}</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          Nova movimentação
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Saldo do mês"
          value={formatBRL(totals.balance)}
          icon={<Wallet className="h-4 w-4" />}
          accent={balancePositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}
          delta={`Saldo previsto para o fim do mês: ${formatBRL(totals.projectedBalance)}`}
        />
        <StatCard
          label="Entradas"
          value={formatBRL(totals.receivedIncome)}
          icon={<ArrowUpRight className="h-4 w-4" />}
          accent="bg-emerald-50 text-emerald-600"
          delta={`Falta receber neste mês: ${formatBRL(totals.pendingIncome)}`}
        />
        <StatCard
          label="Saídas"
          value={formatBRL(totals.paidExpense)}
          icon={<ArrowDownRight className="h-4 w-4" />}
          accent="bg-rose-50 text-rose-600"
          delta={`Falta pagar neste mês: ${formatBRL(totals.pendingExpense)}`}
        />
      </div>

      {insights.length > 0 &&
        (() => {
          const closingIndex = insights.findIndex((insight) =>
            insight.title.startsWith("Fechamento de"),
          );
          const projectionIndex = insights.findIndex((insight) =>
            insight.title.startsWith("Previsão do fechamento de") ||
            insight.title.startsWith("Atualização do fechamento de"),
          );
          const closing = closingIndex >= 0 ? insights[closingIndex] : null;
          const projection = projectionIndex >= 0 ? insights[projectionIndex] : null;
          const highlighted = new Set(
            [closingIndex, projectionIndex].filter((index) => index >= 0),
          );
          const regular = insights.filter((_, index) => !highlighted.has(index));

          return (
            <Card>
              <CardHeader
                title="Orientação do GuiaSense"
                subtitle="Resumo simples sobre a sua vida financeira"
                action={<Sparkles className="h-5 w-5 text-brand-500" />}
              />
              {regular.length > 0 && (
                <div className="grid gap-3 lg:grid-cols-3">
                  {regular.map((insight, index) => (
                    <InsightCard key={index} insight={insight} />
                  ))}
                </div>
              )}
              {projection && (
                <div className="mt-3">
                  <InsightCard insight={projection} expanded />
                </div>
              )}
              {closing && (
                <div className="mt-3">
                  <InsightCard insight={closing} expanded />
                </div>
              )}
              <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                Suas orientações financeiras ficam salvas no menu Alertas.
              </div>
            </Card>
          );
        })()}

      <UpcomingPayments onPaid={handlePaymentsChanged} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MonthlyEvolution series={series} />
        </div>

        <TopExpenses initialMonth={overview.month} refreshKey={refreshKey} />
      </div>

        <Card>
          <CardHeader
            title="Movimentações recentes"
            action={
              <Link href="/transactions" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
                Ver todas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {recent.length === 0 ? (
            <EmptyState
              title="Comece registrando suas movimentações"
              description="Quanto mais você registra, mais o GuiaSense consegue te orientar."
              action={
                <Button size="sm" onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4" /> Adicionar
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((transaction) => (
                <li key={transaction.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        transaction.type === "EXPENSE" ? "bg-rose-50" : "bg-emerald-50"
                      }`}
                    >
                      <CategoryIcon
                        name={transaction.category.icon}
                        color={transaction.category.color}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{transaction.description}</p>
                      <p className="text-xs text-slate-400">
                        {transaction.category.name}
                        {transaction.subcategory ? ` · ${transaction.subcategory}` : ""} ·{" "}
                        {formatDateShort(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      transaction.type === "EXPENSE" ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {transaction.type === "EXPENSE" ? "−" : "+"}
                    {formatBRL(Number(transaction.amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
