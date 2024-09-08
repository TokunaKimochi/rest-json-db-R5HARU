-- インボイステーブル関係
alter table invoices rename to invoice_types;
alter sequence invoices_id_seq rename to invoice_types_id_seq;
-- カスタマーテーブル関係
alter table customers rename invoice_id to invoice_type_id;
alter table customers drop constraint customers_address_sha1_sha1_same_val_key;
update customers set sha1_same_val = 0;
alter table customers alter column sha1_same_val drop not null;
alter table customers alter column sha1_same_val drop default;
alter table customers alter column sha1_same_val type boolean USING sha1_same_val::text::boolean;
alter table customers rename sha1_same_val to is_individual;
alter table customers alter column is_individual set default false;
alter table customers alter column is_individual set not null;
update customers set nja_lat = '0' where nja_lat = 'null' or nja_lat is null;
alter table customers alter column nja_lat type double precision USING nja_lat::double precision;
update customers set nja_lng = '0' where nja_lng = 'null' or nja_lng is null;
alter table customers alter column nja_lng type double precision USING nja_lng::double precision;
update customers set nja_lat = null where nja_lat = 0;
update customers set nja_lng = null where nja_lng = 0;
-- ノートテーブル関係
alter table notes alter column body type text;
-- 不用なテーブルを削除
drop table australia, libya, tanzania;
-- 統計情報を再収集
ANALYZE;