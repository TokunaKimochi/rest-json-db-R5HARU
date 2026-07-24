-- シフトJIS CRLF で保存してコマンドプロンプトで実行
-- psql> \i <FULL_PATH(unix like)>.sql
INSERT INTO
    suppliers (tel, fax, url, zip_code, address1, name1, note)
VALUES
    (
        '075-662-9600',
        '075-662-9603',
        'https://www.nintendo.co.jp',
        '6018502',
        '京都府京都市南区東九条南松田町2番地1',
        '自社㈱日本工場',
        'ＦＡＸ注文'
    );

INSERT INTO
    unit_types (name)
VALUES
    ('g');

INSERT INTO
    product_sourcing_types (name)
VALUES
    ('自社製造自社製品'),
    ('OEM 委託商品'),
    ('OEM 受託製品'),
    ('仕入れ商品');

INSERT INTO
    product_categories (name, cat_color, color_shade)
VALUES
    ('未分類', 'neutral', '200'),
    ('その他', 'slate', '400'),
    ('こんぶ茶', 'orange', '400'),
    ('梅こんぶ茶', 'pink', '300'),
    ('しいたけ茶', 'amber', '500'),
    ('グリーンティー', 'lime', '300'),
    ('角切り味こんぶ茶', 'rose', '500'),
    ('麦茶', 'sky', '400'),
    ('烏龍茶', 'yellow', '700'),
    ('しょうが湯', 'red', '400'),
    ('米菓', 'fuchsia', '300'),
    ('飴', 'emerald', '400');

INSERT INTO
    product_packaging_types (name, has_depth, has_width, has_diameter)
VALUES
    ('未分類', false, false, false),
    ('その他', true, true, false),
    ('紙缶', false, false, true),
    ('プルトップ缶', false, false, true),
    ('缶', false, false, true),
    ('クラスターパック', true, true, false),
    ('缶入袋', true, true, false),
    ('タイコ箱', true, true, false),
    ('化粧箱', true, true, false),
    ('無地箱', true, true, false),
    ('SP無地+シール', true, true, false),
    ('スタンドパック', true, true, false),
    ('無地袋+シール', true, true, false),
    ('平袋', true, true, false),
    ('袋', true, true, false);

INSERT INTO
    product_inner_packaging_types (name)
VALUES
    ('未分類'),
    ('その他'),
    ('無し'),
    ('スティックタイプ'),
    ('１杯分個包装'),
    ('固形物個包装'),
    ('小分け袋'),
    ('袋');