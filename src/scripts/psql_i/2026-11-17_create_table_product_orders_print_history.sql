-- シフトJIS CRLF で保存してコマンドプロンプトで実行
-- psql> \i <FULL_PATH(unix like)>.sql
CREATE TYPE product_sku_unit AS ENUM('case', 'inner_carton', 'piece');

CREATE TABLE product_orders_print_history (
  id BIGSERIAL NOT NULL,
  order_date DATE NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT transaction_timestamp(),
  sku_id INTEGER NOT NULL,
  sku_name TEXT NOT NULL,
  case_quantity INTEGER,
  inner_carton_quantity INTEGER,
  display_category_name TEXT NOT NULL,
  internal_code TEXT,
  jan_code TEXT,
  order_quantity INTEGER NOT NULL,
  order_unit product_sku_unit NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time_slot TEXT NOT NULL,
  /*
   * components:
   *   [{ symbol, component_id, amount, pieces }, ...] または false
   *
   * combinations:
   *   [{ combination_id, quantity, item_product_short_name }, ...] または false
   */
  components JSONB NOT NULL DEFAULT 'false'::jsonb,
  combinations JSONB NOT NULL DEFAULT 'false'::jsonb,
  remark TEXT,
  /*
   * PostgreSQL のパーティション親表では、PRIMARY KEY / UNIQUE 制約に
   * パーティションキーを含める必要があるため複合主キーとする。
   * id は BIGSERIAL の共有シーケンスで採番される。
   */
  CONSTRAINT product_orders_print_history_pkey PRIMARY KEY (order_date, id),
  CONSTRAINT product_orders_print_history_case_quantity_nonnegative_chk CHECK (
    case_quantity IS NULL
    OR case_quantity >= 0
  ),
  CONSTRAINT product_orders_print_history_inner_carton_quantity_nonnegative_chk CHECK (
    inner_carton_quantity IS NULL
    OR inner_carton_quantity >= 0
  ),
  CONSTRAINT product_orders_print_history_order_quantity_nonnegative_chk CHECK (order_quantity >= 0),
  CONSTRAINT product_orders_print_history_detail_format_chk CHECK (
    (
      jsonb_typeof(components) = 'array'
      AND combinations = 'false'::jsonb
    )
    OR (
      components = 'false'::jsonb
      AND jsonb_typeof(combinations) = 'array'
    )
  )
)
PARTITION BY
  RANGE (order_date);
