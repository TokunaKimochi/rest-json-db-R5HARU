import request from 'supertest';

import app from '../app';

describe('GET /api', () => {
  it('JSON で固定値を返却', async () => {
    await request(app).get('/api').set('Accept', 'application/json').expect('Content-Type', /json/).expect(200, {
      message: 'API: ⚒The current version has always been v1',
    });
  });
});
