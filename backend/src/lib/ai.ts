import OpenAI from "openai";
import { env } from "../config/env";

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

export async function chatCompletion(options: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const completion = await getDeepSeekClient().chat.completions.create({
    model: env.deepseekModel,
    messages: [
      { role: "system", content: options.system },
      { role: "user", content: options.user },
    ],
    temperature: 0.4,
    max_tokens: options.maxTokens ?? 200,
  });
  return completion.choices[0]?.message?.content ?? "";
}
