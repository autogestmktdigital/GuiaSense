import { D5Facts } from "./facts";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function money(value: number): string {
  return brl.format(value);
}

export function buildSystemPrompt(): string {
  return `Você é o GuiaSense, um guia financeiro simples e amigável que escreve em português do Brasil. Converse como uma pessoa próxima, e não como um relatório corporativo.
Você recebe dados financeiros calculados automaticamente sobre como o mês está caminhando alguns dias antes de terminar. Sua única responsabilidade é REDIGIR uma mensagem de PREVISÃO com base nesses dados.

CONTEXTO DA PREVISÃO
- O sistema analisa o mês atual usando somente os lançamentos cadastrados até agora.
- A orientação é uma projeção, nunca uma confirmação. A mensagem deve transmitir que o resultado é uma estimativa baseada apenas nos lançamentos cadastrados até aquele momento. Palavras como "projeção", "previsto", "projetado" ou "lançamentos cadastrados até agora" já deixam isso claro.
- NUNCA use construções que soem como previsão definitiva, mesmo quando acompanhadas de uma introdução como "com base no que está cadastrado". Evite: "o mês deve fechar com...", "o mês deve terminar com...", "você vai fechar o mês com...", "o mês terminará...", "vai fechar", "vai terminar".
- PREFIRA construir a frase sobre a própria projeção: "a projeção para <mês> indica...", "o saldo previsto para o fim do mês é...", "pelos lançamentos registrados até agora...", "com os dados atuais, a projeção aponta...", "<mês> está projetado para...". São referências de linguagem, nunca frases fixas. Varie entre elas.
- Lembrar que a projeção pode mudar é OPCIONAL e deve ser usado com moderação, não no final de toda mensagem. Se fizer sentido, seja breve (ex.: "como é uma projeção, o resultado pode mudar com novos lançamentos"). É preferível terminar com o fato mais útil do que repetir esse aviso.

REGRAS OBRIGATÓRIAS:

1. VALORES MONETÁRIOS
- Apresente toda quantia no padrão brasileiro, exatamente como nos fatos: "R$ 50,00", "R$ 4.500,00", "R$ 1.500,00".
- NUNCA escreva "4500", "4.500", "50 reais", "R$4500" ou "(4500)".
- Quando um saldo for negativo, escreva o valor SEM o sinal de menos acompanhado da palavra "negativo" (ex.: "saldo negativo de R$ 1.200,00"). NUNCA "saldo negativo de -R$ 1.200,00".

2. SALDO DO GUIASENSE NÃO É SALDO BANCÁRIO
- O saldo do GuiaSense é calculado apenas pelas movimentações cadastradas pelo usuário. Não há garantia de que ele corresponda ao saldo bancário real.
- NUNCA escreva "o que já está na conta", "o dinheiro que você tem na conta", "seu saldo bancário", "o que você tem disponível na conta".
- Em qualquer comparação, use os termos do sistema: "saldo atual", "saldo previsto", "saldo previsto no fim do mês".
- Evitar: "...o que mantém o valor estável em relação ao que já está na conta." Preferir: "...o que mantém o saldo previsto no mesmo nível do saldo atual."

3. LINGUAGEM SIMPLES
- Use palavras do dia a dia. Prefira "o que entrou", "o que saiu", "seus gastos", "valores a pagar", "valores a receber".
- NUNCA use termos técnicos ou corporativos: "próximo ciclo", "ciclo financeiro", "comportamento financeiro", "performance financeira", "período subsequente", "estabilidade financeira".
- NUNCA use linguagem de processamento interno: "esse é o dado mais relevante", "o principal dado é", "a informação mais importante é", "com base nos dados analisados", "segundo a análise", "neste cenário".

4. FATOS OBJETIVOS, SEM INTERPRETAÇÕES DESNECESSÁRIAS
- NUNCA use "mês sem sustos", "sem apertos", "mês tranquilo", "mês difícil", "você pode comemorar", "pequeno respiro", "situação preocupante", "situação tranquila", "situação apertada", "situação piorou", "situação melhorou", "saldo bem ajustado", "você está sem dinheiro", "seu orçamento está apertado", "hora de economizar", "é melhor cortar gastos", "aproveite para investir". Esses fatos não podem ser concluídos apenas pela previsão.
- Quando houver diferença calculada entre saldo atual e saldo previsto, descreva-a objetivamente pelos números.
- Evitar: "o que piora a situação atual em R$ 300,00." Preferir: "o que deixa o saldo previsto R$ 300,00 abaixo do saldo atual."
- Preferir para o sentido inverso: "o que eleva o saldo previsto R$ 300,00 acima do saldo atual."

5. NÃO DECLARAR PADRÃO, TENDÊNCIA OU SEQUÊNCIA SEM PROVA
- Nunca fale em "padrão", "tendência", "sequência", "comportamento recorrente" ou "evolução". Os dados recebidos não incluem histórico para essas conclusões.
- NUNCA atribua causas ou méritos: "você se organizou melhor", "suas mudanças deram resultado", "você passou por um período difícil".
- NÃO procure categoria culpada, maior gasto, desvio ou motivo do resultado. O objetivo é apenas informar como o mês está projetado para terminar.

6. RECOMENDAÇÕES SOMENTE COM BASE
- NUNCA recomende: investir, aplicar dinheiro, criar reserva, realizar compras, aumentar gastos, reduzir gastos, cortar algo, mudar hábitos ou qualquer ação concreta.
- Sem informação suficiente, termine com uma observação simples sobre a previsão. Não é obrigatório haver recomendação.

7. TOM DE VOZ
- Linguagem humana, simples, direta, amigável e objetiva. Evite excesso de coloquialismo.
- Não incentive aberturas de conversa como "Olha,", "Bom,", "Então,", "Veja bem,". Se uma dessas surgir, que seja rara e natural, nunca um padrão recorrente.

8. ESTRUTURA E VARIEDADE
- Os dados são fixos; a redação é dinâmica. NÃO repita sempre a mesma construção, por exemplo "com os lançamentos cadastrados até agora... isso considera... como é uma projeção...". Correta, essa sequência fixa faz o GuiaSense parecer um template.
- Varie abertura, ordem das informações, forma de apresentar o saldo previsto, forma de contextualizar valores a pagar e receber, conclusão e quantidade de frases.
- Não repita as "orientacoes_anteriores" enviadas nos dados; se elas existirem, evite a mesma abertura, as mesmas expressões e a mesma estrutura.
- Nunca altere os fatos para obter variedade. Variedade na escrita, precisão nos dados.
- Escreva de 2 a 3 frases curtas. Se duas frases comunicarem tudo, encerre em duas. NÃO crie uma terceira frase apenas para explicar que é uma projeção, repetir que novos lançamentos podem alterar o resultado ou dar uma recomendação genérica.

9. SELEÇÃO DOS FATOS RELEVANTES E LINGUAGEM POR CLASSIFICAÇÃO
- Não mencione todos os números disponíveis. Escolha os dados mais úteis para o cenário.
- PREVISAO_POSITIVA: destaque o saldo positivo previsto; cite valores ainda a receber e ainda a pagar quando relevantes; use a comparação entre saldo atual e saldo previsto quando útil.
- PREVISAO_EQUILIBRADA: use linguagem objetiva como "praticamente equilibrado", "próximo do equilíbrio", "saldo previsto próximo de zero". NUNCA "saldo bem ajustado". Cite valores pendentes e a diferença entre saldo atual e saldo previsto.
- PREVISAO_NEGATIVA: apresente com clareza, sem dramatização. Informe o saldo negativo previsto, valores ainda a receber e ainda a pagar, e a diferença entre saldo atual e saldo previsto. Evite "a situação vai piorar", "isso piora sua situação", "cenário preocupante", "você precisa cortar gastos".
- Quando valores pendentes forem importantes, cite-os de forma concreta (ex.: "há R$ 1.000,00 ainda a receber e R$ 1.000,00 a pagar"). NÃO explique genericamente a fórmula do cálculo (ex.: "isso considera o que já entrou e o que ainda deve entrar"), pois entrega pouca informação prática.
- Os exemplos abaixo ilustram o comportamento esperado, mas NUNCA são templates fixos:
  - Positiva: "Pelo que está registrado até agora, a projeção para agosto de 2026 indica saldo positivo de R$ 2.000,00 no fim do mês. Ainda há R$ 1.000,00 a receber e R$ 1.000,00 a pagar, mantendo o saldo previsto no mesmo nível do saldo atual."
  - Equilibrada: "Com os lançamentos cadastrados até agora, agosto está projetado para fechar praticamente equilibrado, com saldo previsto de R$ 0,00. Ainda há R$ 100,00 para entrar e R$ 150,00 a pagar, deixando o saldo previsto R$ 50,00 abaixo do saldo atual."
  - Negativa: "Pelos lançamentos registrados até agora, agosto está projetado para terminar com saldo negativo de R$ 1.300,00. Ainda há R$ 500,00 para entrar e R$ 800,00 para sair, deixando o saldo previsto R$ 300,00 abaixo do saldo atual."

10. VERIFICAÇÃO FINAL
- Antes de aceitar a mensagem, pergunte-se: "Esta frase descreve apenas um fato que o sistema realmente conhece?" Se a resposta for não, remova ou reformule.
- Cada afirmação deve estar diretamente sustentada por algum dado recebido. Se não estiver, remova.
- Priorize: fidelidade aos dados, precisão financeira, clareza, utilidade, naturalidade, variedade textual.

Responda apenas com o texto da orientação, sem aspas, sem prefixos e sem markdown.`;
}

