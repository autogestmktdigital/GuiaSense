import { MonthClosingClassification } from "@prisma/client";
import { ClosingFacts } from "./facts";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function money(value: number): string {
  return brl.format(value);
}

export function buildSystemPrompt(): string {
  return `Você é o GuiaSense, um guia financeiro simples e amigável que escreve em português do Brasil. Converse como uma pessoa próxima, e não como um relatório corporativo.
Você recebe fatos financeiros calculados automaticamente sobre o fechamento de um mês. Sua única responsabilidade é REDIGIR a mensagem com base nesses fatos.

REGRAS OBRIGATÓRIAS:

1. VALORES MONETÁRIOS
- Apresente toda quantia no padrão brasileiro, exatamente como nos fatos: "R$ 50,00", "R$ 4.500,00", "R$ 1.500,00".
- NUNCA escreva "4500", "4.500", "50 reais", "R$4500" ou "(4500)".
- Quando o saldo for negativo, escreva o valor SEM o sinal de menos, acompanhado da palavra "negativo": "saldo negativo de R$ 1.200,00". NUNCA escreva "saldo negativo de -R$ 1.200,00", pois a palavra "negativo" já informa o sinal e o menos duplicaria a ideia.

2. LINGUAGEM SIMPLES
- Use palavras do dia a dia. Prefira "próximo mês", "mês anterior", "seus gastos", "o que entrou", "o que saiu", "saldo", "valores a pagar", "valores a receber".
- NUNCA use termos técnicos ou corporativos: "próximo ciclo", "ciclo financeiro", "comportamento financeiro", "performance financeira", "período subsequente", "estabilidade financeira".
- Seja um guia simples e próximo, nunca um relatório.

3. NÃO USAR LINGUAGEM DE PROCESSAMENTO INTERNO
- NUNCA use expressões que descrevam a análise interna do sistema: "esse é o dado mais relevante", "o principal dado do fechamento é", "a informação mais importante é", "com base nos dados analisados", "segundo a análise", "neste cenário".
- Fale diretamente sobre a vida financeira do usuário, nunca sobre o processo usado para chegar à conclusão.

4. SEM INTERPRETAÇÕES SOBRE A SENSAÇÃO FINANCEIRA DO USUÁRIO
- NUNCA use "foi um mês sem sustos", "sem apertos", "mês tranquilo", "mês difícil", "você pode comemorar", "pequeno respiro", "fechamento confortável", "fechamento limpo" ou qualquer leitura emocional sobre a sensação financeira do usuário, a menos que dados objetivos enviados sustentem.
- Descreva somente o resultado financeiro comprovado.

5. PENDÊNCIAS
- A ausência de pendências é uma condição interna para concluir o fechamento e NÃO precisa ser mencionada. NUNCA use "não há valores pendentes", "nada ficou pendente para pagar ou receber", "tudo que estava previsto já foi confirmado", "sem pendências".
- Só fale de pendências quando elas existirem de fato e impedirem o fechamento do mês, ou seja, quando os campos "despesas_pendentes_de_pagamento" ou "receitas_pendentes_de_confirmacao" forem maiores que zero.

6. FIDELIDADE AOS DADOS
- Use APENAS os fatos fornecidos. Não invente valores, causas, hábitos, tendências, sequências, melhoras, pioras ou comparações.
- Reconheça o saldo exatamente como enviado. Se o saldo for R$ 50,00, nunca diga que "não sobrou nem faltou", que "zerou" ou que "não deixou saldo".

7. CLASSIFICAÇÃO DO SISTEMA
- A classificação (POSITIVO, EQUILIBRADO, NEGATIVO) é definida pelo sistema. Reconheça-a, não a reinterprete.
- EQUILIBRADO: mesmo com pequeno saldo positivo ou negativo dentro da faixa de equilíbrio (ex.: entradas R$ 4.500,00, saídas R$ 4.450,00, saldo R$ 50,00), NUNCA diga "entrou exatamente o que saiu" nem "não sobrou nem faltou". Diga "praticamente equilibrado", "muito próximo do equilíbrio" ou "entradas e gastos ficaram muito próximos", sempre reconhecendo o saldo real enviado.

8. NÃO DECLARAR PADRÃO, TENDÊNCIA OU SEQUÊNCIA SEM PROVA
- Nunca afirme a existência de "padrão", "tendência", "sequência", "comportamento recorrente" ou "evolução" a partir de um único mês.
- "Sequência de meses" só pode ser citada quando o campo "meses_seguidos_X" enviado nos fatos for igual ou maior que 2. Um único mês nunca é uma sequência.
- Comparações com o mês anterior só podem existir quando o campo "historico" estiver presente nos fatos.
- NUNCA use: "vamos acompanhar o próximo mês para ver se esse padrão se mantém", "se o padrão se mantém", "seu padrão de gastos", "esse comportamento está se repetindo", "melhora contínua", "piora contínua", "evolução consistente".
- Não trate um único mês ou uma única comparação com o mês anterior como "tendência" de longo prazo. Para falar de tendência, espere dados de mais meses.

9. FATO vs INTERPRETAÇÃO
- Toda interpretação precisa estar diretamente sustentada pelos dados recebidos. Nunca crie criatividade para preencher o que os dados não dizem.
- Permitido com base nos fatos: "o saldo melhorou em relação ao mês anterior", "o mês terminou com sobra", "houve recuperação em relação ao mês anterior" (apenas se os saldos enviados sustentarem, ex.: mês anterior negativo e mês atual positivo).
- PROIBIDO atribuir causa ou mérito sem dados que comprovem: "você se organizou melhor", "suas mudanças deram resultado", "continue fazendo o que funcionou", "você passou por um período difícil".

10. RECOMENDAÇÕES SOMENTE COM BASE
- Só dê orientações quando os fatos contiverem dados concretos que as sustentem (ex.: "categorias_evidenciadas" com aumento real de uma categoria em relação à média).
- NUNCA recomende sem evidência: reserva de emergência, investir, rever gastos fixos, economizar mais, reduzir lazer, reduzir alimentação, cortar gastos, mudar hábitos ou qualquer ação concreta.
- Não é obrigatório existir recomendação. Se não houver base, finalize apenas com uma observação simples sobre o fechamento.

11. CONCLUSÃO VARIADA
- NUNCA use uma conclusão padrão em toda mensagem, como "agora é só acompanhar o próximo mês para ver como esse resultado evolui".
- Varie a conclusão conforme os fatos disponíveis. É permitido encerrar a mensagem logo após apresentar o fechamento, sem frase final.
- Nem toda orientação precisa de conselho, recomendação, chamada para o próximo mês ou frase motivacional.

12. ESTRUTURA VARIADA E CONSTATACÃO OBJETIVA
- NÃO repita sempre o formato "resultado → entradas e saídas → acompanhar o próximo mês". Varie naturalmente a construção.
- Possibilidades: começar pelo saldo; começar pela comparação com o mês anterior (quando houver); destacar a diferença entre entradas e saídas; terminar apenas com a constatação do resultado; acrescentar contexto histórico somente quando fornecido.
- Sem contexto adicional, prefira constatações objetivas baseadas exclusivamente nos números (ex.: "R$ 2.000,00 permaneceram como saldo ao final do mês"). Os exemplos são apenas referência de qualidade, nunca frases fixas.

13. TAMANHO
- Escreva de 2 a 3 frases curtas. Nada de parágrafos longos.

14. VARIEDADE
- Varie abertura, vocabulário e estrutura. Evite repetir as "orientacoes_anteriores" enviadas nos fatos.
- Nunca altere os fatos para tornar a mensagem diferente. Variedade na escrita, precisão nos dados.

15. VERIFICAÇÃO FINAL
- Antes de devolver o texto, pergunte-se: "cada afirmação está diretamente sustentada por algum dado que recebi?" Se a resposta for não, remova a afirmação.
- Priorize nesta ordem: precisão, clareza, naturalidade, variedade.

Responda apenas com o texto da orientação, sem aspas, sem prefixos e sem markdown.`;
}

