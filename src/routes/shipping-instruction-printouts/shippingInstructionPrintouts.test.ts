/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import request from 'supertest';
import app from '../../app';
import { ShippingInstructionPrintIDWithoutBrand } from './shippingInstructionPrintouts.types';

if (process.env.INSERT_ENABLED) {
  const createdHistory: ShippingInstructionPrintIDWithoutBrand[] = [];
  describe('順番固定。データベース副作用ありのテスト群', () => {
    it('POST /api/shipping-instruction-printouts', async () => {
      await request(app)
        .post('/api/shipping-instruction-printouts')
        .set('Accept', 'application/json')
        .send({
          delivery_date: '2024/2/29',
          delivery_time_str: 'AM必着',
          page_num_str: '',
          non_fk_customer_id: '1234',
          customer_name: '🧪テスト🎭️',
          customer_address: '東京都千代田区',
          wholesaler: '',
          order_number: '',
          shipping_date: '2024/2/28',
          carrier: 'ヤマト運輸',
          package_count: '',
          items_of_order: 'ミネラルウォーター: 1ケース',
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.isSuccess).toEqual(true);
          createdHistory.push(res.body.id as ShippingInstructionPrintIDWithoutBrand);
        });
    });

    it('POST /api/shipping-instruction-printouts', async () => {
      await request(app)
        .post('/api/shipping-instruction-printouts')
        .set('Accept', 'application/json')
        .send({
          delivery_date: '2024/3/1',
          delivery_time_str: 'AM必着',
          page_num_str: '',
          non_fk_customer_id: '1234',
          customer_name: '🧪テスト🎭️',
          customer_address: '東京都千代田区',
          wholesaler: '',
          order_number: '',
          shipping_date: '2024/2/29',
          carrier: '佐川急便',
          package_count: 1,
          items_of_order: 'コシヒカリ: 1ケース',
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.isSuccess).toEqual(true);
          createdHistory.push(res.body.id as ShippingInstructionPrintIDWithoutBrand);
        });
    });

    it('GET /api/shipping-instruction-printouts?category=delivery_date&dateA=YYYY-MM-DD&dateB=YYYY-MM-DD', async () => {
      await request(app)
        .get(
          `/api/shipping-instruction-printouts?category=delivery_date&dateA=${createdHistory[0].delivery_date}&dateB=${createdHistory[1].delivery_date}`
        )
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('length');
          expect(res.body[0]).toHaveProperty('non_fk_customer_id');
          expect(res.body[0].items_of_order).toMatch(/ミネラル/);
          expect(res.body.length).toEqual(2);
        });
    });

    it('其の壱（失敗） PUT /api/shipping-instruction-printouts?delivery_date=YYYY-MM-DD&printed_at=YYYY-MM-DD HH:MM:SS.SSSSSS+09', async () => {
      await request(app)
        .put(
          `/api/shipping-instruction-printouts?delivery_date=${
            createdHistory[0].delivery_date
          }&printed_at=${encodeURIComponent(createdHistory[0].printed_at)}`
        )
        .set('Accept', 'application/json')
        // 余計な non_fk_customer_id も送ってみる
        .send({
          delivery_date: '2024/2/29',
          delivery_time_str: 'AM必着',
          page_num_str: '',
          non_fk_customer_id: '777',
          customer_name: '✒️アップデート',
          customer_address: '東京都千代田区',
          wholesaler: '',
          order_number: '',
          shipping_date: '2024/2/28',
          carrier: 'ヤマト運輸',
          package_count: 10,
          items_of_order: 'ミネラルウォーター: 10ケース',
        })
        .expect('Content-Type', /json/)
        .expect(422)
        .then((res) => {
          expect(res.body.stack[0]).toMatch('ZodError');
        });
    });

    it('其の壱（成功） PUT /api/shipping-instruction-printouts?delivery_date=YYYY-MM-DD&printed_at=YYYY-MM-DD HH:MM:SS.SSSSSS+09', async () => {
      await request(app)
        .put(
          `/api/shipping-instruction-printouts?delivery_date=${
            createdHistory[0].delivery_date
          }&printed_at=${encodeURIComponent(createdHistory[0].printed_at)}`
        )
        .set('Accept', 'application/json')
        // 決められた１１項目のみ
        .send({
          delivery_date: '2024/2/29',
          delivery_time_str: 'AM必着',
          page_num_str: '',
          customer_name: '✒️アップデート',
          customer_address: '東京都千代田区',
          wholesaler: '',
          order_number: '',
          shipping_date: '2024/2/28',
          carrier: 'ヤマト運輸',
          package_count: 10,
          items_of_order: 'ミネラルウォーター: 10ケース',
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('printed_at');
          expect(res.body.non_fk_customer_id).toEqual(1234);
          expect(res.body.customer_name).toEqual('✒️アップデート');
          expect(res.body.package_count).toEqual(10);
        });
    });

    it('其の壱 DELETE /api/shipping-instruction-printouts?delivery_date=YYYY-MM-DD&printed_at=YYYY-MM-DD HH:MM:SS.SSSSSS+09', async () => {
      await request(app)
        .delete(
          `/api/shipping-instruction-printouts?delivery_date=${
            createdHistory[0].delivery_date
          }&printed_at=${encodeURIComponent(createdHistory[0].printed_at)}`
        )
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('command');
          expect(res.body.command).toEqual('DELETE');
          expect(res.body.rowCount).toEqual(1);
        });
    });
    it('其の弐 DELETE /api/shipping-instruction-printouts?delivery_date=YYYY-MM-DD&printed_at=YYYY-MM-DD HH:MM:SS.SSSSSS+09', async () => {
      await request(app)
        .delete(
          `/api/shipping-instruction-printouts?delivery_date=${
            createdHistory[1].delivery_date
          }&printed_at=${encodeURIComponent(createdHistory[1].printed_at)}`
        )
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
    'ℹ 印刷履歴でデータベースに副作用を起こすテストはスキップされました\n\t➥ 環境変数で INSERT_ENABLED=true とすれば動作を変えられます'
  );
}