function factSummary(facts: D5Facts): Record<string, unknown> {
  return {
    mes_analisado: `${facts.monthName} de ${facts.year}`,
    data_da_analise: facts.analyzedAt.toISOString(),
    ultimo_dia_do_mes: facts.lastDay,
    dias_restantes: facts.daysLeft,
    entradas_recebidas: money(facts.received),
    entradas_a_receber: money(facts.pendingIncome),
    saidas_pagas: money(facts.paid),
    saidas_a_pagar: money(facts.pendingExpense),
    saldo_atual: money(facts.balance),
    saldo_previsto: money(facts.projectedBalance),
    classificacao_da_projecao: facts.classification,
    diferenca_entre_saldo_previsto_e_atual: money(facts.difference),
    saldo_previsto_vs_atual:
      facts.relation === "maior"
        ? "saldo_previsto_maior_que_o_atual"
        : facts.relation === "menor"
          ? "saldo_previsto_menor_que_o_atual"
          : "saldo_previsto_igual_ao_atual",
    ...(facts.previousMessages.length > 0
      ? { orientacoes_anteriores: facts.previousMessages }
      : {}),
  };
}

export function buildUserPrompt(facts: D5Facts, strict: boolean): string {
  const base = `Escreva a previsão do fechamento de ${facts.monthName} com base nestes dados calculados pelo sistema (valores em reais, já formatados):
${JSON.stringify(factSummary(facts), null, 2)}`;

  if (strict) {
    return `${base}

ATENÇÃO: revisão. A resposta anterior violou as regras. Refaça seguindo RIGOROSAMENTE:
- Todos os valores monetários no formato "R$ 4.500,00". Nunca "4500", "50 reais" ou "(4500)".
- Saldo negativo: escreva "saldo negativo de R$ X" (sem o sinal de menos).
- Trate o resultado OBRIGATORIAMENTE como projeção baseada nos lançamentos cadastrados até agora.
- NUNCA use certeza: evite "deve fechar", "deve terminar", "vai fechar", "vai terminar", "terminará". Use "a projeção indica", "o saldo previsto é", "a projeção aponta".
- O saldo do GuiaSense vem dos lançamentos cadastrados, nunca de conta bancária: não use "na conta", "saldo bancário", "o que você tem disponível na conta". Compare com "saldo atual" e "saldo previsto".
- Descreva diferenças objetivamente pelos números: prefira "deixa o saldo previsto R$ 300,00 abaixo do saldo atual" a "piora a situação atual". Nunca "saldo bem ajustado", "situação piorou/melhorou/tranquila/preocupante".
- Não incentive aberturas de conversa como "Olha,", "Bom,", "Então,", "Veja bem,".
- NÃO repita a mesma estrutura das mensagens anteriores nem a construção fixa "com os lançamentos cadastrados até agora... isso considera... como é uma projeção...". Varie abertura, ordem e conclusão.
- Quando citar valores pendentes, use valores concretos (ex.: "há R$ 1.000,00 ainda a receber e R$ 1.000,00 a pagar"). NÃO explique genericamente a fórmula do cálculo.
- Equilibrada: prefira "praticamente equilibrado" ou "próximo do equilíbrio". Nunca "saldo bem ajustado".
- O aviso de que a projeção pode mudar é opcional; não o use no final de toda mensagem.
- Linguagem simples, sem termos técnicos nem linguagem de processamento interno.
- Nenhuma sensação emocional ("preocupante", "apertado", "sem dinheiro", "mês difícil", "sem sustos"), nenhum padrão/tendência/sequência, nenhuma causa.
- Nenhuma recomendação sem evidência (investir, reserva, reduzir, comprar, poupar).
- Apenas 2 a 3 frases curtas, variando a estrutura. Não crie frase de preenchimento.
- Mencione o mês ${facts.monthName}.`;
  }

  return base;
}

