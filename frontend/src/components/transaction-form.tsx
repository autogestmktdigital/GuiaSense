"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  Category,
  categoriesApi,
  Transaction,
  transactionsApi,
  TransactionType,
} from "@/lib/api";
import { maskCurrency } from "@/lib/format";
import { subCategoriesFor } from "@/lib/subcategories";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  transaction?: Transaction | null;
};

export function TransactionForm({ open, onClose, onSaved, transaction }: Props) {
  const { showToast } = useToast();
  const [type, setType] = useState<TransactionType | null>(null);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [paid, setPaid] = useState(false);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repetitions, setRepetitions] = useState(2);
  const [categoriesByType, setCategoriesByType] = useState<Record<TransactionType, Category[]>>({
    EXPENSE: [],
    INCOME: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (transaction) {
      setType(transaction.type);
      setAmount(Number(transaction.amount));
      setDate(new Date(transaction.date).toISOString().slice(0, 10));
      setCategoryId(transaction.categoryId);
      setSubcategory(transaction.subcategory ?? "");
      setDescription(transaction.description);
      setPaid(transaction.paid);
    } else {
      setType(null);
      setAmount(0);
      setDate(new Date().toISOString().slice(0, 10));
      setCategoryId("");
      setSubcategory("");
      setDescription("");
      setPaid(false);
    }
    setRepeatEnabled(false);
    setRepetitions(2);
    setLoading(false);
  }, [open, transaction]);

  useEffect(() => {
    if (!open) return;
    Promise.all([categoriesApi.list("EXPENSE"), categoriesApi.list("INCOME")])
      .then(([expense, income]) => {
        setCategoriesByType({
          EXPENSE: expense.categories,
          INCOME: income.categories,
        });
        if (transaction) {
          const list = transaction.type === "INCOME" ? income.categories : expense.categories;
          const exists = list.some((c) => c.id === transaction.categoryId);
          if (!exists) setCategoryId("");
        }
      })
      .catch(() => {});
  }, [open, transaction]);

  const categories = type ? categoriesByType[type] : [];

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId) ?? null,
    [categories, categoryId],
  );

  const subcategories = useMemo(
    () => (selectedCategory ? subCategoriesFor(selectedCategory.name) : []),
    [selectedCategory],
  );

  function handleTypeChange(next: TransactionType) {
    if (next === type) return;
    setType(next);
    setCategoryId("");
    setSubcategory("");
  }

  function handleCategoryChange(next: string) {
    setCategoryId(next);
    setSubcategory("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!type) {
      setError("Escolha o tipo de movimentação.");
      return;
    }
    if (!amount || amount <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }
    if (!categoryId || !subcategory) {
      setError("Preencha os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type,
        amount,
        date: new Date(`${date}T12:00:00`).toISOString(),
        categoryId,
        subcategory,
        description: description.trim(),
        paid,
        ...(repeatEnabled ? { repetitions } : {}),
      };
      if (transaction) {
        await transactionsApi.update(transaction.id, payload);
        showToast("Movimentação atualizada com sucesso.");
      } else {
        const result = await transactionsApi.create(payload);
        showToast(
          result.created && result.created > 1
            ? `${result.created} movimentações adicionadas com sucesso.`
            : "Movimentação adicionada com sucesso.",
        );
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={transaction ? "Editar movimentação" : "Nova movimentação"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Tipo" htmlFor="transaction-type">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange("EXPENSE")}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                type === "EXPENSE"
                  ? "border-rose-500 bg-rose-50 text-rose-600"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <TrendingDown className="h-4 w-4" />
              Saída
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("INCOME")}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                type === "INCOME"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Entrada
            </button>
          </div>
        </Field>

        <Field label="Valor (R$)" htmlFor="amount">
          <Input
            id="amount"
            inputMode="numeric"
            placeholder="0,00"
            value={amount > 0 ? maskCurrency(amount) : ""}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              setAmount(digits ? Number(digits) / 100 : 0);
            }}
          />
        </Field>

        <Field label="Data" htmlFor="date">
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>

        <Field label="Categoria" htmlFor="category">
          <Select
            id="category"
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={!type}
            className={!type ? "text-slate-400" : ""}
          >
            <option value="">{!type ? "Escolha primeiro o tipo" : "Escolha uma categoria"}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Subcategoria" htmlFor="subcategory">
          <Select
            id="subcategory"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            disabled={!categoryId || subcategories.length === 0}
            className={!categoryId ? "text-slate-400" : ""}
          >
            <option value="">
              {!categoryId
                ? "Escolha primeiro uma categoria"
                : subcategories.length === 0
                  ? "Sem subcategorias disponíveis"
                  : "Escolha uma subcategoria"}
            </option>
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
        </Field>

        <div className="rounded-xl border border-slate-200 p-3.5">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-700">
                {type === "EXPENSE" ? "Pago" : type === "INCOME" ? "Recebido" : "Pago / Recebido"}
              </p>
              <p className="text-xs text-slate-400">
                {type === "EXPENSE"
                  ? "Marque se esta saída já foi paga"
                  : type === "INCOME"
                    ? "Marque se esta entrada já foi recebida"
                    : "Confirme o recebimento ou pagamento desta movimentação"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={paid}
              onClick={() => setPaid((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                paid ? "bg-emerald-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  paid ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </label>
        </div>

        <Field label="Descrição" htmlFor="description" hint="Opcional">
          <Input
            id="description"
            placeholder="Ex.: Compra no supermercado"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        {!transaction && (
          <div className="rounded-xl border border-slate-200 p-3.5">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Repetir lançamento</p>
                <p className="text-xs text-slate-400">
                  Cria este lançamento automaticamente nos próximos meses
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={repeatEnabled}
                onClick={() => setRepeatEnabled((v) => !v)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  repeatEnabled ? "bg-brand-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    repeatEnabled ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </label>

            {repeatEnabled && (
              <Field
                label="Repetir por +"
                htmlFor="repetitions"
                hint="Repetições além deste lançamento"
              >
                <Select
                  id="repetitions"
                  value={repetitions}
                  onChange={(e) => setRepetitions(Number(e.target.value))}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 2).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "mês" : "meses"}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth loading={loading}>
            {transaction ? "Salvar alterações" : "Adicionar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
