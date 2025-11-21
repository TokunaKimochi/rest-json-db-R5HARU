-- シフトJIS CRLF で保存してコマンドプロンプトで実行
-- psql> \i <FULL_PATH(unix like)>.sql
--- 製品詳細ビュー
CREATE OR REPLACE VIEW v_sku_details AS
SELECT
    -- SKU
    ps.id AS sku_id,
    ps.name AS sku_name,
    ps.priority,
    ps.case_quantity,
    ps.inner_carton_quantity,
    ps.itf_case_code,
    ps.itf_inner_carton_code,
    ps.case_depth_mm,
    ps.case_width_mm,
    ps.case_height_mm,
    ps.case_weight_g,
    ps.inner_carton_depth_mm,
    ps.inner_carton_width_mm,
    ps.inner_carton_height_mm,
    ps.inner_carton_weight_g,
    -- Product
    p.id AS product_id,
    p.name AS product_name,
    p.short_name AS product_short_name,
    p.internal_code,
    p.is_set_product,
    p.depth_mm,
    p.width_mm,
    p.diameter_mm,
    p.height_mm,
    p.weight_g,
    p.available_date,
    p.discontinued_date,
    p.ulid_str,
    p.note AS product_note,
    -- Basic Product
    bp.id AS basic_product_id,
    bp.name AS basic_product_name,
    bp.jan_code,
    bp.expiration_value,
    bp.expiration_unit,
    pst.name AS sourcing_type,
    pc.name AS category_name,
    ppt.name AS packaging_type,
    bp.predecessor_id,
    -- Supplier
    s.id AS supplier_id,
    s.name1 AS supplier_name1,
    s.name2 AS supplier_name2,
    s.contact_person_name,
    s.tel,
    s.zip_code,
    s.address1,
    s.address2,
    s.address3,
    s.url,
    s.note AS supplier_note
FROM
    product_skus ps
    JOIN products p ON ps.product_id = p.id
    JOIN basic_products bp ON p.basic_id = bp.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    LEFT JOIN product_sourcing_types pst ON bp.sourcing_type_id = pst.id
    LEFT JOIN product_categories pc ON bp.category_id = pc.id
    LEFT JOIN product_packaging_types ppt ON bp.packaging_type_id = ppt.id;

--- セット品構成ビュー
CREATE OR REPLACE VIEW v_sku_combinations AS
SELECT
    ps.id AS sku_id,
    pcmb.id AS combination_id,
    pcmb.quantity,
    -- Set Product (完成商品)
    p.id AS set_product_id,
    p.name AS set_product_name,
    p.short_name AS set_product_short_name,
    -- Item Product (内訳商品)
    pcmb.item_product_id,
    item_p.name AS item_product_name,
    item_p.short_name AS item_product_short_name,
    pcmb.created_at,
    pcmb.updated_at
FROM
    product_skus ps
    JOIN product_combinations pcmb ON ps.product_id = pcmb.product_id
    JOIN products p ON pcmb.product_id = p.id
    JOIN products item_p ON pcmb.item_product_id = item_p.id;

--- 製品成分ビュー
CREATE OR REPLACE VIEW v_sku_components AS
SELECT
    ps.id AS sku_id,
    p.id AS product_id,
    p.name AS product_name,
    -- Component
    pcmp.id AS component_id,
    pcmp.title,
    pcmp.symbol,
    pcmp.amount,
    ut.name AS unit_name,
    pcmp.pieces,
    ipt.name AS inner_packaging_type,
    pcmp.created_at,
    pcmp.updated_at
FROM
    product_skus ps
    JOIN product_components pcmp ON ps.product_id = pcmp.product_id
    JOIN products p ON pcmp.product_id = p.id
    LEFT JOIN unit_types ut ON pcmp.unit_type_id = ut.id
    LEFT JOIN product_inner_packaging_types ipt ON pcmp.inner_packaging_type_id = ipt.id;

-- セット品や SKU を作る時のアイテム候補一覧ビュー
CREATE OR REPLACE VIEW v_single_products AS
SELECT
    -- Product (単体商品)
    p.id AS product_id,
    p.name AS product_name,
    p.short_name AS product_short_name,
    p.internal_code,
    p.available_date,
    p.discontinued_date,
    p.depth_mm,
    p.width_mm,
    p.diameter_mm,
    p.height_mm,
    p.weight_g,
    p.note AS product_note,
    p.ulid_str,
    -- Basic Product
    bp.name AS basic_product_name,
    bp.jan_code,
    bp.predecessor_id,
    bp.expiration_value,
    bp.expiration_unit,
    pst.name AS sourcing_type,
    pc.name AS category_name,
    ppt.name AS packaging_type,
    -- Supplier
    -- name2がNOT NULL DEFAULT '' のため、RTRIMでname2が空文字の場合の余分な末尾スペースを削除
    RTRIM(s.name1 || ' ' || s.name2) AS supplier_name,
    -- First Component (代表成分・内容量)
    pcmp.title AS component_title,
    pcmp.symbol AS component_symbol,
    pcmp.amount AS component_amount,
    ut.name AS component_unit_name,
    pcmp.pieces AS component_pieces,
    ipt.name AS component_inner_packaging_type
FROM
    products p
    JOIN basic_products bp ON p.basic_id = bp.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    LEFT JOIN product_sourcing_types pst ON bp.sourcing_type_id = pst.id
    LEFT JOIN product_categories pc ON bp.category_id = pc.id
    LEFT JOIN product_packaging_types ppt ON bp.packaging_type_id = ppt.id
    -- LATERAL JOIN: 各製品(p)に紐づく最初の1件の成分(pcmp)を効率的に取得
    LEFT JOIN LATERAL (
        SELECT
            pcmp.title,
            pcmp.symbol,
            pcmp.amount,
            pcmp.unit_type_id,
            pcmp.pieces,
            pcmp.inner_packaging_type_id
        FROM
            product_components pcmp
        WHERE
            -- LATERAL (横方向) によって外側のテーブルを参照
            pcmp.product_id = p.id
        ORDER BY
            pcmp.id ASC
        LIMIT
            1
            -- サブクエリの WHERE句で結合条件が既出 -> 常に結合 TRUE
            -- サブクエリの結果が無ければ LEFT JOIN で NULL を代入
    ) pcmp ON TRUE
    LEFT JOIN unit_types ut ON pcmp.unit_type_id = ut.id
    LEFT JOIN product_inner_packaging_types ipt ON pcmp.inner_packaging_type_id = ipt.id
WHERE
    p.is_set_product = false;
