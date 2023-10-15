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
          newId = res.body.id;
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