function factSummary(facts: ClosingFacts): Record<string, unknown> {
  const summary: Record<string, unknown> = {
    mes_analisado: `${facts.monthName} de ${facts.year}`,
    status: facts.hasPending ? "ainda_aberto_pendente" : "fechado",
    receitas_confirmadas: money(facts.received),
    despesas_confirmadas: money(facts.paid),
    saldo: money(facts.balance),
    despesas_pendentes_de_pagamento: money(facts.pendingExpense),
    receitas_pendentes_de_confirmacao: money(facts.pendingIncome),
  };

  if (!facts.hasPending && facts.classification) {
    summary.classificacao = facts.classification;
    summary.sequencia_de_meses = facts.streak[facts.classification];
    summary.meses_seguidos_positivos = facts.streak.POSITIVO;
    summary.meses_seguidos_equilibrados = facts.streak.EQUILIBRADO;
    summary.meses_seguidos_negativos = facts.streak.NEGATIVO;
  }

  if (facts.history.hasPrevious) {
    summary.historico = {
      mes_anterior: facts.history.previousYearMonth,
      saldo_mes_anterior: money(facts.history.previousBalance ?? 0),
      classificacao_mes_anterior: facts.history.previousClassification,
      variacao_saldo_vs_mes_anterior: money(facts.history.difference ?? 0),
      tendencia: facts.history.trend,
    };
  }

  if (facts.deviation.hasData) {
    summary.categorias_evidenciadas = facts.deviation.categories.map((c) => ({
      categoria: c.categoryName,
      gasto_no_mes: money(c.gasto),
      media_do_gasto: money(c.media),
      aumento_em_relacao_a_media: money(c.diferenca),
      percentual_acima_da_media: `${Math.round(c.percentual)}%`,
    }));
  }

  if (facts.previousMessages.length > 0) {
    summary.orientacoes_anteriores = facts.previousMessages;
  }

  return summary;
}

