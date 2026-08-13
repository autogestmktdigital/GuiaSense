export type PaidLike = {
  paid: boolean;
  date: string;
  type?: "INCOME" | "EXPENSE";
};

export function isOverdue(item: PaidLike): boolean {
  if (item.paid) return false;
  const due = new Date(item.date);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function paidInfo(item: PaidLike): { label: string; className: string } {
  if (item.paid) {
    return {
      label: item.type === "INCOME" ? "Recebido" : "Pago",
      className: "bg-emerald-50 text-emerald-700",
    };
  }
  if (isOverdue(item)) {
    return {
      label: "Atrasado",
      className: "bg-rose-50 text-rose-700",
    };
  }
  return {
    label: "Pendente",
    className: "bg-amber-50 text-amber-700",
  };
}
