import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/db/client.js', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn() },
    userDeck: { findMany: jest.fn() },
  },
}));

const { ChatService, resetChatRateLimit, sanitizeHistory, stripMarkdown } = await import(
  '../../src/services/chatService.js'
);
const { default: prisma } = await import('../../src/db/client.js');

const mockedPrisma = prisma as any;
const fetchMock = jest.fn<typeof fetch>();

function geminiSays(text: string) {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ steps: [{ type: 'model_output', content: [{ type: 'text', text }] }] })),
  );
}

describe('ChatService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    fetchMock.mockReset();
    global.fetch = fetchMock as any;
    process.env.GEMINI_API_KEY = 'test-key';
    delete process.env.GEMINI_CHAT_MODEL;
    resetChatRateLimit();
    mockedPrisma.user.findUnique.mockResolvedValue({ nickname: 'Ash' });
    mockedPrisma.userDeck.findMany.mockResolvedValue([
      { name: 'Fogo', game: { name: 'Pokémon TCG' }, _count: { items: 12 } },
    ]);
  });

  it('[Caminho Feliz] envia histórico, instruções de escopo e contexto do usuário', async () => {
    geminiSays('**Use** o localizador oficial:\n- Play! Pokémon');

    const result = await new ChatService().reply(1, [
      { role: 'user', text: 'Oi' },
      { role: 'assistant', text: 'Olá!' },
      { role: 'user', text: 'Onde tem torneio?' },
    ]);

    expect(result.reply).toBe('Use o localizador oficial:\n• Play! Pokémon');
    const body = JSON.parse(String(fetchMock.mock.calls[0]![1]!.body));
    expect(body.model).toBe('gemini-3.6-flash');
    expect(body.generation_config.thinking_level).toBe('low');
    expect(body.system_instruction).toContain('SOMENTE');
    expect(body.system_instruction).toContain('Fogo (Pokémon TCG, 12 cartas)');
    expect(body.input).toContain('Usuário: Oi');
    expect(body.input).toContain('Assistente: Olá!');
    expect(body.input).toContain('Usuário: Onde tem torneio?');
  });

  it('no chat, se um modelo falhar, vai direto para o próximo (sem repetir o mesmo)', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: 'high demand' } }), { status: 503 }));
    geminiSays('resposta do reserva');
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await new ChatService().reply(1, [{ role: 'user', text: 'oi' }]);

    expect(result.reply).toBe('resposta do reserva');
    const models = fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init!.body)).model);
    expect(models).toEqual(['gemini-3.6-flash', 'gemini-3.8-flash']);
  });

  it('[Erro] exige que a última mensagem seja do usuário', async () => {
    await expect(new ChatService().reply(1, [{ role: 'assistant', text: 'oi' }])).rejects.toMatchObject({ status: 400 });
    await expect(new ChatService().reply(1, 'lixo')).rejects.toMatchObject({ status: 400 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('[Erro] limita mensagens por usuário (protege a cota gratuita)', async () => {
    fetchMock.mockImplementation(async () =>
      new Response(JSON.stringify({ steps: [{ type: 'model_output', content: [{ type: 'text', text: 'ok' }] }] })),
    );
    const service = new ChatService();
    for (let i = 0; i < 20; i++) {
      await service.reply(7, [{ role: 'user', text: `msg ${i}` }]);
    }
    await expect(service.reply(7, [{ role: 'user', text: 'mais uma' }])).rejects.toMatchObject({ status: 429 });
    // outro usuário não é afetado
    await expect(service.reply(8, [{ role: 'user', text: 'oi' }])).resolves.toEqual({ reply: 'ok' });
  });

  it('sanitizeHistory descarta lixo, corta textos longos e mantém só as últimas 12', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', text: `m${i}` }));
    const result = sanitizeHistory([{ role: 'system', text: 'hack' }, { role: 'user', text: '   ' }, ...many]);
    expect(result).toHaveLength(12);
    expect(result[0]).toEqual({ role: 'user', text: 'm8' });
    expect(sanitizeHistory([{ role: 'user', text: 'x'.repeat(5000) }])[0]!.text).toHaveLength(1500);
  });

  it('stripMarkdown remove negrito e títulos e troca hífens por marcadores', () => {
    expect(stripMarkdown('## Dica\n**Atenção**: __isso__\n* item')).toBe('Dica\nAtenção: isso\n• item');
  });
});
