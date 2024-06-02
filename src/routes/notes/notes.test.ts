/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import request from 'supertest';
import app from '../../app';

describe('GET /api/notes/<NUM>', () => {
  it('GET /api/notes/0', async () => {
    await request(app)
      .get('/api/notes/0')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(422)
      .then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.stack[0]).toMatch('ZodError');
        expect(res.body.stack[2]).toMatch('too_small');
      });
  });

  it('GET /api/notes/9999999', async () => {
    await request(app)
      .get('/api/notes/9999999')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBe(0);
      });
  });
});
