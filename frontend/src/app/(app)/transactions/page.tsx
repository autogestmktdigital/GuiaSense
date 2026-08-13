"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/spinner";
import { CategoryIcon } from "@/components/category-icon";
import { TransactionForm } from "@/components/transaction-form";
import { Transaction, TransactionType, transactionsApi } from "@/lib/api";
import { currentMonth, formatBRL, formatDate, monthLabel } from "@/lib/format";
import { paidInfo } from "@/lib/paid";

type Filter = "ALL" | TransactionType;

export default function TransactionsPage() {
  const [month, setMonth] = useState(currentMonth());
  const [filter, setFilter] = useState<Filter>("ALL");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { transactions } = await transactionsApi.list(month);
      setTransactions(transactions);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [month]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  async function handleDelete(transaction: Transaction) {
    if (!window.confirm(`Excluir "${transaction.description}"?`)) return;
    await transactionsApi.remove(transaction.id);
    load();
  }

  async function handleTogglePaid(transaction: Transaction) {
    await transactionsApi.update(transaction.id, { paid: !transaction.paid });
    load();
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(transaction: Transaction) {
    setEditing(transaction);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Movimentações</h1>
          <p className="text-sm text-slate-500">Entradas e saídas do mês</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova movimentação
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-400">Entradas</p>
          <p className="text-lg font-extrabold text-emerald-600">{formatBRL(totals.income)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-400">Saídas</p>
          <p className="text-lg font-extrabold text-rose-600">{formatBRL(totals.expense)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-400">Saldo</p>
          <p className="text-lg font-extrabold text-slate-900">{formatBRL(totals.balance)}</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:border-brand-500 focus:outline-none"
          />
          <div className="ml-auto flex rounded-xl bg-slate-100 p-1">
            {(["ALL", "EXPENSE", "INCOME"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                {f === "ALL" ? "Todas" : f === "EXPENSE" ? "Saídas" : "Entradas"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight className="h-6 w-6" />}
          title={transactions.length === 0 ? "Nenhuma movimentação em " + monthLabel(month) : "Nada por aqui"}
          description="Registre suas entradas e saídas para acompanhar seu mês."
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Adicionar movimentação
            </Button>
          }
        />
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-slate-100">
            {filtered.map((transaction) => (
              <li key={transaction.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    transaction.type === "EXPENSE" ? "bg-rose-50" : "bg-emerald-50"
                  }`}
                >
                  <CategoryIcon name={transaction.category.icon} color={transaction.category.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-slate-400">
                    {transaction.category.name}
                    {transaction.subcategory ? ` · ${transaction.subcategory}` : ""} ·{" "}
                    {formatDate(transaction.date)}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-bold ${
                    transaction.type === "EXPENSE" ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {transaction.type === "EXPENSE" ? "−" : "+"}
                  {formatBRL(Number(transaction.amount))}
                </span>
                <button
                  type="button"
                  onClick={() => handleTogglePaid(transaction)}
                  title={transaction.paid ? "Marcar como pendente" : "Marcar como pago"}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors hover:brightness-95 ${paidInfo(transaction).className}`}
                >
                  {paidInfo(transaction).label}
                </button>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => openEdit(transaction)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={load}
        transaction={editing}
      />
    </div>
  );
}
