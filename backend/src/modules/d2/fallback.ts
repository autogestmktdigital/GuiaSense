import { D2Facts } from "./facts";

function brl(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function capital(name: string): string {
  return name[0].toUpperCase() + name.slice(1);
}

export function buildD2Fallback(facts: D2Facts): string {
  const { monthName } = facts;
  const cap = capital(monthName);
  const saldoPrev = brl(facts.projectedBalance);

  if (facts.classificationChanged) {
    if (facts.classification === "PREVISAO_NEGATIVA") {
      return `Desde a última análise, a projeção para ${monthName} mudou e agora indica saldo previsto negativo de ${brl(Math.abs(facts.projectedBalance))} no fim do mês.`;
    }
    const label =
      facts.classification === "PREVISAO_POSITIVA" ? "positivo" : "equilibrado";
    return `Desde a última análise, a projeção para ${monthName} mudou e agora indica um cenário ${label}, com saldo previsto de ${saldoPrev} no fim do mês.`;
  }

  if (facts.variationType === "MELHOROU") {
    return `Desde a última análise, o saldo previsto para ${monthName} subiu. Com os lançamentos cadastrados até agora, a projeção indica saldo previsto de ${saldoPrev} no fim do mês.`;
  }

  if (facts.variationType === "PIOROU") {
    const valorAtual =
      facts.projectedBalance < 0
        ? `negativo de ${brl(Math.abs(facts.projectedBalance))}`
        : `de ${saldoPrev}`;
    return `Desde a última análise, o saldo previsto para ${monthName} caiu. Com os lançamentos cadastrados até agora, a projeção indica saldo previsto ${valorAtual} no fim do mês, abaixo da análise anterior.`;
  }

  return `Pouca coisa mudou desde a última análise. Com os lançamentos cadastrados até agora, ${cap} está projetado para terminar com o mesmo cenário, com saldo previsto de ${saldoPrev}.`;
}