import { D2Facts } from "./facts";

function money(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function buildD2SystemPrompt(): string {
  return `Você é o GuiaSense, um guia financeiro simples e amigável que escreve em português do Brasil. Converse como uma pessoa próxima, e não como um relatório corporativo.
O usuário já recebeu há poucos dias uma análise mais detalhada (D-5) sobre como o mês estava caminhando. Agora faltam 2 dias para o último dia do mês e você vai redigir a REVISÃO FINAL e curta (D-2).

A mensagem D-2 deve responder apenas duas coisas:
1. O que mudou de forma relevante desde a análise anterior (D-5).
2. Qual é a expectativa atual para o fim do mês.

Ela NÃO deve repetir a análise completa do D-5. Deve ser uma atualização rápida e complementar.

CONTEXTO DA PROJEÇÃO
- O resultado continua sendo uma PROJEÇÃO baseada apenas nos lançamentos cadastrados pelo usuário. NUNCA soe como certeza: evite "o mês vai fechar com", "você terminará o mês com", "o resultado final será", "vai fechar", "vai terminar", "deve fechar".
- Prefira linguagem de projeção: "o saldo previsto", "a projeção atual indica", "está projetado para", "pelos lançamentos cadastrados até agora". São referências de linguagem, nunca frases fixas. Varie.

FATOS JÁ CALCULADOS PELO BACKEND
- O campo "fatos_relevantes" contém SOMENTE os fatos verdadeiros verificados pelo sistema. Use apenas fatos presentes nessa lista. NUNCA invente mudanças (contas pagas, valores recebidos, novos lançamentos, causas, tendências, padrões) que não estejam nela.
- O backend compara o snapshot da análise anterior (D-5) com os dados atuais. Você não precisa redescobrir nada comparando listas.
- Se a classificação da projeção mudou, esse é o mais relevante e deve aparecer em destaque, acima de detalhes de valores.
- Se "classificacao_d2" mudou em relação a "classificacao_d5" mas o dado está ausente da lista de fatos, não mencione a mudança.

COMPARAÇÃO COM A PROJEÇÃO ANTERIOR
- Toda diferença de saldo previsto compara com o snapshot D-5. Ao citar uma diferença, deixe claro que a referência é a PROJEÇÃO ANTERIOR.
- Evitar "o saldo previsto ficou R$ 700,00 abaixo do esperado". Preferir "o saldo previsto ficou R$ 700,00 abaixo da projeção anterior" ou equivalente ("da análise anterior", "da previsão anterior", "da orientação anterior").
- NUNCA use "do esperado" ao comparar valores.

SEM INFERÊNCIA DE CAUSA E EFEITO
- NUNCA deduza por que a projeção mudou apenas porque valores coincidem (ex.: afirmar que o saldo caiu PORQUE determinada conta foi paga sem o backend confirmar).
- A sequência do tipo "um valor a pagar surgiu e depois foi pago" só pode ser comunicada se um fato com exatamente esse significado estiver presente em fatos_relevantes.
- O backend só envia fatos confirmados. Se o fato não estiver na lista, ele não aconteceu: não o diga.
- Fatos como "após novos valores a pagar" só podem ser usados se constarem explicitamente em "fatos_relevantes". Se a causa não estiver disponível, remova e comunique apenas a mudança objetiva.

NÃO MINIMIZAR UMA MUDANÇA RELEVANTE
- Use "quase nada mudou", "pouca coisa mudou" ou "praticamente nada mudou" SOMENTE se a lista "fatos_relevantes" contiver o fato "quase nada mudou entre a análise anterior e agora".
- Caso contrário, NUNCA minimize: se houver mudança de classificação, mudança relevante no saldo previsto, novos valores relevantes ou qualquer alteração financeira acima da faixa de tolerância, descreva a mudança objetivamente e abra a mensagem com ela.
- Não crie contradição entre abertura e fato (ex.: "Pouca coisa mudou desde a última análise: o saldo ficou R$ 1.000,00 menor").

SALDO ATUAL ≠ SALDO PREVISTO
- "saldo atual" descreve o realizado até agora (entradas recebidas menos saídas pagas).
- "saldo previsto" descreve a projeção para o fim do mês.
- Mire os dois conceitos separados. Uma conta paga entre D-5 e D-2 reduz o saldo atual, mas não necessariamente muda o saldo previsto (o pagamento já estava provisionado na análise anterior).
- NÃO diga que a projeção piorou apenas porque o saldo atual diminuiu.

PRIORIDADE DA REDAÇÃO
Ao montar a mensagem, siga esta ordem:
1. Houve mudança de classificação? Se sim, destaque PRIMEIRO, de forma objetiva (ex.: "a projeção passou de positiva para negativa"), e depois explique os fatos objetivos que contribuíram, quando fornecidos.
2. Houve mudança relevante no saldo previsto? Se sim, comunique a diferença quando isso ajudar a compreender (ex.: "ficou R$ 700,00 abaixo da projeção anterior").
3. Houve mudança objetiva importante em pendências (conta paga, valor recebido, novo valor a pagar, novo valor a receber)? Cite brevemente.
4. Informe a expectativa atual para o fim do mês.
5. Se nada relevante mudou ("quase nada mudou" presente nos fatos), comunique de forma curta que a projeção permanece praticamente igual.

ENCERRAR QUANDO O ESSENCIAL ESTIVER DITO
- Se a primeira frase já comunica (1) a mudança de classificação, (2) a variação do saldo previsto em relação à projeção anterior e (3) o novo saldo previsto, ENCERRE a mensagem ali.
- NÃO acrescente uma segunda frase apenas para explicar a variação do saldo atual (ex.: "O saldo atual também caiu...", "Isso reflete o que foi pago e recebido...", "Essa mudança aconteceu por causa dos pagamentos..."), mesmo que o saldo atual tenha diminuído.
- Acrescente outra frase somente se existir um fato novo e realmente relevante que não esteja representado na primeira frase.
- Não repita ou explique informações que a primeira frase já tornou claras. Menos informação é preferível quando o essencial foi comunicado.

Fatos como "após novos valores a pagar" só podem ser usados se constarem explicitamente em "fatos_relevantes". Se a causa não estiver disponível, remova e comunique apenas a mudança objetiva.

REGRAS OBRIGATÓRIAS:

1. TAMANHO
- Escreva 1 a 2 frases curtas. Uma terceira frase somente se for realmente necessária para explicar uma mudança importante. O D-2 deve ser mais curto que o D-5.

2. NÃO REPETIR A ANÁLISE ANTERIOR
- Não recapitule totais gerais (total recebido, total pago, saldo atual, todas as pendências) a menos que sejam necessários para explicar uma mudança relevante.
- Não liste contas individuais (aluguel, energia, cartão, telefone etc.). Prefira síntese como "parte dos valores que estavam em aberto foi paga".
- O usuário não precisa de um relatório; ele precisa de uma atualização.
- Não repita na segunda frase um dado já dito na primeira (mudança de classificação, diferença, saldo previsto atual). A segunda frase só deve existir se acrescentar um fato relevante.

3. VALORES MONETÁRIOS
- Todo valor no padrão brasileiro, exatamente como nos fatos: "R$ 50,00", "R$ 1.000,00".
- Para saldo negativo: escreva "saldo previsto negativo de R$ 200,00" ou "negativo em R$ 200,00". NUNCA use "-R$".

4. LINGUAGEM SIMPLES E HUMANA
- Palavras do dia a dia: "o que entrou", "o que saiu", "valores a pagar", "valores a receber".
- NUNCA termos técnicos ("ciclo financeiro", "performance", "período subsequente") nem linguagem de processamento interno ("o dado mais relevante", "com base nos dados analisados").

5. SEM JULGAMENTOS E SEM INTERPRETAÇÕES EMOCIONAIS
- NUNCA use "situação preocupante", "mês difícil", "agora está tranquilo", "bom trabalho", "parabéns", "você piorou sua situação", "você está no vermelho", "é hora de cortar gastos", "mês sem sustos", "saldo bem ajustado".
- Para comparar, descreva objetivamente: prefira "o saldo previsto ficou R$ 300,00 abaixo da análise anterior" em vez de "a situação piorou R$ 300,00".

6. SEM CAUSAS, TENDÊNCIAS OU RECOMENDAÇÕES
- NUNCA atribua causas ou méritos ("você se organizou", "suas mudanças deram resultado").
- NUNCA infira relação de causa e efeito apenas por coincidência de valores. A sequência "um valor a pagar surgiu e depois foi pago" só pode ser dita se um fato com esse significado existir em "fatos_relevantes".
- NUNCA fale em padrão, tendência, sequência ou evolução.
- NUNCA recomende ações (investir, reserva, cortar gastos, reduzir, comprar, poupar).

7. VARIAÇÃO
- Os exemplos abaixo servem apenas de referência. Não são templates fixos.
- Varie abertura, ordem dos fatos e conclusão. Não repita o texto de orientações anteriores.
- Os dados são fixos; a redação é dinâmica.

8. MÊS E FORMATO
- Mencione o mês.
- Responda apenas com o texto da orientação, sem aspas, sem prefixos, sem markdown e sem emoji.

EXEMPLOS DE COMPORTAMENTO ESPERADO (apenas referência, nunca templates fixos):
- Contas foram pagas e a projeção segue positiva: "Desde a última análise, parte dos valores que estavam em aberto foi paga e o saldo atual ficou R$ 1.000,00 menor. Com os lançamentos cadastrados até agora, agosto segue projetado para terminar com saldo positivo de R$ 3.500,00."
- A projeção mudou de positiva para negativa (diferença R$ 700,00, novo saldo previsto negativo em R$ 200,00): "Desde a última análise, a projeção de agosto passou de positiva para negativa, com o saldo previsto ficando R$ 700,00 abaixo da projeção anterior, agora negativo em R$ 200,00." Encerre aqui: não acrescente segunda frase sobre o saldo atual, salvo um fato novo e realmente relevante confirmado em "fatos_relevantes" que não esteja representado na primeira frase (ex.: "Novos valores a pagar surgiram e já foram pagos, o que também reduziu o saldo atual em R$ 700,00.") — nunca por conta própria.
- Praticamente nada mudou: "Quase nada mudou desde a última análise. Com os lançamentos cadastrados até agora, agosto segue projetado para terminar com saldo positivo de R$ 1.000,00."`;
}

function factSummary(facts: D2Facts): Record<string, unknown> {
  const summary: Record<string, unknown> = {
    mes_analisado: `${facts.monthName} de ${facts.year}`,
    data_da_analise: facts.analyzedAt.toISOString(),
    ultimo_dia_do_mes: facts.lastDay,
    dias_restantes: facts.daysLeft,
    snapshot_d5: {
      saldo_atual_d5: money(facts.d5Balance),
      saldo_previsto_d5: money(facts.d5ProjectedBalance),
      classificacao_d5: facts.d5Classification,
    },
    dados_atuais: {
      entradas_recebidas: money(facts.received),
      entradas_a_receber: money(facts.pendingIncome),
      saidas_pagas: money(facts.paid),
      saidas_a_pagar: money(facts.pendingExpense),
      saldo_atual: money(facts.balance),
      saldo_previsto: money(facts.projectedBalance),
      classificacao_d2: facts.classification,
    },
    diferenca_entre_saldo_previsto_d2_e_d5: money(facts.projectionDifference),
    tipo_de_variacao: facts.variationType,
    houve_mudanca_de_classificacao: facts.classificationChanged,
    fatos_relevantes: facts.relevantFacts,
  };
  return summary;
}

export function buildD2UserPrompt(facts: D2Facts, strict: boolean): string {
  const base = `Escreva a revisão final (D-2) do fechamento de ${facts.monthName} com base nestes dados calculados pelo sistema (valores em reais, já formatados):
${JSON.stringify(factSummary(facts), null, 2)}`;

  if (strict) {
    return `${base}

ATENÇÃO: revisão. A resposta anterior violou as regras. Refaça seguindo RIGOROSAMENTE:
- Apenas 1 a 2 frases curtas, bem mais curtas que a análise anterior.
- Por que essa mensagem ficou longa demais ou repetiu a análise D-5? Elimine totais gerais desnecessários e detalhamento.
- Use SOMENTE os fatos de "fatos_relevantes". Nada de mudanças, causas, tendências ou contas individuais fora dessa lista.
- NÃO minimize mudanças: "quase nada mudou", "pouca coisa mudou" ou "praticamente nada mudou" só podem ser usadas se o fato "quase nada mudou entre a análise anterior e agora" estiver em "fatos_relevantes". Caso contrário, descreva a mudança objetivamente, sem contradizer abertura e fato.
- Se houve mudança de classificação, comece por ela: "a projeção passou de ... para ...". Depois explique os fatos objetivos fornecidos, na ordem: mudança no saldo previsto, mudanças em pendências, expectativa atual.
- Se a primeira frase já comunica a mudança de classificação, a variação do saldo previsto em relação à projeção anterior e o novo saldo previsto, ENCERRE a mensagem ali. NÃO acrescente uma segunda frase apenas para explicar a variação do saldo atual ("O saldo atual também caiu...", "Isso reflete...", "Isso aconteceu por causa dos pagamentos...").
- Separe "saldo atual" (realizado até agora) de "saldo previsto" (projeção para o fim do mês). NÃO diga que a projeção piorou apenas porque o saldo atual diminuiu.
- Comparação objetiva: prefira "o saldo previsto ficou R$ X abaixo/acima da projeção anterior" em vez de "a situação piorou/melhorou" ou "abaixo do esperado". NUNCA use "do esperado".
- Não infira causa e efeito: a sequência "um valor a pagar surgiu e depois foi pago" (ou equivalente) só pode aparecer se estiver presente em "fatos_relevantes".
- Não repita na segunda frase um dado já dito na primeira. Segunda frase só se acrescentar um fato relevante.
- Valores no formato "R$ 4.500,00". Saldo negativo: "saldo previsto negativo de R$ 200,00", nunca "-R$".
- Linguagem de projeção: evite "vai fechar", "vai terminar", "deve fechar", "resultado final será". Use "saldo previsto", "projeção", "está projetado".
- Sem julgamentos: nada de "preocupante", "difícil", "tranquilo", "bom trabalho", "mês sem sustos", "bem ajustado".
- Sem recomendações, sem padrões/tendências, sem causas não fornecidas, sem interpretações emocionais.
- Mencione o mês ${facts.monthName}. Responda apenas com o texto da orientação.`;
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

function allowedMoneyValues(facts: D2Facts): Set<number> {
  const values = [
    facts.received,
    facts.pendingIncome,
    facts.paid,
    facts.pendingExpense,
    facts.balance,
    facts.projectedBalance,
    facts.d5Balance,
    facts.d5ProjectedBalance,
    facts.projectionDifference,
    facts.paidSinceD5,
    facts.receivedSinceD5,
    facts.newPendingExpense,
    facts.newPendingIncome,
    facts.balanceChange,
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
  /(voc[eê] vai terminar|vai terminar o m[êe]s|vai fechar o m[êe]s|vai fechar com|vai fechar|vai terminar|vai acabar|deve fechar com|deve fechar o m[êe]s|deve fechar|o m[êe]s deve fechar|deve terminar com|deve terminar o m[êe]s|deve terminar|o m[êe]s deve terminar|terminar[áa] o m[êe]s|o m[êe]s terminar[áa]|vai terminar positivo|terminar[áa] positivo|vai dar cert[oa]|resultado positivo garantido|certamente|resultado final ser[áa])/i;

const PROJECTION_CUES =
  /(considerando|at[ée] agora|at[ée] o momento|cadastrad[aou]|registrad[aou]|lan[çc]ad[aou]|previs[ãa]o|previst[ao]|proje[çc][ãa]o|caminhando|caminha para|pelo que|por enquanto|aponta|indica|estimativa|tende a|atual)/i;

const EMOTIONAL_INTERPRETATION =
  /(sem sustos|sem apertos|m[êe]s tranquilo|m[êe]s dif[ií]cil|voc[eê] pode comemorar|pequeno respiro|preocupante|sem dinheiro|apertad[oa]|desesperador|bem ajustado|piora|piorou|melhorou|situa[çc][ãa]o tranquila|est[áa] tranquilo|agora est[áa] tranquilo|bom trabalho|parab[ée]ns|no vermelho|[áa]gua passada)/i;

const BANK_BALANCE_CONFUSION =
  /(na conta|no banco|saldo banc[áa]rio|conta banc[áa]ria|dinheiro que voc[eê] tem na conta|dispon[ií]vel na conta|na sua conta)/i;

const INTERNAL_PROCESS_LANGUAGE =
  /(dado mais relevante|dado principal do fechamento|informa[çc][ãa]o mais importante|com base nos dados|com base na an[áa]lise|segundo a an[áa]lise|neste cen[áa]rio)/i;

const TECHNICAL_LANGUAGE =
  /(pr[óo]ximo ciclo|ciclo financeiro|comportamento financeiro|performance financeira|per[ií]odo subsequente|estabilidade financeira)/i;

const PATTERN_LANGUAGE =
  /(padr[aã]o|tend[eê]ncia|sequ[eê]ncia|recorrente|cont[ií]nua|evolu[çc][ãa]o consistente|desde sempre|sempre foi assim)/i;

const ADVICE_NO_BASE =
  /(reserva de emerg[êe]ncia|investir|aplicar dinheiro|criar reserva|realizar compras|aumentar gastos|reduzir gastos|cortar gastos|reduzir lazer|reduzir alimenta[çc][ãa]o|mud[ãa]r h[áa]bito|economiz)/i;

const UNSUPPORTED_CAUSE =
  /(voc[eê] se organizou|se organizou melhor|mudan[çc]as deram resultado|continue fazendo o que funcionou|passou por um per[ií]odo dif[ií]cil|devido a|por causa de|causado por)/i;

const UNSUPPORTED_CHANGE =
  /(idade|caso tenham surgido novas despesas|se novas despesas|na verdade|antecipando)/i;

const FALSE_CLASSIFICATION_CHANGE =
  /(mud[ao]u de (positiva?|negativa?|equilibrada?|cen[aá]rio)|classifica[çc][ãa]o mudou|virou (positivo|negativo|equilibrad[ao])|deixou de ser|agora [ée] (negativo|positivo|equilibrad[ao])|mudou para (positivo|negativo|equilibrad[ao]))/i;

const MINIMIZING_LANGUAGE =
  /(quase nada mudou|pouca coisa mudou|praticamente nada mudou|nada de significativo mudou)/i;

const JUDGED_CHANGE =
  /(situa[çc][ãa]o (pior|melhor)|a proje[çc][ãa]o (pior|melhor)|proje[çc][ãa]o (piorou|melhorou)|previs[ãa]o (piorou|melhorou)|saldo previsto (piorou|melhorou)|resultado (pior|melhor))/i;

const UNREFERENCED_COMPARISON =
  /(abaixo|acima) do esperado|acima da expectativa|abaixo da expectativa|do valor esperado/i;

export function isValidD2Message(raw: string, facts: D2Facts): boolean {
  const clean = raw.trim();
  if (clean.length < 40 || clean.length > 330) return false;

  const sentences = splitSentences(clean);
  if (sentences.length < 1 || sentences.length > 3) return false;

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

  if (/-R\$/.test(clean)) return false;

  if (CERTAINTY_PHRASES.test(clean)) return false;
  if (!PROJECTION_CUES.test(clean)) return false;
  if (EMOTIONAL_INTERPRETATION.test(clean)) return false;
  if (BANK_BALANCE_CONFUSION.test(clean)) return false;
  if (INTERNAL_PROCESS_LANGUAGE.test(clean)) return false;
  if (TECHNICAL_LANGUAGE.test(clean)) return false;
  if (PATTERN_LANGUAGE.test(clean)) return false;
  if (ADVICE_NO_BASE.test(clean)) return false;
  if (UNSUPPORTED_CAUSE.test(clean)) return false;
  if (UNSUPPORTED_CHANGE.test(clean)) return false;
  if (!facts.classificationChanged && FALSE_CLASSIFICATION_CHANGE.test(clean)) return false;
  if (facts.d5Classification === "PREVISAO_POSITIVA" && facts.classification === "PREVISAO_NEGATIVA" && /saldo atual/i.test(clean)) return false;

  const hasMinimalFact = facts.relevantFacts.some((fact) => fact.includes("quase nada mudou"));
  if (!hasMinimalFact && MINIMIZING_LANGUAGE.test(clean)) return false;
  if (JUDGED_CHANGE.test(clean)) return false;
  if (UNREFERENCED_COMPARISON.test(clean)) return false;

  const normText = normalize(clean);
  const uniqueSentences = new Set(sentences.map((s) => normalize(s)));
  if (uniqueSentences.size !== sentences.length) return false;

  void normText;
  return true;
}