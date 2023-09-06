import request from 'supertest';

import app from '../../app';

describe('GET /api/customers', () => {
  it('GET /api/customers', async () => {
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

  it('GET /api/customers?size=3', async () => {
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

  it('GET /api/customers?size=50&page=999999999', async () => {
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

  it('GET /api/customers?size=50&page=-10', async () => {
    await request(app)
      .get('/api/customers?size=50&page=-10')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(422)
      .then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.stack[0]).toMatch('ZodError');
      });
  });

  it('GET /api/customers?size=large', async () => {
    await request(app)
      .get('/api/customers?size=large')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(422)
      .then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.stack[0]).toMatch('ZodError');
        expect(res.body.stack[2]).toMatch('invalid_type');
      });
  });
});
