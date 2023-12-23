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

if (process.env.INSERT_ENABLED) {
  describe('順番固定 POST -> GET /:id -> PUT /:id -> DELETE /:id', () => {
    let newId: number;
    it('POST /api/customers', async () => {
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
          invoice_type_id: 1,
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('id');
          newId = res.body.id as number;
          expect(res.body.id).toBeGreaterThan(0);
        });
    });

    it('GET /api/customers/:id', async () => {
      await request(app)
        .get(`/api/customers/${newId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('searched_name');
        });
    });

    it('PUT /api/customers/:id', async () => {
      await request(app)
        .put(`/api/customers/${newId}`)
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
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.id).toEqual(newId);
        });
    });

    it('DELETE /api/customers/:id', async () => {
      await request(app)
        .delete(`/api/customers/${newId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('command');
          expect(res.body.command).toEqual('DELETE');
          expect(res.body.rowCount).toEqual(1);
        });
    });
  });
} else {
  console.log(
    'ℹ データベースに副作用を起こすテストはスキップされました\n\t➥ 環境変数で INSERT_ENABLED=true とすれば動作を変えられます'
  );
}
