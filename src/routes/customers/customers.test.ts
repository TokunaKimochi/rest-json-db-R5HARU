/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

  it('GET /api/customers/0', async () => {
    await request(app)
      .get('/api/customers/0')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(422)
      .then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.stack[0]).toMatch('ZodError');
        expect(res.body.stack[2]).toMatch('too_small');
      });
  });

  it('GET /api/customers?search_name=三菱食品', async () => {
    await request(app)
      .get('/api/customers?search_name=%E4%B8%89%E8%8F%B1%E9%A3%9F%E5%93%81')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBeGreaterThanOrEqual(10);
      });
  });

  it('GET /api/customers?search_name=まるふく商事 催事', async () => {
    await request(app)
      .get('/api/customers?search_name=%E3%81%BE%E3%82%8B%E3%81%B5%E3%81%8F%E5%95%86%E4%BA%8B+%E5%82%AC%E4%BA%8B')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBeGreaterThanOrEqual(1);
      });
  });

  it('GET /api/customers?search_name=気付 担当者', async () => {
    await request(app)
      .get('/api/customers?search_name=%E6%B0%97%E4%BB%98+%E6%8B%85%E5%BD%93%E8%80%85')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBeGreaterThanOrEqual(1);
      });
  });

  it('GET /api/customers?search_name=㈲', async () => {
    await request(app)
      .get('/api/customers?search_name=%E3%88%B2')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBeGreaterThanOrEqual(10);
      });
  });

  it('GET /api/customers?search_name=三菱食品 :福岡県', async () => {
    await request(app)
      .get('/api/customers?search_name=%E4%B8%89%E8%8F%B1%E9%A3%9F%E5%93%81+%3A%E7%A6%8F%E5%B2%A1%E7%9C%8C')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBeGreaterThanOrEqual(1);
      });
  });

  it('GET /api/customers?search_name=三菱食品 ：東京都', async () => {
    await request(app)
      .get('/api/customers?search_name=%E4%B8%89%E8%8F%B1%E9%A3%9F%E5%93%81+%EF%BC%9A%E6%9D%B1%E4%BA%AC%E9%83%BD')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBeGreaterThanOrEqual(1);
      });
  });

  it('GET /api/customers?search_name=::文京区', async () => {
    await request(app)
      .get('/api/customers?search_name=%3A%3A%E6%96%87%E4%BA%AC%E5%8C%BA')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBeGreaterThanOrEqual(10);
      });
  });

  it('GET /api/customers?search_name=：：名古屋市', async () => {
    await request(app)
      .get('/api/customers?search_name=%EF%BC%9A%EF%BC%9A%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%B8%82')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBeGreaterThanOrEqual(10);
      });
  });

  it('GET /api/customers?search_name=:大分県', async () => {
    await request(app)
      .get('/api/customers?search_name=%3A%E5%A4%A7%E5%88%86%E7%9C%8C')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBeGreaterThanOrEqual(1);
      });
  });

  it('GET /api/customers?search_name=：沖縄県', async () => {
    await request(app)
      .get('/api/customers?search_name=%EF%BC%9A%E6%B2%96%E7%B8%84%E7%9C%8C')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBeGreaterThanOrEqual(1);
      });
  });
});

describe('POST /api/customers', () => {
  it('invoice_type_id: 0 POST /api/customers', async () => {
    await request(app)
      .post('/api/customers')
      .set('Accept', 'application/json')
      .send({
        tel: '0565-28-2121',
        zip_code: '471-8571',
        address1: '豊田市トヨタ町1番地',
        address2: '',
        address3: '',
        name1: 'てすと',
        name2: '',
        alias: 'test',
        // invoice_types テーブルの id は 1 から始まる
        invoice_type_id: 0,
      })
      .expect('Content-Type', /json/)
      .expect(422)
      .then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.stack[0]).toMatch('ZodError');
        expect(res.body.stack[2]).toMatch('too_small');
      });
  });

  it('外部キー制約違反 POST /api/customers', async () => {
    await request(app)
      .post('/api/customers')
      .set('Accept', 'application/json')
      .send({
        tel: '0565-28-2121',
        zip_code: '471-8571',
        address1: '豊田市トヨタ町1番地',
        address2: '',
        address3: '',
        name1: 'てすと',
        name2: '',
        alias: 'test',
        // invoice_types テーブルの id に無さそうな大きな数字
        invoice_type_id: 888,
      })
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.stack[0]).toMatch('🐘');
      });
  });
});