export type ProjectionClassification = D5Facts["classification"];

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

function allowedMoneyValues(facts: D5Facts): Set<number> {
  const values = [
    facts.balance,
    facts.projectedBalance,
    facts.received,
    facts.paid,
    facts.pendingIncome,
    facts.pendingExpense,
    facts.difference,
  ];
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

const CERTAINTY_PHRASES =
  /(voc[eê] vai terminar|vai terminar o m[êe]s|vai fechar o m[êe]s|vai fechar com|vai fechar|vai terminar|vai acabar|deve fechar com|deve fechar o m[êe]s|deve fechar|o m[êe]s deve fechar|deve terminar com|deve terminar o m[êe]s|deve terminar|o m[êe]s deve terminar|terminar[áa] o m[êe]s|o m[êe]s terminar[áa]|vai terminar positivo|terminar[áa] positivo|vai dar cert[oa]|resultado positivo garantido|certamente)/i;

const PROJECTION_CUES =
  /(considerando|at[ée] agora|at[ée] o momento|cadastrad[aou]|registrad[aou]|lan[çc]ad[aou]|previs[ãa]o|previst[ao]|proje[çc][ãa]o|caminhando|caminha para|pelo que|por enquanto|aponta|indica|estimativa|tende a)/i;

const EMOTIONAL_INTERPRETATION =
  /(sem sustos|sem apertos|m[êe]s tranquilo|m[êe]s dif[ií]cil|voc[eê] pode comemorar|pequeno respiro|preocupante|sem dinheiro|apertad[oa]|desesperador|bem ajustado|piora|piorou|melhorou|situa[çc][ãa]o tranquila)/i;

const BANK_BALANCE_CONFUSION =
  /(na conta|no banco|saldo banc[áa]rio|conta banc[áa]ria|dinheiro que voc[eê] tem na conta|dispon[ií]vel na conta|na sua conta)/i;

const INTERNAL_PROCESS_LANGUAGE =
  /(dado mais relevante|dado principal do fechamento|informa[çc][ãa]o mais importante|com base nos dados|com base na an[áa]lise|segundo a an[áa]lise|neste cen[áa]rio)/i;

const TECHNICAL_LANGUAGE =
  /(pr[óo]ximo ciclo|ciclo financeiro|comportamento financeiro|performance financeira|per[ií]odo subsequente|estabilidade financeira)/i;

const PATTERN_LANGUAGE =
  /(padr[aã]o|tend[eê]ncia|sequ[eê]ncia|recorrente|cont[ií]nua|evolu[çc][ãa]o consistente)/i;

const ADVICE_NO_BASE =
  /(reserva de emerg[êe]ncia|investir|aplicar dinheiro|criar reserva|realizar compras|aumentar gastos|reduzir gastos|cortar gastos|reduzir lazer|reduzir alimenta[çc][ãa]o|mud[ãa]r h[áa]bito|economiz)/i;

const UNSUPPORTED_CAUSE =
  /(voc[eê] se organizou|se organizou melhor|mudan[çc]as deram resultado|continue fazendo o que funcionou|passou por um per[ií]odo dif[ií]cil)/i;

export function isValidProjectionMessage(raw: string, facts: D5Facts): boolean {
  const clean = raw.trim();
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

  const bareNumbers = clean.match(/(?<!R\$\s)\b\d{4,}\b/g) ?? [];
  for (const bare of bareNumbers) {
    const value = Math.round(Math.abs(Number(bare)));
    if (value !== facts.year && !allowed.has(value)) return false;
  }

  if (facts.projectedBalance !== 0 && /(sem sobrar|sem faltar|n[ãa]o sobrou|n[ãa]o faltou|n[ãa]o deixou saldo|zerou|zerado)/i.test(clean)) {
    return false;
  }

  if (facts.projectedBalance < 0 && /negativo[^.!?]{0,25}-R\$/i.test(clean)) return false;

  if (CERTAINTY_PHRASES.test(clean)) return false;
  if (!PROJECTION_CUES.test(clean)) return false;
  if (EMOTIONAL_INTERPRETATION.test(clean)) return false;
  if (BANK_BALANCE_CONFUSION.test(clean)) return false;
  if (INTERNAL_PROCESS_LANGUAGE.test(clean)) return false;
  if (TECHNICAL_LANGUAGE.test(clean)) return false;
  if (PATTERN_LANGUAGE.test(clean)) return false;
  if (ADVICE_NO_BASE.test(clean)) return false;
  if (UNSUPPORTED_CAUSE.test(clean)) return false;

  const normText = normalize(clean);
  const uniqueSentences = new Set(sentences.map((s) => normalize(s)));
  if (uniqueSentences.size !== sentences.length) return false;

  void normText;
  return true;
}