/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import request from 'supertest';
import app from '../../app';

describe('GET /api/invoice-types', () => {
  it('GET /api/invoice-types', async () => {
    await request(app)
      .get('/api/invoice-types')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0].id).toBe(1);
        expect(res.body[3].id).toBe(4);
        expect(res.body[0]).toHaveProperty('name');
      });
  });
});
