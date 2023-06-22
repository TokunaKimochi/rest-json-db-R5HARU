import request from 'supertest';

import app from './app';

describe('NOT FOUND', () => {
  it('存在しない API へのアクセス', (done) => {
    request(app)
      .get('/hoge-fuga-boko')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404, done);
  });
});

describe('GET /', () => {
  it('JSON で固定値を返却', (done) => {
    request(app).get('/').set('Accept', 'application/json').expect('Content-Type', /json/).expect(
      200,
      {
        message: '☕Hallo Local Area Network❢',
      },
      done
    );
  });
});
