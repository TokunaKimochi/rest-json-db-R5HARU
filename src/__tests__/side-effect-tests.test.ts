/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import request from 'supertest';
import app from '../app';

if (process.env.INSERT_ENABLED) {
  describe('順番固定。データベース副作用ありのテスト群', () => {
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
          name1: 'てすと㈲ じぇすと支店',
          name2: '',
          alias: 'test',
          invoice_type_id: 1,
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('created_at');
          newId = res.body.id as number;
          expect(res.body.id).toBeGreaterThan(0);
        });
    });

    it('Get /api/customers/:id/checkingOverlap?name1=てすと㈲ じぇすと支店&name2=無し&address_sha1=平和島東京流通センター住所ハッシュ値&nja_pref=愛知県&searched_name=使われないことを期待したおかしな文字列', async () => {
      await request(app)
        .get(
          `/api/customers/${newId}/checkingOverlap?name1=%E3%81%A6%E3%81%99%E3%81%A8%E3%88%B2%20%E3%81%98%E3%81%87%E3%81%99%E3%81%A8%E6%94%AF%E5%BA%97&name2&address_sha1=4001330a9795f59ff788fe7c8b89220c939bc5ec&nja_pref=%E6%84%9B%E7%9F%A5%E7%9C%8C&searched_name=ZZZ`
        )
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('length');
          expect(res.body.length).toBeGreaterThanOrEqual(10);
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
          expect(res.body).toHaveProperty('updated_at');
          expect(res.body.id).toEqual(newId);
        });
    });

    // 顧客情報にメモを追加
    it('POST /api/notes/:customerId', async () => {
      await request(app)
        .post(`/api/notes/${newId}`)
        .set('Accept', 'application/json')
        .send({
          customer_id: newId,
          rank: 1,
          body: 'note_01',
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('customer');
          expect(res.body).toHaveProperty('note');
          expect(res.body.note.rank).toEqual(1);
        });
    });

    it('POST /api/notes/:customerId', async () => {
      await request(app)
        .post(`/api/notes/${newId}`)
        .set('Accept', 'application/json')
        .send({
          customer_id: newId,
          rank: 2,
          body: 'note_02',
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          expect(res.body.customer).toHaveProperty('created_at');
          expect(res.body).toHaveProperty('note');
          expect(res.body.note.body).toEqual('note_02');
        });
    });

    it('POST /api/notes/:customerId', async () => {
      await request(app)
        .post(`/api/notes/${newId}`)
        .set('Accept', 'application/json')
        .send({
          customer_id: newId,
          rank: 3,
          body: 'note_03',
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          expect(res.body.customer).toHaveProperty('created_at');
          expect(res.body).toHaveProperty('note');
          expect(res.body.note.body).toEqual('note_03');
        });
    });

    it('ランク２を奪う POST /api/notes/:customerId', async () => {
      await request(app)
        .post(`/api/notes/${newId}`)
        .set('Accept', 'application/json')
        .send({
          customer_id: newId,
          rank: 2,
          body: 'new note_02',
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          expect(res.body.customer).toHaveProperty('created_at');
          expect(res.body).toHaveProperty('note');
          expect(res.body.note.body).toEqual('new note_02');
        });
    });

    it('GET /api/notes/:customerId', async () => {
      await request(app)
        .get(`/api/notes/${newId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBe(4);
          expect(res.body[1].rank).toEqual(2);
          expect(res.body[1].body).toEqual('new note_02');
          expect(res.body[2].rank).toEqual(3);
          expect(res.body[2].body).toEqual('note_02');
          expect(res.body[3].rank).toEqual(4);
          expect(res.body[3].body).toEqual('note_03');
        });
    });

    it('PUT /api/notes/:customerId/rank/:rank', async () => {
      await request(app)
        .put(`/api/notes/${newId}/rank/3`)
        .set('Accept', 'application/json')
        .send({
          customer_id: newId,
          rank: 3,
          body: 'new note_03',
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body.customer.id).toEqual(newId);
          expect(res.body).toHaveProperty('note');
          expect(res.body.note.body).toEqual('new note_03');
        });
    });

    it('PUT /api/notes/:customerId/rank/:rank', async () => {
      await request(app)
        .put(`/api/notes/${newId}/rank/4`)
        .set('Accept', 'application/json')
        .send({
          customer_id: newId,
          rank: 3,
          body: 'new new note_03',
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body.customer.id).toEqual(newId);
          expect(res.body).toHaveProperty('note');
          expect(res.body.note.body).toEqual('new new note_03');
        });
    });

    it('DELETE /api/notes/:customerId/rank/:rank', async () => {
      await request(app)
        .delete(`/api/notes/${newId}/rank/1`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('command');
          expect(res.body.command).toEqual('DELETE');
          expect(res.body.rowCount).toEqual(1);
        });
    });

    // 存在しないランクのメモに対してアップデートリクエスト
    it('PUT /api/notes/:customerId/rank/:rank', async () => {
      await request(app)
        .put(`/api/notes/${newId}/rank/1`)
        .set('Accept', 'application/json')
        .send({
          customer_id: newId,
          rank: 1,
          body: 'Error ??',
        })
        .expect('Content-Type', /json/)
        .expect(500)
        .then((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.stack[0]).toMatch('DataBaseError');
          expect(res.body.stack[0]).toMatch('🐘');
        });
    });

    // メモが残った状態の顧客を削除。200 を期待
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

    // 顧客情報ごと全てのメモを削除したのでセレクトの結果は空配列
    it('GET /api/notes/:customerId', async () => {
      await request(app)
        .get(`/api/notes/${newId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('length');
          expect(res.body.length).toBe(0);
        });
    });
  });

  // まとめて削除関連
  const idsArr: number[] = [];
  // ５件登録
  for (let i = 0; i < 5; i += 1) {
    // eslint-disable-next-line @typescript-eslint/no-loop-func
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
          name1: `「まとめて削除」テスト用に登録 ${i}`,
          name2: '',
          alias: 'test',
          invoice_type_id: 1,
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          expect(res.body.id).toBeGreaterThan(0);
          idsArr.push(res.body.id as number);
        });
    });
  }
  // メモを登録して、、
  it('POST /api/notes/:customerId', async () => {
    await request(app)
      .post(`/api/notes/${idsArr[0]}`)
      .set('Accept', 'application/json')
      .send({
        customer_id: idsArr[0],
        rank: 1,
        body: 'note_01',
      })
      .expect('Content-Type', /json/)
      .expect(201);
  });
  // メモ有りの状態でまとめて削除
  it('POST /api/customers/delete', async () => {
    await request(app)
      .post('/api/customers/delete')
      .set('Accept', 'application/json')
      .send({
        deleteIds: idsArr,
      })
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        expect(res.body.message).toMatch('関連メモを１件でも持っている顧客レコードは削除できません');
      });
  });
  // メモ有りの顧客を個別に削除（これは成功）
  it('DELETE /api/customers/:id', async () => {
    await request(app)
      .delete(`/api/customers/${idsArr[0]}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('command');
        expect(res.body.command).toEqual('DELETE');
        expect(res.body.rowCount).toEqual(1);
      });
  });
  // 削除済みの id が配列にある状態でまとめて削除
  it('POST /api/customers/delete', async () => {
    await request(app)
      .post('/api/customers/delete')
      .set('Accept', 'application/json')
      .send({
        deleteIds: idsArr,
      })
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        expect(res.body.message).toMatch('存在しない顧客レコードの削除が要求されました');
      });
  });
  // 上で登録した顧客をまとめて削除
  it('POST /api/customers/delete', async () => {
    await request(app)
      .post('/api/customers/delete')
      .set('Accept', 'application/json')
      .send({
        deleteIds: idsArr.slice(1),
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.rowCount).toEqual(4);
      });
  });
}
if (!process.env.INSERT_ENABLED) {
  describe('PUT /api/customers/0', () => {
    it('PUT /api/customers/0', async () => {
      await request(app)
        .put('/api/customers/0')
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
        .expect(422)
        .then((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.stack[0]).toMatch('ZodError');
          expect(res.body.stack[2]).toMatch('too_small');
        });
    });
  });
  console.log(
    'ℹ データベースに副作用を起こすテストはスキップされました\n\t➥ 環境変数で INSERT_ENABLED=true とすれば動作を変えられます'
  );
}
