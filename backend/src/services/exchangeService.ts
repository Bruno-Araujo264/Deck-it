/**
 * Cotação USD/EUR -> BRL para mostrar o valor estimado das cartas em reais.
 *
 * Fonte: Frankfurter (https://frankfurter.dev) — gratuita, sem chave, taxas do Banco Central Europeu
 * (atualizadas uma vez por dia útil). Guardamos em memória por algumas horas.
 */

const FX_URL = 'https://api.frankfurter.dev/v1/latest';
const CACHE_MS = 6 * 60 * 60 * 1000;

export interface BrlRates {
  USD: number;
  EUR: number;
  date: string;
}

let cache: { rates: BrlRates; fetchedAt: number } | null = null;

async function fetchRate(base: 'USD' | 'EUR'): Promise<{ rate: number; date: string }> {
  const response = await fetch(`${FX_URL}?base=${base}&symbols=BRL`, { signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body: any = await response.json();
  const rate = Number(body?.rates?.BRL);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('cotação inválida');
  return { rate, date: String(body.date ?? '') };
}

/** Devolve as cotações em reais ou null se a API estiver fora (o app mostra só USD/EUR). */
export async function getBrlRates(): Promise<BrlRates | null> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) {
    return cache.rates;
  }
  try {
    const [usd, eur] = await Promise.all([fetchRate('USD'), fetchRate('EUR')]);
    cache = { rates: { USD: usd.rate, EUR: eur.rate, date: usd.date }, fetchedAt: Date.now() };
    return cache.rates;
  } catch (error) {
    console.error('[exchangeService] Falha ao buscar cotação:', error);
    return cache?.rates ?? null; // cotação antiga é melhor que nenhuma
  }
}

/** Só para testes. */
export function resetBrlRatesCache() {
  cache = null;
}