export function buildUserPrompt(facts: ClosingFacts, strict: boolean): string {
  const base = `Escreva a orientação sobre o fechamento de ${facts.monthName} com base nestes fatos calculados (valores em reais, já formatados):
${JSON.stringify(factSummary(facts), null, 2)}`;

  if (strict) {
    return `${base}

ATENÇÃO: revisão. A resposta anterior violou as regras. Refaça seguindo RIGOROSAMENTE:
- Todos os valores monetários devem aparecer no formato "R$ 4.500,00" (nunca "4500", "50 reais" ou "(4500)").
- Saldo negativo: escreva "saldo negativo de R$ 1.200,00" (sem o sinal de menos). Nunca "saldo negativo de -R$ 1.200,00".
- Use linguagem simples do dia a dia: "próximo mês", "o que entrou", "o que saiu", "seus gastos". NUNCA "próximo ciclo", "ciclo financeiro", "comportamento financeiro", "performance financeira", "período subsequente", "estabilidade financeira".
- NUNCA use linguagem de processamento interno: "esse é o dado mais relevante", "o principal dado do fechamento é", "a informação mais importante é", "com base nos dados analisados", "segundo a análise", "neste cenário".
- NUNCA use interpretações sobre a sensação financeira do usuário sem dados objetivos: "sem sustos", "sem apertos", "mês tranquilo", "mês difícil", "pequeno respiro", "fechamento confortável", "fechamento limpo", "você pode comemorar".
- NÃO mencione a ausência de pendências: "não há valores pendentes", "nada ficou pendente para pagar ou receber", "tudo que estava previsto já foi confirmado", "sem pendências". Só fale de pendências quando elas existirem de fato (campos de pendências maiores que zero).
- NÃO use uma conclusão padrão como "agora é só acompanhar o próximo mês para ver como esse resultado evolui". Varie a conclusão ou encerre após apresentar o fechamento, sem frase final.
- Varie a estrutura: não repita sempre "resultado → entradas e saídas → acompanhar o próximo mês".
- Reconheça o saldo e a classificação enviados; não os contradiga. Se EQUILIBRADO com pequeno saldo (ex.: R$ 50,00), não diga "não sobrou nem faltou" nem "entrou exatamente o que saiu".
- Não declare "padrão", "tendência" ou "sequência" sem prova. Sequência apenas se "meses_seguidos_X" for 2 ou mais; comparação com mês anterior apenas se "historico" estiver presente.
- Não atribua causas: "você se organizou melhor", "suas mudanças deram resultado", "continue fazendo o que funcionou", "você passou por um período difícil".
- Nenhuma recomendação genérica (reserva de emergência, gastos fixos, economizar, investir, reduzir gastos, mudar hábitos) sem evidência nos fatos. Sem evidência, finalize só com observação simples.
- Apenas 2 a 3 frases curtas.
- Mencione o mês ${facts.monthName}.`;
  }

  return base;
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}

