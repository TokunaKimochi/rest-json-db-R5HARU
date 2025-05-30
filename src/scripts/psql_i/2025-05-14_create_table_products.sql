-- �V�t�gJIS CRLF �ŕۑ����ăR�}���h�v�����v�g�Ŏ��s
-- psql> \i <FULL_PATH(unix like)>.sql
CREATE TYPE expiration_unit_enum AS ENUM('D', 'M', 'Y');

CREATE TYPE level_abc_enum AS ENUM('A', 'B', 'C');

CREATE TABLE unit_types (
    id SMALLSERIAL PRIMARY KEY,
    -- g �Ƃ� ml ?
    name VARCHAR(8) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- �܂��P�ڂ̊֐������s
CREATE TRIGGER updated_at_1_unit_types BEFORE
UPDATE ON unit_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at �J�������X�V���ꂽ���A�Q�ڂ̊֐������s
CREATE TRIGGER updated_at_2_unit_types BEFORE
UPDATE OF updated_at ON unit_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- �Ō�ɂR�ڂ̊֐������s
CREATE TRIGGER updated_at_3_unit_types BEFORE
UPDATE ON unit_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE product_sourcing_types (
    id SMALLSERIAL PRIMARY KEY,
    -- ���А��i�Ƃ� OEM �Ƃ�
    name VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- �܂��P�ڂ̊֐������s
CREATE TRIGGER updated_at_1_product_sourcing_types BEFORE
UPDATE ON product_sourcing_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at �J�������X�V���ꂽ���A�Q�ڂ̊֐������s
CREATE TRIGGER updated_at_2_product_sourcing_types BEFORE
UPDATE OF updated_at ON product_sourcing_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- �Ō�ɂR�ڂ̊֐������s
CREATE TRIGGER updated_at_3_product_sourcing_types BEFORE
UPDATE ON product_sourcing_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE product_categories (
    id SMALLSERIAL PRIMARY KEY,
    -- �����Ƃ��R�[�q�[�Ƃ�
    name VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- �܂��P�ڂ̊֐������s
CREATE TRIGGER updated_at_1_product_categories BEFORE
UPDATE ON product_categories FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at �J�������X�V���ꂽ���A�Q�ڂ̊֐������s
CREATE TRIGGER updated_at_2_product_categories BEFORE
UPDATE OF updated_at ON product_categories FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- �Ō�ɂR�ڂ̊֐������s
CREATE TRIGGER updated_at_3_product_categories BEFORE
UPDATE ON product_categories FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE product_packaging_types (
    id SMALLSERIAL PRIMARY KEY,
    -- �ʂƂ��y�b�g�{�g���Ƃ�
    name VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- �܂��P�ڂ̊֐������s
CREATE TRIGGER updated_at_1_product_packaging_types BEFORE
UPDATE ON product_packaging_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at �J�������X�V���ꂽ���A�Q�ڂ̊֐������s
CREATE TRIGGER updated_at_2_product_packaging_types BEFORE
UPDATE OF updated_at ON product_packaging_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- �Ō�ɂR�ڂ̊֐������s
CREATE TRIGGER updated_at_3_product_packaging_types BEFORE
UPDATE ON product_packaging_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE product_inner_packaging_types (
    id SMALLSERIAL PRIMARY KEY,
    -- �ʂƂ��y�b�g�{�g���Ƃ�
    name VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- �܂��P�ڂ̊֐������s
CREATE TRIGGER updated_at_1_product_inner_packaging_types BEFORE
UPDATE ON product_inner_packaging_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at �J�������X�V���ꂽ���A�Q�ڂ̊֐������s
CREATE TRIGGER updated_at_2_product_inner_packaging_types BEFORE
UPDATE OF updated_at ON product_inner_packaging_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- �Ō�ɂR�ڂ̊֐������s
CREATE TRIGGER updated_at_3_product_inner_packaging_types BEFORE
UPDATE ON product_inner_packaging_types FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE basic_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(32) UNIQUE NOT NULL,
    jan_code VARCHAR(13) UNIQUE,
    sourcing_type_id SMALLINT NOT NULL DEFAULT 1, -- 1 �͎��А������А��i
    category_id SMALLINT NOT NULL DEFAULT 1, -- 1 �͖�����
    packaging_type_id SMALLINT NOT NULL DEFAULT 1, -- 1 �͖�����
    -- �ܖ�����
    expiration_value INTEGER,
    expiration_unit expiration_unit_enum, -- 'D', 'M', 'Y'
    -- ��㏤�i�� id
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

-- �܂��P�ڂ̊֐������s
CREATE TRIGGER updated_at_1_basic_products BEFORE
UPDATE ON basic_products FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at �J�������X�V���ꂽ���A�Q�ڂ̊֐������s
CREATE TRIGGER updated_at_2_basic_products BEFORE
UPDATE OF updated_at ON basic_products FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- �Ō�ɂR�ڂ̊֐������s
CREATE TRIGGER updated_at_3_basic_products BEFORE
UPDATE ON basic_products FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    basic_id INTEGER NOT NULL,
    name VARCHAR(32) UNIQUE NOT NULL,
    short_name VARCHAR(32) UNIQUE NOT NULL, -- ���̂��������ꍇ������
    internal_code VARCHAR(10), -- �i�Г��j���i�R�[�h
    is_set_product BOOLEAN NOT NULL DEFAULT false,
    height_mm INTEGER, -- ���i�T�C�Y�c (mm)
    width_mm INTEGER, -- ���i�T�C�Y�� (mm)
    depth_mm INTEGER, -- ���i�T�C�Y���� (mm)
    weight_g INTEGER, -- ���i�d�� (g)
    available_date DATE NOT NULL DEFAULT current_date,
    discontinued_date DATE NOT NULL DEFAULT '2555-01-01',
    note TEXT,
    -- ��Łi�����ł͂Ȃ��j�摜�Ȃǂ��֘A�t����ۂɎg�p���郆�j�[�N�L�[�Ƃ���
    ulid_str VARCHAR(26) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (basic_id) REFERENCES basic_products (id)
);

-- �܂��P�ڂ̊֐������s
CREATE TRIGGER updated_at_1_products BEFORE
UPDATE ON products FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at �J�������X�V���ꂽ���A�Q�ڂ̊֐������s
CREATE TRIGGER updated_at_2_products BEFORE
UPDATE OF updated_at ON products FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- �Ō�ɂR�ڂ̊֐������s
CREATE TRIGGER updated_at_3_products BEFORE
UPDATE ON products FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE product_components (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    title VARCHAR(32) NOT NULL,
    symbol VARCHAR(8) NOT NULL,
    amount NUMERIC(8, 2) NOT NULL,
    unit_type_id SMALLINT NOT NULL DEFAULT 1, -- 1 �� g�i�O�����j
    pieces INTEGER NOT NULL DEFAULT 1,
    inner_packaging_type_id SMALLINT NOT NULL DEFAULT 1, -- 1 �͖�����
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (unit_type_id) REFERENCES unit_types (id),
    FOREIGN KEY (inner_packaging_type_id) REFERENCES product_inner_packaging_types (id)
);

-- �܂��P�ڂ̊֐������s
CREATE TRIGGER updated_at_1_product_components BEFORE
UPDATE ON product_components FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at �J�������X�V���ꂽ���A�Q�ڂ̊֐������s
CREATE TRIGGER updated_at_2_product_components BEFORE
UPDATE OF updated_at ON product_components FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- �Ō�ɂR�ڂ̊֐������s
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

-- �܂��P�ڂ̊֐������s
CREATE TRIGGER updated_at_1_product_combinations BEFORE
UPDATE ON product_combinations FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at �J�������X�V���ꂽ���A�Q�ڂ̊֐������s
CREATE TRIGGER updated_at_2_product_combinations BEFORE
UPDATE OF updated_at ON product_combinations FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- �Ō�ɂR�ڂ̊֐������s
CREATE TRIGGER updated_at_3_product_combinations BEFORE
UPDATE ON product_combinations FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();

CREATE TABLE product_skus (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    name VARCHAR(32) UNIQUE NOT NULL,
    -- �P�[�X����
    case_quantity INTEGER,
    -- �{�[���i�����j���萔
    inner_carton_quantity INTEGER,
    -- �P�[�X ITF �R�[�h
    itf_case_code VARCHAR(14) UNIQUE,
    -- �{�[�� ITF �R�[�h
    itf_inner_carton_code VARCHAR(14) UNIQUE,
    case_height_mm INTEGER, -- �P�[�X�T�C�Y�c (mm)
    case_width_mm INTEGER, -- �P�[�X�T�C�Y�� (mm)
    case_depth_mm INTEGER, -- �P�[�X�T�C�Y���� (mm)
    case_weight_g INTEGER, -- �P�[�X�d�� (g)
    inner_carton_height_mm INTEGER, -- �{�[���T�C�Y�c (mm)
    inner_carton_width_mm INTEGER, -- �{�[���T�C�Y�� (mm)
    inner_carton_depth_mm INTEGER, -- �{�[���T�C�Y���� (mm)
    inner_carton_weight_g INTEGER, -- �{�[���d�� (g)
    -- B �̓[���łȂ���΍݌Ƀ`�F�b�N�\�ɍڂ���
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

-- �܂��P�ڂ̊֐������s
CREATE TRIGGER updated_at_1_product_skus BEFORE
UPDATE ON product_skus FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_1 ();

-- updated_at �J�������X�V���ꂽ���A�Q�ڂ̊֐������s
CREATE TRIGGER updated_at_2_product_skus BEFORE
UPDATE OF updated_at ON product_skus FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_2 ();

-- �Ō�ɂR�ڂ̊֐������s
CREATE TRIGGER updated_at_3_product_skus BEFORE
UPDATE ON product_skus FOR EACH ROW
EXECUTE PROCEDURE trg_updated_at_3 ();