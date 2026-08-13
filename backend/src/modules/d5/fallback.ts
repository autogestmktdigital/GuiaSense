import { D5Facts } from "./facts";

function brl(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function buildD5Fallback(facts: D5Facts): string {
  const { monthName } = facts;
  const capital = monthName[0].toUpperCase() + monthName.slice(1);

  if (facts.classification === "PREVISAO_POSITIVA") {
    const parts = [
      `Pelo que está cadastrado até agora, ${capital} está caminhando para terminar com saldo positivo de ${brl(facts.projectedBalance)}.`,
    ];
    if (facts.pendingExpense > 0 || facts.pendingIncome > 0) {
      parts.push(
        `Ainda restam ${brl(facts.pendingExpense)} para pagar e ${brl(facts.pendingIncome)} para receber.`,
      );
    }
    return parts.join(" ");
  }

  if (facts.classification === "PREVISAO_NEGATIVA") {
    const parts = [
      `Pelo que está cadastrado até agora, ${capital} caminha para um saldo negativo de ${brl(Math.abs(facts.projectedBalance))}.`,
    ];
    if (facts.pendingExpense > 0 || facts.pendingIncome > 0) {
      parts.push(
        `Ainda restam ${brl(facts.pendingExpense)} para pagar e ${brl(facts.pendingIncome)} para receber.`,
      );
    }
    return parts.join(" ");
  }

  return `Considerando o que está cadastrado até agora, ${capital} deve terminar muito próximo do equilíbrio, com saldo previsto de ${brl(facts.projectedBalance)}.`;
}