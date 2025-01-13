-- シフトJIS CRLF で保存してコマンドプロンプトで実行
-- psql> \i <FULL_PATH(unix like)>.sql
CREATE TABLE shipping_instruction_print_history (
  delivery_date DATE NOT NULL DEFAULT current_date + 1,
  delivery_time_str VARCHAR(32),
  printed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  page_num_str VARCHAR(8),
  customer_name VARCHAR(60) NOT NULL DEFAULT '名称未入力',
  customer_address VARCHAR(96) NOT NULL DEFAULT '住所未入力',
  -- 卸売業者、帳合先
  wholesaler VARCHAR(32),
  order_number VARCHAR(64),
  shipping_date DATE NOT NULL DEFAULT current_date,
  carrier VARCHAR(32),
  package_count SMALLINT,
  items_of_order TEXT NOT NULL DEFAULT '注文未入力',
  PRIMARY KEY (delivery_date, printed_at)
)
PARTITION BY
  RANGE (delivery_date);