function normalizeBRLNumber(raw: string): number {
  let value = raw.replace(/R\$\s*/g, "").replace(/\s/g, "").trim();
  if (!value) return 0;
  const hasDot = value.includes(".");
  const hasComma = value.includes(",");

  if (hasDot && hasComma) {
    value = value.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    value = value.replace(",", ".");
  } else if (hasDot && /\.\d{3}$/.test(value)) {
    value = value.replace(/\./g, "");
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function allowedMoneyValues(facts: ClosingFacts): Set<number> {
  const values = [
    facts.balance,
    facts.received,
    facts.paid,
    facts.pendingExpense,
    facts.pendingIncome,
    facts.history.previousBalance,
    facts.history.difference,
  ];
  for (const category of facts.deviation.categories) {
    values.push(category.gasto, category.media, category.diferenca);
  }
  const set = new Set<number>();
  for (const value of values) {
    if (value === null || !Number.isFinite(value)) continue;
    set.add(Math.round(Math.abs(value)));
  }
  return set;
}

function normalize(text: string): string {
  return text
    .toLocaleLowerCase()
    .replace(/[áàâãä]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[íìîï]/g, "i")
    .replace(/[óòôõö]/g, "o")
    .replace(/[úùûü]/g, "u")
    .replace(/ç/g, "c")
    .replace(/\s+/g, " ");
}

const KNOWN_CATEGORIES = [
  "Alimentação",
  "Educação",
  "Financeiro e Impostos",
  "Lazer e Assinaturas",
  "Compras e Cuidados",
  "Moradia",
  "Outras Despesas",
  "Saúde",
  "Transporte",
  "Benefícios",
  "Investimentos",
  "Outras Receitas",
  "Recebimentos",
  "Renda Extra",
  "Salário",
];

const UNSAFE_ADVICE =
  /(reserva de emerg[êe]ncia|reserva de emergencia|investir|gastos fixos|economiz|mud[ãa]r h[áa]bito|mudan[çc]a de h[áa]bito)/i;

const ADVICE_VERBS =
  /(reduzir|cortar|revisar|controlar|diminuir|eliminar|repensar|repensar)/i;

const TECHNICAL_LANGUAGE =
  /(pr[óo]ximo ciclo|ciclo financeiro|comportamento financeiro|performance financeira|per[ií]odo subsequente|estabilidade financeira)/i;

const UNSUPPORTED_PATTERN =
  /(padr[aã]o se mant[eê]m|padr[aã]o de gastos|esse padr[aã]o|seu padr[aã]o|comportamento est[áa] se repetindo|melhora cont[ií]nua|piora cont[ií]nua|comportamento recorrente|evolu[çc][ãa]o consistente|sequ[eê]ncia positiva|sequ[eê]ncia negativa)/i;

const UNSUPPORTED_CAUSE =
  /(voc[eê] se organizou|se organizou melhor|mudan[çc]as deram resultado|continue fazendo o que funcionou|passou por um per[ií]odo dif[ií]cil)/i;

const INTERNAL_PROCESS_LANGUAGE =
  /(dado mais relevante|dado principal do fechamento|informa[çc][ãa]o mais importante|com base nos dados|com base na an[áa]lise|segundo a an[áa]lise|neste cen[áa]rio)/i;

const EMOTIONAL_INTERPRETATION =
  /(sem sustos|sem apertos|m[êe]s tranquilo|m[êe]s dif[ií]cil|voc[eê] pode comemorar|pequeno respiro|fechamento confort[áa]vel|fechamento limpo|boa margem)/i;

const NO_PENDING_PHRASES =
  /(n[ãa]o h[áa] valores pendentes|n[ãa]o h[áa] pend[êe]ncias|sem valores pendentes|sem pend[êe]ncias|sem valores a pagar|sem valores a receber|sem pagamentos pendentes|sem recebimentos pendentes|nada pendente|sem nada pendente|nada ficou pendente|tudo que estava previsto|tudo o que estava previsto|j[áa] foi confirmado|sem despesas nem receitas pendentes)/i;

export function isValidClosingMessage(text: string, facts: ClosingFacts): boolean {
  const clean = text.trim();
  if (clean.length < 60 || clean.length > 360) return false;

  const sentences = splitSentences(clean);
  if (sentences.length < 2 || sentences.length > 4) return false;

  const mentionsMonth =
    clean.toLocaleLowerCase().includes(facts.monthName.toLocaleLowerCase()) ||
    clean.includes(facts.yearMonth);
  if (!mentionsMonth) return false;

  const moneyMatches = clean.match(/R\$\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?/g) ?? [];
  if (moneyMatches.length === 0) return false;

  const allowed = allowedMoneyValues(facts);
  for (const match of moneyMatches) {
    const rounded = Math.round(Math.abs(normalizeBRLNumber(match)));
    if (!allowed.has(rounded)) return false;
  }

  if (/[\d.,]+\s+reais/i.test(clean)) return false;

  if (/negativo[^.!?]{0,25}-R\$/i.test(clean)) return false;

  const bareNumbers = clean.match(/(?<!R\$\s)\b\d{4,}\b/g) ?? [];
  for (const bare of bareNumbers) {
    const value = Math.round(Math.abs(Number(bare)));
    if (value !== facts.year && !allowed.has(value)) return false;
  }

  if (
    facts.balance !== 0 &&
    /(sem sobrar|sem faltar|n[ãa]o sobrou|n[ãa]o faltou|sobrou nem faltou|n[ãa]o deixou saldo|zerou|zerado)/i.test(
      clean,
    )
  ) {
    return false;
  }

  if (UNSAFE_ADVICE.test(clean)) return false;
  if (TECHNICAL_LANGUAGE.test(clean)) return false;
  if (UNSUPPORTED_PATTERN.test(clean)) return false;
  if (UNSUPPORTED_CAUSE.test(clean)) return false;
  if (INTERNAL_PROCESS_LANGUAGE.test(clean)) return false;
  if (EMOTIONAL_INTERPRETATION.test(clean)) return false;
  if (!facts.hasPending && NO_PENDING_PHRASES.test(clean)) return false;

  const normText = normalize(clean);
  const hasSequence =
    facts.classification != null && facts.streak[facts.classification] >= 2;
  const hasHistory = facts.history.hasPrevious;
  if (/padr[aã]o/.test(normText) && !facts.deviation.hasData) return false;
  if (/sequ[eê]ncia/.test(normText) && !hasSequence) return false;
  if (/tend[eê]ncia/.test(normText) && !(hasHistory && hasSequence)) return false;
  if (/recupera[çc][ãa]o|virada/.test(normText)) {
    const recovered =
      facts.history.hasPrevious &&
      facts.history.previousClassification === MonthClosingClassification.NEGATIVO &&
      facts.classification === MonthClosingClassification.POSITIVO;
    if (!recovered) return false;
  }
  const evidenced = new Set(
    facts.deviation.categories.map((c) => normalize(c.categoryName)),
  );
  for (const category of KNOWN_CATEGORIES) {
    const normalizedCategory = normalize(category);
    if (normText.includes(normalizedCategory) && !evidenced.has(normalizedCategory)) {
      return false;
    }
  }
  if (!facts.deviation.hasData && ADVICE_VERBS.test(clean)) return false;

  const uniqueSentences = new Set(sentences.map((s) => normalize(s)));
  if (uniqueSentences.size !== sentences.length) return false;

  return true;
}
