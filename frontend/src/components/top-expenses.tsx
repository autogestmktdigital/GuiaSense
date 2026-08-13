"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress";
import { CategoryIcon } from "@/components/category-icon";
import { dashboardApi, TopExpense } from "@/lib/api";
import { formatBRL, formatDateShort, monthLabel, shiftMonth } from "@/lib/format";
import { paidInfo } from "@/lib/paid";

const PERIODS: { value: "month" | "quarter" | "semester"; label: string }[] = [
  { value: "month", label: "Mensal" },
  { value: "quarter", label: "Trimestral" },
  { value: "semester", label: "Semestral" },
];

type CategoryItem = {
  id: string;
  description: string | null;
  subcategory: string | null;
  amount: number;
  paid: boolean;
  date: string;
};

export function TopExpenses({ initialMonth, refreshKey = 0 }: { initialMonth: string; refreshKey?: number }) {
  const [month, setMonth] = useState(initialMonth);
  const [period, setPeriod] = useState<"month" | "quarter" | "semester">("month");
  const [data, setData] = useState<{ total: number; topExpenses: TopExpense[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TopExpense | null>(null);
  const [items, setItems] = useState<CategoryItem[] | null>(null);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    dashboardApi
      .topExpenses(month, period)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, period, refreshKey]);

  useEffect(() => {
    if (!selected) {
      setItems(null);
      return;
    }
    let cancelled = false;
    setItemsLoading(true);
    dashboardApi
      .categoryExpenses(month, period, selected.categoryId)
      .then((res) => {
        if (!cancelled) setItems(res.items);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setItemsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, period, selected]);

  function subtitle() {
    if (period === "month") return `Onde estão seus gastos em ${monthLabel(month)}`;
    const from = shiftMonth(month, period === "quarter" ? -2 : -5);
    return `Onde estão seus gastos de ${monthLabel(from)} a ${monthLabel(month)}`;
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Principais gastos"
        subtitle={subtitle()}
        action={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMonth(shiftMonth(month, -1))}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="whitespace-nowrap text-xs font-semibold text-slate-600">
              {monthLabel(month)}
            </span>
            <button
              type="button"
              onClick={() => setMonth(shiftMonth(month, 1))}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {selected ? (
        <div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="mb-3 flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar
          </button>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CategoryIcon name={selected.icon} color={selected.color} />
              <span className="text-sm font-bold text-slate-900">{selected.categoryName}</span>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {formatBRL(selected.amount)}
            </span>
          </div>
          {itemsLoading ? (
            <p className="py-4 text-sm text-slate-400">Carregando…</p>
          ) : items && items.length === 0 ? (
            <EmptyState title="Nenhum lançamento neste período" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {items?.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {item.description || item.subcategory || "Sem descrição"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.subcategory ? `${item.subcategory} · ` : ""}
                      {formatDateShort(item.date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${paidInfo(item).className}`}>
                      {paidInfo(item).label}
                    </span>
                    <span className="text-sm font-bold text-rose-600">
                      −{formatBRL(item.amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : loading ? (
        <p className="text-sm text-slate-400">Carregando…</p>
      ) : data && data.topExpenses.length === 0 ? (
        <EmptyState
          title={
            period === "month" ? "Nenhum gasto cadastrado neste mês" : "Nenhum gasto cadastrado neste período"
          }
        />
      ) : (
        <div className="space-y-4">
          {data?.topExpenses.map((item) => (
            <div key={item.categoryId}>
              <button
                type="button"
                onClick={() => setSelected(item)}
                title={`Ver lançamentos de ${item.categoryName}`}
                className="group mb-1 flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CategoryIcon name={item.icon} color={item.color} />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-brand-600">
                    {item.categoryName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{formatBRL(item.amount)}</span>
                  <span className="text-xs text-slate-400">{item.percent}%</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-brand-500" />
                </div>
              </button>
              <ProgressBar value={item.percent} color={item.color} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-1 border-t border-slate-100 pt-3">
        {PERIODS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setPeriod(option.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              period === option.value
                ? "bg-brand-600 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
