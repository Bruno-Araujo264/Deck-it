/**
 * Cliente mínimo para a API do Google Gemini (Interactions API).
 *
 * A chave fica só no backend (GEMINI_API_KEY no .env) — nunca no app mobile.
 * Gere uma chave gratuita em https://aistudio.google.com/apikey
 *
 * Usado pelo scanner de cartas e, depois, pelo chatbot.
 */

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

export type AiContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; data: string; mime_type: string };

export interface AiRequest {
  input: string | AiContentPart[];
  systemInstruction?: string;
  /** JSON Schema que a resposta deve seguir (ativa saída estruturada). */
  jsonSchema?: Record<string, unknown>;
  maxOutputTokens?: number;
  /** Quanto o modelo "pensa" antes de responder: menos = mais rápido e não gasta a cota de texto. */
  thinkingLevel?: 'minimal' | 'low' | 'medium' | 'high' | undefined;
  /** Modelo específico para esta chamada (padrão: GEMINI_MODEL ou gemini-3.5-flash-lite). */
  model?: string | undefined;
  /** Modelos de reserva se o principal estiver sobrecarregado/sem cota. */
  fallbackModels?: string[] | undefined;
  /** Tempo máximo de cada tentativa (padrão 30 s). */
  timeoutMs?: number | undefined;
  /** Repetir uma vez o mesmo modelo antes de ir para o próximo (padrão true). */
  retrySameModel?: boolean | undefined;
}

const DEFAULT_FALLBACKS = ['gemini-3.1-flash-lite'];

export class AiServiceError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
  }
}

/** Erro temporário (sobrecarga, cota, rede): vale tentar de novo ou outro modelo. */
class RetryableAiError extends Error {
  constructor(detail: string, public readonly publicError: AiServiceError) {
    super(detail);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function envList(name: string, fallback: string[]) {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export class AiService {
  public isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  /** Envia a requisição e devolve o texto final gerado pelo modelo. */
  public async generateText(request: AiRequest): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AiServiceError('GEMINI_API_KEY não configurada no backend.', 503);
    }

    // Modelo principal + reservas. No plano gratuito a cota e a disponibilidade são por modelo,
    // então, se um estiver sobrecarregado ou sem cota, tentamos o próximo.
    const models = [
      ...new Set([
        request.model || process.env.GEMINI_MODEL || DEFAULT_MODEL,
        ...(request.fallbackModels ?? envList('GEMINI_FALLBACK_MODELS', DEFAULT_FALLBACKS)),
      ]),
    ];

    let lastError: AiServiceError = new AiServiceError('O serviço de IA retornou um erro.');
    for (const model of models) {
      const attempts = request.retrySameModel === false ? 1 : 2;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          return await this.callModel(apiKey, model, request);
        } catch (error) {
          if (!(error instanceof RetryableAiError)) throw error;
          lastError = error.publicError;
          console.error(`[aiService] ${model} tentativa ${attempt}: ${error.message}`);
          if (error.publicError.status === 429) break; // sem cota neste modelo: vai para o próximo
          if (attempt < attempts) await sleep(700);
        }
      }
    }
    throw lastError;
  }

  private async callModel(apiKey: string, model: string, request: AiRequest): Promise<string> {
    const body: Record<string, unknown> = {
      model,
      input: request.input,
      store: false,
    };

    if (request.systemInstruction) {
      body.system_instruction = request.systemInstruction;
    }
    const generationConfig: Record<string, unknown> = {};
    if (request.maxOutputTokens) generationConfig.max_output_tokens = request.maxOutputTokens;
    if (request.thinkingLevel) generationConfig.thinking_level = request.thinkingLevel;
    if (Object.keys(generationConfig).length > 0) {
      body.generation_config = generationConfig;
    }
    if (request.jsonSchema) {
      body.response_format = {
        type: 'text',
        mime_type: 'application/json',
        schema: request.jsonSchema,
      };
    }

    let response: Response;
    try {
      response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(request.timeoutMs ?? 30_000),
      });
    } catch (error: any) {
      throw new RetryableAiError(
        `falha de rede: ${error?.message ?? error}`,
        new AiServiceError('Não foi possível contatar o serviço de IA.'),
      );
    }

    const payload: any = await response.json().catch(() => null);

    if (!response.ok) {
      const detail = payload?.error?.message ?? `HTTP ${response.status}`;
      if (response.status === 429) {
        throw new RetryableAiError(
          detail,
          new AiServiceError('Limite gratuito da IA atingido. Tente novamente em instantes.', 429),
        );
      }
      if (response.status >= 500) {
        throw new RetryableAiError(detail, new AiServiceError('O serviço de IA está sobrecarregado. Tente novamente.'));
      }
      console.error('[aiService] Erro do Gemini:', detail);
      throw new AiServiceError('O serviço de IA retornou um erro.');
    }

    const text = extractText(payload);
    if (!text) {
      throw new AiServiceError('O serviço de IA não retornou conteúdo.');
    }
    return text;
  }

  /** Igual a generateText, mas faz o parse da resposta como JSON. */
  public async generateJson<T>(request: AiRequest): Promise<T> {
    const text = await this.generateText(request);
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      throw new AiServiceError('A resposta da IA não veio em JSON válido.');
    }
  }
}

/** Junta os textos dos passos `model_output` da Interaction. */
function extractText(payload: any): string {
  const steps: any[] = Array.isArray(payload?.steps) ? payload.steps : [];
  return steps
    .filter((step) => step?.type === 'model_output' && Array.isArray(step.content))
    .flatMap((step) => step.content)
    .filter((part: any) => part?.type === 'text' && typeof part.text === 'string')
    .map((part: any) => part.text)
    .join('')
    .trim();
}
