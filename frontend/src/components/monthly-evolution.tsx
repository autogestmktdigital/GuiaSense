"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { formatBRL, monthLabel } from "@/lib/format";

type SeriesItem = { month: string; income: number; expense: number };

type Status = "positive" | "balanced" | "attention" | "empty";

function getStatus(income: number, expense: number): { status: Status; label: string } {
  if (income === 0 && expense === 0) {
    return { status: "empty", label: "Sem movimentações" };
  }
  const balance = income - expense;
  if (balance > 0) return { status: "positive", label: "Mês positivo" };
  if (balance < 0) return { status: "attention", label: "Mês de atenção" };
  return { status: "balanced", label: "Mês equilibrado" };
}

function getTrend(
  months: SeriesItem[],
): { icon: React.ReactNode; word: string; text: string } {
  const withData = months.filter((m) => m.income > 0 || m.expense > 0);
  if (withData.length < 2) {
    return {
      icon: <Minus className="h-4 w-4" />,
      word: "",
      text: "Ainda não há histórico suficiente para identificar uma tendência.",
    };
  }
  const [recent, prev] = withData;
  const diff = recent.income - recent.expense - (prev.income - prev.expense);
  if (diff > 0.01)
    return { icon: <ArrowUpRight className="h-4 w-4" />, word: "melhora", text: "em relação ao mês anterior." };
  if (diff < -0.01)
    return { icon: <ArrowDownRight className="h-4 w-4" />, word: "piora", text: "em relação ao mês anterior." };
  return { icon: <Minus className="h-4 w-4" />, word: "estável", text: "em relação ao mês anterior." };
}

function formatSigned(value: number): string {
  if (value > 0) return `+ ${formatBRL(value)}`;
  if (value < 0) return `- ${formatBRL(Math.abs(value))}`;
  return formatBRL(0);
}

const statusStyle: Record<
  Status,
  {
    icon: React.ReactNode;
    circle: string;
    iconBox: string;
    text: string;
    amount: string;
  }
> = {
  positive: {
    icon: <ArrowUpRight className="h-5 w-5" />,
    circle: "bg-[#eaf8ef]",
    iconBox: "text-emerald-500 border-emerald-500",
    text: "text-emerald-500",
    amount: "bg-[#eaf8ef] text-emerald-500",
  },
  balanced: {
    icon: <Minus className="h-5 w-5" />,
    circle: "bg-[#fdf5e5]",
    iconBox: "text-amber-500 border-amber-500",
    text: "text-amber-500",
    amount: "bg-[#fdf5e5] text-amber-500",
  },
  attention: {
    icon: <ArrowDownRight className="h-5 w-5" />,
    circle: "bg-[#fdecec]",
    iconBox: "text-red-500 border-red-500",
    text: "text-red-500",
    amount: "bg-[#fdecec] text-red-500",
  },
  empty: {
    icon: <Minus className="h-5 w-5" />,
    circle: "bg-slate-100",
    iconBox: "text-slate-400 border-slate-300",
    text: "text-slate-400",
    amount: "bg-slate-100 text-slate-400",
  },
};

function TimelineRow({ month, income, expense }: SeriesItem) {
  const { status, label } = getStatus(income, expense);
  const style = statusStyle[status];
  const balance = income - expense;

  return (
    <div className="relative mb-3 grid grid-cols-[44px_36px_1fr_auto] items-center gap-3">
      <div
        className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-bold text-slate-900 ${style.circle}`}
      >
        {monthLabel(month).slice(0, 3)}
      </div>
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg border-2 bg-white ${style.iconBox}`}
      >
        {style.icon}
      </div>
      <div className="flex items-center gap-2 truncate">
        <h3 className="text-[15px] font-semibold text-slate-900">{monthLabel(month)}</h3>
        <p className={`truncate text-xs font-semibold ${style.text}`}>{label}</p>
      </div>
      <div
        className={`justify-self-end rounded-lg px-2.5 py-1.5 text-[13px] font-bold min-w-[104px] text-center ${style.amount}`}
      >
        {formatSigned(balance)}
      </div>
    </div>
  );
}

const ranges = [
  { value: 3, label: "Trimestral" },
  { value: 6, label: "Semestral" },
  { value: 12, label: "Anual" },
];

const legendItems = [
  { status: "positive" as Status, label: "Mês positivo", text: "Saldo acima de zero" },
  { status: "balanced" as Status, label: "Mês equilibrado", text: "Saldo igual a zero" },
  { status: "attention" as Status, label: "Mês de atenção", text: "Saldo abaixo de zero" },
];

export function MonthlyEvolution({ series }: { series: SeriesItem[] }) {
  const [range, setRange] = useState(6);

  const months = [...series].slice(-range).reverse();
  const firstDataIndex = months.findLastIndex((m) => m.income > 0 || m.expense > 0);
  const visible = firstDataIndex >= 0 ? months.slice(0, firstDataIndex + 1) : months;
  const hasData = months.some((m) => m.income > 0 || m.expense > 0);
  const trend = getTrend(months);

  return (
    <div className="rounded-[24px] border border-[#ececf5] bg-white p-6 shadow-[0_12px_30px_rgba(82,63,105,0.08)] sm:p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Evolução financeira</h2>
          <p className="text-sm text-slate-500">acompanhe sua trajetória por período</p>
        </div>
        <div className="flex gap-0.5 rounded-xl border border-[#d9dceb] bg-white p-0.5 sm:w-full sm:justify-between">
          {ranges.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-1 ${
                range === r.value
                  ? "bg-gradient-to-r from-[#5b4df6] to-brand-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)]"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <p className="text-sm text-slate-500">
          Ainda não há movimentações suficientes para acompanhar sua evolução.
        </p>
      ) : (
        <>
          <div
            className={`relative mb-5 ${range === 12 ? "max-h-96 overflow-y-auto pr-1" : ""}`}
          >
            <div
              className="absolute bottom-2 left-[22px] top-2 w-0.5"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, #c7c3ff 0px, #c7c3ff 8px, transparent 8px, transparent 16px)",
              }}
            />
            {visible.map((item) => (
              <TimelineRow key={item.month} {...item} />
            ))}
          </div>

          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#e3dcff] bg-[#f5f2ff] px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ebe6ff] font-bold text-[#5b4df6]">
              {trend.icon}
            </div>
            <p className="text-sm text-slate-600">
              Tendência atual:{" "}
              {trend.word && (
                <strong className="text-[#5b4df6]">{trend.word}</strong>
              )}{" "}
              {trend.text}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-[#ececf5] bg-white p-4">
            {legendItems.map((item) => {
              const style = statusStyle[item.status];
              return (
                <div key={item.status} className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${style.circle} ${style.text}`}
                  >
                    {style.icon}
                  </div>
                  <div>
                    <strong className="block text-sm text-slate-900">{item.label}</strong>
                    <span className="text-xs text-slate-500">{item.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
