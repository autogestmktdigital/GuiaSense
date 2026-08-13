import { MonthClosingClassification } from "@prisma/client";
import { ClosingFacts } from "./facts";

function brl(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function buildFallbackMessage(facts: ClosingFacts): string {
  const { monthName } = facts;

  if (facts.hasPending) {
    const parts = [`O fechamento de ${monthName} ainda não foi concluído.`];
    if (facts.pendingExpense > 0) {
      parts.push(`Faltam ${brl(facts.pendingExpense)} em despesas a confirmar.`);
    }
    if (facts.pendingIncome > 0) {
      parts.push(`Faltam ${brl(facts.pendingIncome)} em receitas a confirmar.`);
    }
    parts.push("Confirme as pendências no app para fechar o mês com precisão.");
    return parts.join(" ");
  }

  const classification = facts.classification ?? MonthClosingClassification.EQUILIBRADO;
  const streak = facts.streak[classification];

  if (classification === MonthClosingClassification.POSITIVO) {
    const parts = [
      `${facts.monthName[0].toUpperCase() + facts.monthName.slice(1)} fechou com saldo positivo de ${brl(facts.balance)}.`,
      `Suas receitas de ${brl(facts.received)} superaram os gastos de ${brl(facts.paid)}.`,
    ];
    if (streak >= 2) {
      parts.push(`Este é o ${streak}º mês seguido com saldo positivo. Continue poupando essa diferença.`);
    }
    return parts.join(" ");
  }

  if (classification === MonthClosingClassification.NEGATIVO) {
    const parts = [
      `${facts.monthName[0].toUpperCase() + facts.monthName.slice(1)} fechou com saldo negativo de ${brl(Math.abs(facts.balance))}.`,
      `As despesas de ${brl(facts.paid)} superaram as receitas de ${brl(facts.received)}.`,
    ];
    if (facts.deviation.hasData && facts.deviation.main) {
      parts.push(
        `O gasto em ${facts.deviation.main.categoryName} chegou a ${brl(facts.deviation.main.gasto)}, acima da média de ${brl(facts.deviation.main.media)} dos meses anteriores.`,
      );
    }
    if (streak >= 2) {
      parts.push(`Este é o ${streak}º mês seguido com saldo negativo. Vale revisar os gastos maiores.`);
    }
    return parts.join(" ");
  }

  const parts = [
    `${facts.monthName[0].toUpperCase() + facts.monthName.slice(1)} fechou equilibrado, com saldo de ${brl(facts.balance)}.`,
  ];
  if (facts.history.hasPrevious && facts.history.difference !== null) {
    parts.push(
      `O saldo variou ${brl(Math.abs(facts.history.difference))} em relação ao mês anterior.`,
    );
  }
  parts.push("Mantenha o equilíbrio entre receitas e despesas.");
  return parts.join(" ");
}
