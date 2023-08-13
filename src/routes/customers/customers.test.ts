import request from 'supertest';

import app from '../../app';

describe('GET /api/customers', () => {
  it('JSON でカスタマー情報の配列を返却', async () => {
    await request(app)
      .get('/api/customers')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBe(10);
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('searched_name');
      });
  });
});

describe('GET /api/customers?size=3', () => {
  it('JSON で長さ３のカスタマー情報の配列を返却', async () => {
    await request(app)
      .get('/api/customers?size=3')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBe(3);
      });
  });
});

describe('GET /api/customers?size=50&page=999999999', () => {
  it('JSON で長さ０のカスタマー情報の配列を返却', async () => {
    await request(app)
      .get('/api/customers?size=50&page=999999999')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBe(0);
      });
  });
});

describe('GET /api/customers?size=50&page=-10', () => {
  it('JSON で ZodError を返却', async () => {
    await request(app)
      .get('/api/customers?size=50&page=-10')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(422)
      .then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.stack).toMatch('ZodError');
      });
  });
});

describe('GET /api/customers?size=large', () => {
  it('JSON で ZodError ( 無効な型 ) を返却', async () => {
    await request(app)
      .get('/api/customers?size=large')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(422)
      .then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.stack).toMatch('ZodError');
        expect(res.body.stack).toMatch('invalid_type');
      });
  });
});
