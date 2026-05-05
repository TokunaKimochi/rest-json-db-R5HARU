-- シフトJIS CRLF で保存してコマンドプロンプトで実行
-- psql> \i <FULL_PATH(unix like)>.sql
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
    ('しいたけ茶', 'amber', '600'),
    ('グリーンティー', 'lime', '300'),
    ('角切り味こんぶ茶', 'rose', '500'),
    ('麦茶', 'sky', '400'),
    ('烏龍茶', 'yellow', '700'),
    ('しょうが湯', 'red', '400'),
    ('米菓', 'fuchsia', '300'),
    ('飴', 'emerald', '400');

INSERT INTO
    product_packaging_types (name)
VALUES
    ('未分類'),
    ('その他'),
    ('紙缶'),
    ('プルトップ缶'),
    ('缶'),
    ('クラスターパック'),
    ('タイコ箱'),
    ('化粧箱'),
    ('無地箱'),
    ('SP無地+シール'),
    ('スタンドパック'),
    ('無地袋+シール'),
    ('平袋');

INSERT INTO
    product_inner_packaging_types (name)
VALUES
    ('未分類'),
    ('その他'),
    ('無し'),
    ('スティックタイプ'),
    ('１杯分個包装'),
    ('個包装'),
    ('小分け袋'),
    ('袋');