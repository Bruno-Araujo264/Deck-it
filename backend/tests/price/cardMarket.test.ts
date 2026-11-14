import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/db/client.js', () => ({
  __esModule: true,
  default: { cardPrice: { findMany: jest.fn() } },
}));

const { PriceService } = await import('../../src/services/priceService.js');
const { resetBrlRatesCache } = await import('../../src/services/exchangeService.js');
const { default: prisma } = await import('../../src/db/client.js');

const mockedPrisma = prisma as any;
const fetchMock = jest.fn<typeof fetch>();

function fxReturns(rate: number) {
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ date: '2026-11-13', rates: { BRL: rate } })));
}

const row = (priceType: string, price: number, priceDate: string) => ({
  gameId: 2, externalId: 'base1-4', priceType, price, priceDate: new Date(priceDate),
});

describe('PriceService.getCardMarket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
    global.fetch = fetchMock as any;
    resetBrlRatesCache();
  });

  it('pega o preço mais recente de cada tipo e converte para reais', async () => {
    mockedPrisma.cardPrice.findMany.mockResolvedValue([
      row('eur', 380, '2026-11-14'),
      row('usd_holo', 990, '2026-11-14'),
      row('usd_holo', 900, '2026-11-13'), // antigo, ignorado
    ]);
    fxReturns(5); // USD
    fxReturns(6); // EUR

    const market = await new PriceService().getCardMarket('base1-4', 2);

    expect(mockedPrisma.cardPrice.findMany.mock.calls[0][0].where).toEqual({ externalId: 'base1-4', gameId: 2 });
    expect(market.prices.map((p: any) => [p.priceType, p.value, p.valueBrl])).toEqual([
      ['usd_holo', 990, 4950],
      ['eur', 380, 2280],
    ]);
    expect(market.estimated).toEqual({ priceType: 'usd_holo', currency: 'USD', value: 990, valueBrl: 4950 });
  });

  it('sem preço no banco devolve lista vazia, sem erro', async () => {
    mockedPrisma.cardPrice.findMany.mockResolvedValue([]);
    fxReturns(5);
    fxReturns(6);

    const market = await new PriceService().getCardMarket('x');

    expect(market.prices).toEqual([]);
    expect(market.estimated).toBeNull();
  });

  it('se a cotação falhar, mantém o preço original sem valor em reais', async () => {
    mockedPrisma.cardPrice.findMany.mockResolvedValue([row('usd', 2, '2026-11-14')]);
    fetchMock.mockRejectedValue(new Error('offline'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const market = await new PriceService().getCardMarket('x');

    expect(market.estimated).toEqual({ priceType: 'usd', currency: 'USD', value: 2, valueBrl: null });
    expect(market.rates).toBeNull();
  });
});
