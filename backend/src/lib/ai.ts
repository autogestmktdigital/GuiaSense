import OpenAI from "openai";
import { env } from "../config/env";

export const DEEPSEEK_ALLOWED_MODEL = "deepseek-v4-flash";

let client: OpenAI | null = null;

export function deepseekEnabled(): boolean {
  return Boolean(env.deepseekApiKey);
}

function getDeepSeekClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: env.deepseekApiKey,
      baseURL: env.deepseekBaseUrl,
    });
  }
  return client;
}

function assertAllowedModel(model: string): void {
  if (model !== DEEPSEEK_ALLOWED_MODEL) {
    throw new Error(
      `Modelo não autorizado: ${model}. Apenas ${DEEPSEEK_ALLOWED_MODEL} é permitido.`,
    );
  }
}

function estimateTokens(text: string): number {
  if (text.length === 0) return 0;
  return Math.max(1, Math.round(text.length / 4));
}

const ABNORMAL_TOKENS_THRESHOLD = 10000;

export async function chatCompletion(options: {
  system: string;
  user: string;
  maxTokens?: number;
  feature?: string;
}): Promise<string> {
  const model = env.deepseekModel;
  assertAllowedModel(model);

  const promptApproxTokens =
    estimateTokens(options.system) + estimateTokens(options.user);
  const feature = options.feature ?? "unknown";
  const startedAt = Date.now();

  try {
    const completion = await getDeepSeekClient().chat.completions.create({
      model,
      messages: [
        { role: "system", content: options.system },
        { role: "user", content: options.user },
      ],
      temperature: 0.4,
      max_tokens: options.maxTokens ?? 200,
    });

    const latencyMs = Date.now() - startedAt;
    const usage = completion.usage;
    const inputTokens = usage?.prompt_tokens ?? promptApproxTokens;
    const outputTokens = usage?.completion_tokens ?? 0;
    const totalTokens = usage?.total_tokens ?? inputTokens + outputTokens;

    console.log(
      `[AI] feature=${feature} model=${model} prompt_approx_tokens=${promptApproxTokens} ` +
        `input_tokens=${inputTokens} output_tokens=${outputTokens} total_tokens=${totalTokens} ` +
        `latency_ms=${latencyMs} status=success`,
    );

    if (totalTokens > ABNORMAL_TOKENS_THRESHOLD) {
      console.warn(
        `[AI] WARNING: consumo anormal de tokens (feature=${feature}, model=${model}, total_tokens=${totalTokens})`,
      );
    }

    return completion.choices[0]?.message?.content ?? "";
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `[AI] feature=${feature} model=${model} prompt_approx_tokens=${promptApproxTokens} ` +
        `input_tokens=${promptApproxTokens} output_tokens=0 total_tokens=${promptApproxTokens} ` +
        `latency_ms=${latencyMs} status=error erro=${message}`,
    );
    throw error;
  }
}