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
    product_categories (name)
VALUES
    ('未分類'),
    ('その他'),
    ('こんぶ茶'),
    ('梅こんぶ茶'),
    ('しいたけ茶'),
    ('グリーンティー'),
    ('角切り味こんぶ茶'),
    ('麦茶'),
    ('烏龍茶'),
    ('しょうが湯'),
    ('米菓'),
    ('飴');

INSERT INTO
    product_packaging_types (name)
VALUES
    ('未分類'),
    ('その他'),
    ('紙缶'),
    ('プルトップ缶'),
    ('缶'),
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