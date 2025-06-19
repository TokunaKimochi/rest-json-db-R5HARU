-- シフトJIS CRLF で保存してコマンドプロンプトで実行
-- psql> \i <FULL_PATH(unix like)>.sql
CREATE TYPE expiration_unit_enum AS ENUM('D', 'M', 'Y');

CREATE TYPE level_abc_enum AS ENUM('A', 'B', 'C');

CREATE TABLE suppliers (
    id SMALLSERIAL PRIMARY KEY,
    tel VARCHAR(15) NOT NULL DEFAULT '',
    fax VARCHAR(14) NOT NULL DEFAULT '',
    url VARCHAR(255) NOT NULL DEFAULT '',
    zip_code VARCHAR(8) NOT NULL,
    address1 VARCHAR(32) NOT NULL,
    address2 VARCHAR(32) NOT NULL DEFAULT '',
    address3 VARCHAR(32) NOT NULL DEFAULT '',
    name1 VARCHAR(30) NOT NULL,
    name2 VARCHAR(30) NOT NULL DEFAULT '',
    contact_person_name VARCHAR(32) NOT NULL DEFAULT '',
    contact_person_phone VARCHAR(15) NOT NULL DEFAULT '',
    contact_person_email VARCHAR(255) NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- まず１つ目の関数を実行
CREATE TRIGGER updated_at_1_suppliers BEFORE
UPDATE ON suppliers FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at カラムが更新された時、２つ目の関数を実行
CREATE TRIGGER updated_at_2_suppliers BEFORE
UPDATE OF updated_at ON suppliers FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- 最後に３つ目の関数を実行
CREATE TRIGGER updated_at_3_suppliers BEFORE
UPDATE ON suppliers FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE unit_types (
    id SMALLSERIAL PRIMARY KEY,
    -- g とか ml ?
    name VARCHAR(8) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- まず１つ目の関数を実行
CREATE TRIGGER updated_at_1_unit_types BEFORE
UPDATE ON unit_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at カラムが更新された時、２つ目の関数を実行
CREATE TRIGGER updated_at_2_unit_types BEFORE
UPDATE OF updated_at ON unit_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- 最後に３つ目の関数を実行
CREATE TRIGGER updated_at_3_unit_types BEFORE
UPDATE ON unit_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE product_sourcing_types (
    id SMALLSERIAL PRIMARY KEY,
    -- 自社製品とか OEM とか
    name VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- まず１つ目の関数を実行
CREATE TRIGGER updated_at_1_product_sourcing_types BEFORE
UPDATE ON product_sourcing_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at カラムが更新された時、２つ目の関数を実行
CREATE TRIGGER updated_at_2_product_sourcing_types BEFORE
UPDATE OF updated_at ON product_sourcing_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- 最後に３つ目の関数を実行
CREATE TRIGGER updated_at_3_product_sourcing_types BEFORE
UPDATE ON product_sourcing_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE product_categories (
    id SMALLSERIAL PRIMARY KEY,
    -- お茶とかコーヒーとか
    name VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- まず１つ目の関数を実行
CREATE TRIGGER updated_at_1_product_categories BEFORE
UPDATE ON product_categories FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at カラムが更新された時、２つ目の関数を実行
CREATE TRIGGER updated_at_2_product_categories BEFORE
UPDATE OF updated_at ON product_categories FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- 最後に３つ目の関数を実行
CREATE TRIGGER updated_at_3_product_categories BEFORE
UPDATE ON product_categories FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE product_packaging_types (
    id SMALLSERIAL PRIMARY KEY,
    -- 缶とかペットボトルとか
    name VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- まず１つ目の関数を実行
CREATE TRIGGER updated_at_1_product_packaging_types BEFORE
UPDATE ON product_packaging_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at カラムが更新された時、２つ目の関数を実行
CREATE TRIGGER updated_at_2_product_packaging_types BEFORE
UPDATE OF updated_at ON product_packaging_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- 最後に３つ目の関数を実行
CREATE TRIGGER updated_at_3_product_packaging_types BEFORE
UPDATE ON product_packaging_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE product_inner_packaging_types (
    id SMALLSERIAL PRIMARY KEY,
    -- 缶とかペットボトルとか
    name VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- まず１つ目の関数を実行
CREATE TRIGGER updated_at_1_product_inner_packaging_types BEFORE
UPDATE ON product_inner_packaging_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at カラムが更新された時、２つ目の関数を実行
CREATE TRIGGER updated_at_2_product_inner_packaging_types BEFORE
UPDATE OF updated_at ON product_inner_packaging_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- 最後に３つ目の関数を実行
CREATE TRIGGER updated_at_3_product_inner_packaging_types BEFORE
UPDATE ON product_inner_packaging_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE basic_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(32) UNIQUE NOT NULL,
    jan_code VARCHAR(13) UNIQUE,
    sourcing_type_id SMALLINT NOT NULL DEFAULT 1, -- 1 は自社製造自社製品
    category_id SMALLINT NOT NULL DEFAULT 1, -- 1 は未分類
    packaging_type_id SMALLINT NOT NULL DEFAULT 1, -- 1 は未分類
    -- 賞味期限
    expiration_value INTEGER,
    expiration_unit expiration_unit_enum, -- 'D', 'M', 'Y'
    -- 先代商品の id
    predecessor_id INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT valid_jan_format CHECK (
        jan_code IS NULL
        OR jan_code ~ '^[0-9]{8}$|^[0-9]{13}$'
    ),
    CONSTRAINT not_self_predecessor CHECK (
        predecessor_id IS NULL
        OR predecessor_id <> id
    ),
    FOREIGN KEY (sourcing_type_id) REFERENCES product_sourcing_types (id),
    FOREIGN KEY (category_id) REFERENCES product_categories (id),
    FOREIGN KEY (packaging_type_id) REFERENCES product_packaging_types (id),
    -- self-referential foreign key
    FOREIGN KEY (predecessor_id) REFERENCES basic_products (id)
);

-- まず１つ目の関数を実行
CREATE TRIGGER updated_at_1_basic_products BEFORE
UPDATE ON basic_products FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at カラムが更新された時、２つ目の関数を実行
CREATE TRIGGER updated_at_2_basic_products BEFORE
UPDATE OF updated_at ON basic_products FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- 最後に３つ目の関数を実行
CREATE TRIGGER updated_at_3_basic_products BEFORE
UPDATE ON basic_products FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    basic_id INTEGER NOT NULL,
    supplier_id SMALLINT NOT NULL DEFAULT 1, -- 発注先 1 は自社工場
    name VARCHAR(32) UNIQUE NOT NULL,
    short_name VARCHAR(32) UNIQUE NOT NULL, -- 略称だが長い場合もある
    internal_code VARCHAR(10), -- （社内）商品コード
    is_set_product BOOLEAN NOT NULL DEFAULT false,
    depth_mm INTEGER, -- 商品サイズ縦（奥行き） (mm)
    width_mm INTEGER, -- 商品サイズ横 (mm)
    diameter_mm INTEGER, -- 商品サイズ直径 (mm)
    height_mm INTEGER, -- 商品サイズ高さ (mm)
    weight_g INTEGER, -- 商品重量 (g)
    available_date DATE NOT NULL DEFAULT current_date,
    discontinued_date DATE NOT NULL DEFAULT '2555-01-01',
    note TEXT,
    -- 後で（同時ではない）画像などを関連付ける際に使用するユニークキーとして
    ulid_str VARCHAR(26) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_product_dimensions CHECK (
        (
            diameter_mm IS NOT NULL
            AND depth_mm IS NULL
            AND width_mm IS NULL
        )
        OR (
            (
                depth_mm IS NOT NULL
                OR width_mm IS NOT NULL
            )
            AND diameter_mm IS NULL
        )
    ),
    FOREIGN KEY (basic_id) REFERENCES basic_products (id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
);

-- まず１つ目の関数を実行
CREATE TRIGGER updated_at_1_products BEFORE
UPDATE ON products FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at カラムが更新された時、２つ目の関数を実行
CREATE TRIGGER updated_at_2_products BEFORE
UPDATE OF updated_at ON products FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- 最後に３つ目の関数を実行
CREATE TRIGGER updated_at_3_products BEFORE
UPDATE ON products FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE product_components (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    title VARCHAR(32) NOT NULL,
    symbol VARCHAR(8) NOT NULL,
    amount NUMERIC(8, 2) NOT NULL,
    unit_type_id SMALLINT NOT NULL DEFAULT 1, -- 1 は g（グラム）
    pieces INTEGER NOT NULL DEFAULT 1,
    inner_packaging_type_id SMALLINT NOT NULL DEFAULT 1, -- 1 は未分類
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (unit_type_id) REFERENCES unit_types (id),
    FOREIGN KEY (inner_packaging_type_id) REFERENCES product_inner_packaging_types (id)
);

-- まず１つ目の関数を実行
CREATE TRIGGER updated_at_1_product_components BEFORE
UPDATE ON product_components FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at カラムが更新された時、２つ目の関数を実行
CREATE TRIGGER updated_at_2_product_components BEFORE
UPDATE OF updated_at ON product_components FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- 最後に３つ目の関数を実行
CREATE TRIGGER updated_at_3_product_components BEFORE
UPDATE ON product_components FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE product_combinations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    item_product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT not_equal_id CHECK (product_id <> item_product_id),
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (item_product_id) REFERENCES products (id)
);

-- まず１つ目の関数を実行
CREATE TRIGGER updated_at_1_product_combinations BEFORE
UPDATE ON product_combinations FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at カラムが更新された時、２つ目の関数を実行
CREATE TRIGGER updated_at_2_product_combinations BEFORE
UPDATE OF updated_at ON product_combinations FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- 最後に３つ目の関数を実行
CREATE TRIGGER updated_at_3_product_combinations BEFORE
UPDATE ON product_combinations FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE product_skus (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    name VARCHAR(32) UNIQUE NOT NULL,
    -- ケース入数
    case_quantity INTEGER,
    -- ボール（内箱）入り数
    inner_carton_quantity INTEGER,
    -- ケース ITF コード
    itf_case_code VARCHAR(14) UNIQUE,
    -- ボール ITF コード
    itf_inner_carton_code VARCHAR(14) UNIQUE,
    case_depth_mm INTEGER, -- ケースサイズ縦（奥行き） (mm)
    case_width_mm INTEGER, -- ケースサイズ横 (mm)
    case_height_mm INTEGER, -- ケースサイズ高さ (mm)
    case_weight_g INTEGER, -- ケース重量 (g)
    inner_carton_depth_mm INTEGER, -- ボールサイズ縦（奥行き） (mm)
    inner_carton_width_mm INTEGER, -- ボールサイズ横 (mm)
    inner_carton_height_mm INTEGER, -- ボールサイズ高さ (mm)
    inner_carton_weight_g INTEGER, -- ボール重量 (g)
    -- B はゼロでなければ在庫チェック表に載せる
    priority level_abc_enum NOT NULL DEFAULT 'B',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT valid_itf_case_format CHECK (
        itf_case_code IS NULL
        OR itf_case_code ~ '^[0-9]{14}$'
    ),
    CONSTRAINT valid_itf_inner_carton_format CHECK (
        itf_inner_carton_code IS NULL
        OR itf_inner_carton_code ~ '^[0-9]{14}$'
    ),
    CONSTRAINT valid_case_inner_division CHECK (
        (
            case_quantity IS NULL
            OR inner_carton_quantity IS NULL
        )
        OR (case_quantity % inner_carton_quantity = 0)
    ),
    CONSTRAINT not_equal_itf_code CHECK (
        (
            itf_case_code IS NULL
            OR itf_inner_carton_code IS NULL
        )
        OR itf_case_code <> itf_inner_carton_code
    ),
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- まず１つ目の関数を実行
CREATE TRIGGER updated_at_1_product_skus BEFORE
UPDATE ON product_skus FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at カラムが更新された時、２つ目の関数を実行
CREATE TRIGGER updated_at_2_product_skus BEFORE
UPDATE OF updated_at ON product_skus FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- 最後に３つ目の関数を実行
CREATE TRIGGER updated_at_3_product_skus BEFORE
UPDATE ON product_skus FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

-- <select><option> で使う id, name をまとめて返す VIEW を定義
-- ENUM はフロントでハードコーディングの予定 (ー_ー;)
CREATE VIEW ids_and_names_for_products AS
SELECT
    'unit_types' AS table_name,
    id,
    name
FROM
    unit_types
UNION ALL
SELECT
    'product_sourcing_types' AS table_name,
    id,
    name
FROM
    product_sourcing_types
UNION ALL
SELECT
    'product_categories' AS table_name,
    id,
    name
FROM
    product_categories
UNION ALL
SELECT
    'product_packaging_types' AS table_name,
    id,
    name
FROM
    product_packaging_types
UNION ALL
SELECT
    'product_inner_packaging_types' AS table_name,
    id,
    name
FROM
    product_inner_packaging_types
UNION ALL
SELECT
    'suppliers' AS table_name,
    id,
    name1 AS name
FROM
    suppliers;