/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import request from 'supertest';
import app from '../../app';

describe('GET /api/address-data-by-zip-code?zip_code=', () => {
  it('GET /api/address-data-by-zip-code?zip_code=100-6036', async () => {
    await request(app)
      .get('/api/address-data-by-zip-code?zip_code=100-6036')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.address.other).toMatch('霞が関霞が関ビル（３６階）');
      });
  });

  it('GET /api/address-data-by-zip-code?zip_code=0010010', async () => {
    await request(app)
      .get('/api/address-data-by-zip-code?zip_code=0010010')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.address.other).toMatch('北十条西（１～４丁目）');
      });
  });

  it('GET /api/address-data-by-zip-code?zip_code=907-0023', async () => {
    await request(app)
      .get('/api/address-data-by-zip-code?zip_code=907-0023')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.address.other).toMatch('石垣');
      });
  });

  it('GET /api/address-data-by-zip-code?zip_code=000-0000', async () => {
    await request(app)
      .get('/api/address-data-by-zip-code?zip_code=000-0000')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.error.noFirstThreeDigits).toBe(true);
      });
  });

  it('GET /api/address-data-by-zip-code?zip_code=907-8888', async () => {
    await request(app)
      .get('/api/address-data-by-zip-code?zip_code=907-8888')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.error.notFound).toBe(true);
      });
  });

  it('GET /api/address-data-by-zip-code?zip_code=abc-DEF', async () => {
    await request(app)
      .get('/api/address-data-by-zip-code?zip_code=abc-DEF')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(422)
      .then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.stack[0]).toMatch('ZodError');
      });
  });
});
