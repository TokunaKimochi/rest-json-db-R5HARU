-- �V�t�gJIS CRLF �ŕۑ����ăR�}���h�v�����v�g�Ŏ��s
-- psql> \i <FULL_PATH(unix like)>.sql
CREATE TYPE expiration_unit_enum AS ENUM('d', 'm', 'y');

CREATE TABLE unit_types (
    id SMALLSERIAL PRIMARY KEY,
    -- g �Ƃ� ml ?
    name VARCHAR(8) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE product_sourcing_types (
    id SMALLSERIAL PRIMARY KEY,
    -- ���А��i�Ƃ� OEM �Ƃ�
    name VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE product_categories (
    id SMALLSERIAL PRIMARY KEY,
    -- �����Ƃ��R�[�q�[�Ƃ�
    name VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE product_packaging_types (
    id SMALLSERIAL PRIMARY KEY,
    -- �ʂƂ��y�b�g�{�g���Ƃ�
    name VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE basic_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(32) UNIQUE NOT NULL,
    jan_code VARCHAR(13) UNIQUE,
    sourcing_type_id SMALLINT NOT NULL DEFAULT 1, -- 1 �͎��А������А��i
    category_id SMALLINT NOT NULL DEFAULT 1, -- 1 �͖�����
    packaging_type_id SMALLINT NOT NULL DEFAULT 1, -- 1 �͖�����
    -- �ܖ�����
    expiration_value INTEGER,
    expiration_unit expiration_unit_enum, -- 'd', 'm', 'y'
    -- ��㏤�i�� id
    predecessor_id INTEGER,
    -- ��Łi�����ł͂Ȃ��j�摜�Ȃǂ��֘A�t����ۂɎg�p���郆�j�[�N�L�[�Ƃ���
    ulid_str VARCHAR(26) UNIQUE,
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
    FOREIGN KEY (packaging_type_id) REFERENCES product_packaging_types (id)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    basic_id INTEGER NOT NULL,
    name VARCHAR(32) UNIQUE NOT NULL,
    short_name VARCHAR(16) UNIQUE,
    -- �i�Г��j���i�R�[�h
    internal_code VARCHAR(10),
    is_set_product BOOLEAN NOT NULL DEFAULT false,
    available_date DATE NOT NULL DEFAULT current_date,
    discontinued_date DATE NOT NULL DEFAULT '2500-01-01',
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (basic_id) REFERENCES basic_products (id)
);

CREATE TABLE product_components (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    title VARCHAR(32) NOT NULL,
    symbol VARCHAR(8),
    amount NUMERIC(8, 2),
    unit_type_id SMALLINT NOT NULL DEFAULT 1, -- 1 �� g�i�O�����j
    pieces INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (unit_type_id) REFERENCES unit_types (id)
);

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