import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import request from 'supertest';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

jest.unstable_mockModule('../../src/db/client.js', () => ({
  __esModule: true,
  default: {},
}));

const { default: app } = await import('../../src/app.js');
const { ScanService } = await import('../../src/services/scanService.js');

const token = jwt.sign({ userId: 1, email: 'teste@deckit.dev' }, process.env.JWT_SECRET!);

describe('POST /api/scan - rota', () => {
  beforeEach(() => jest.restoreAllMocks());

  it('[Erro] exige token de acesso', async () => {
    const res = await request(app).post('/api/scan').send({ image: 'abc' });
    expect(res.status).toBe(401);
  });

  it('[Erro] retorna 400 sem imagem', async () => {
    const res = await request(app).post('/api/scan').set('Authorization', `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });

  it('[Caminho Feliz] aceita foto grande (acima do limite padrão de 100kb) e repassa ao serviço', async () => {
    const spy = jest
      .spyOn(ScanService.prototype, 'identifyCard')
      .mockResolvedValue({ matchType: 'none', candidates: [] } as any);
    const bigImage = 'A'.repeat(2 * 1024 * 1024);

    const res = await request(app)
      .post('/api/scan')
      .set('Authorization', `Bearer ${token}`)
      .send({ image: bigImage, mimeType: 'image/jpeg', gameId: '1' });

    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledWith(bigImage, 'image/jpeg', 1);
  });

  it('as demais rotas continuam com o limite padrão de corpo', async () => {
    const res = await request(app)
      .post('/api/decks')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'A'.repeat(2 * 1024 * 1024) });
    expect(res.status).toBe(413);
  });
});