describe('PUT /api/customers/:id', () => {
  it('無さそうな大きな id PUT /api/customers/:id', async () => {
    await request(app)
      .put('/api/customers/888888888')
      .set('Accept', 'application/json')
      .send({
        tel: '0565-28-2121',
        zip_code: '471-8571',
        address1: '豊田市トヨタ町1番地',
        address2: '更新試行',
        address3: 'アップデートテスト',
        name1: '更新テスト',
        name2: '',
        alias: 'testTEST',
        invoice_type_id: 3,
      })
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.stack[0]).toMatch('🐘');
      });
  });
});

describe('DELETE /api/customers/:id', () => {
  it('無さそうな大きな id DELETE /api/customers/:id', async () => {
    await request(app)
      .delete('/api/customers/888888888')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.stack[0]).toMatch('🐘🔍');
      });
  });
});

describe('GET /api/customers/:id/checkingOverlap', () => {
  it('Get /api/customers/非数値/checkingOverlap?name1=名前(1)&name2=名前(2)&address_sha1=桁足らず住所ハッシュ値&nja_pref=都道府県&searched_name=名前(1)名前(2)', async () => {
    await request(app)
      .get(
        '/api/customers/NotNumber/checkingOverlap?name1=NAME(1)&name2=NAME(2)&address_sha1=888&nja_pref=tokyo&searched_name=NAME1NAME2'
      )
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(422)
      .then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.stack[0]).toMatch('ZodError');
        expect(res.body.stack[2]).toMatch('invalid_type');
      });
  });

  it('Get /api/customers/:id/checkingOverlap?name1=名前(1)&name2=名前(2)&address_sha1=桁足らず住所ハッシュ値&nja_pref=都道府県&searched_name=名前(1)名前(2)', async () => {
    await request(app)
      .get(
        '/api/customers/1/checkingOverlap?name1=NAME(1)&name2=NAME(2)&address_sha1=888&nja_pref=tokyo&searched_name=NAME1NAME2'
      )
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(422)
      .then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.stack[0]).toMatch('ZodError');
        expect(res.body.stack[2]).toMatch('too_small');
      });
  });

  it('Get /api/customers/無関係のid/checkingOverlap?name1=静香園&name2=無し&address_sha1=平和島東京流通センター住所ハッシュ値&nja_pref=千葉県&searched_name=静香園', async () => {
    await request(app)
      .get(
        '/api/customers/777/checkingOverlap?name1=%E9%9D%99%E9%A6%99%E5%9C%92&name2&address_sha1=4001330a9795f59ff788fe7c8b89220c939bc5ec&nja_pref=%E5%8D%83%E8%91%89%E7%9C%8C&searched_name=%E9%9D%99%E9%A6%99%E5%9C%92'
      )
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.stack[0]).toMatch('🐘');
      });
  });

  it('Get /api/customers/静香園のid/checkingOverlap?name1=静香園&name2=無し&address_sha1=平和島東京流通センター住所ハッシュ値&nja_pref=千葉県&searched_name=静香園', async () => {
    await request(app)
      .get(
        '/api/customers/26131/checkingOverlap?name1=%E9%9D%99%E9%A6%99%E5%9C%92&name2&address_sha1=4001330a9795f59ff788fe7c8b89220c939bc5ec&nja_pref=%E5%8D%83%E8%91%89%E7%9C%8C&searched_name=%E9%9D%99%E9%A6%99%E5%9C%92'
      )
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('length');
        expect(res.body.length).toBeGreaterThanOrEqual(10);
      });
  });
});
