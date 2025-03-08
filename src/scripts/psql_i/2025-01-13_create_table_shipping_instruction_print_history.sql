-- シフトJIS CRLF で保存してコマンドプロンプトで実行
-- psql> \i <FULL_PATH(unix like)>.sql
CREATE TABLE shipping_instruction_print_history (
  delivery_date DATE NOT NULL,
  delivery_time_str VARCHAR(32) NOT NULL DEFAULT '',
  printed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  page_num_str VARCHAR(8) NOT NULL DEFAULT '',
  non_fk_customer_id INTEGER,
  customer_name VARCHAR(60) NOT NULL,
  customer_address VARCHAR(96) NOT NULL,
  -- 卸売業者、帳合先
  wholesaler VARCHAR(32) NOT NULL DEFAULT '',
  order_number VARCHAR(64) NOT NULL DEFAULT '',
  shipping_date DATE NOT NULL DEFAULT current_date,
  carrier VARCHAR(32) NOT NULL DEFAULT '',
  package_count SMALLINT,
  items_of_order TEXT NOT NULL,
  PRIMARY KEY (delivery_date, printed_at)
)
PARTITION BY
  RANGE (delivery_date);