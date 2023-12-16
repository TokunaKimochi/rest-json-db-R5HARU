import request from 'supertest';

import app from './app';

describe('NOT FOUND', () => {
  it('存在しない API へのアクセス', async () => {
    await request(app)
      .get('/hoge-fuga-piyo')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404);
  });
});

describe('GET /', () => {
  it('JSON で固定値を返却', async () => {
    await request(app).get('/').set('Accept', 'application/json').expect('Content-Type', /json/).expect(200, {
      message: '☕Hallo Local Area Network❢',
    });
  });
});
