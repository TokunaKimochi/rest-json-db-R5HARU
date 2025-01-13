-- シフトJIS CRLF で保存してコマンドプロンプトで実行
-- psql> \i <FULL_PATH(unix like)>.sql
CREATE OR REPLACE PROCEDURE create_year_range_partition_by_date(name, date)
AS $$
  DECLARE
    parent_name ALIAS FOR $1;
    target_date ALIAS FOR $2;
    start_timestamp timestamp := date_trunc('year', target_date);
    start_date date := start_timestamp::DATE;
    day_after_end_date date := cast(start_timestamp + '1 year'::INTERVAL as DATE);
  BEGIN
    -- 引数から年レンジでパーティション子テーブルを作成
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %s_%s PARTITION OF %s FOR VALUES FROM (%L) TO (%L)',
      parent_name,
      to_char(target_date, 'YYYY'),
      parent_name,
      start_date,
      day_after_end_date
    );
  END;
$$ LANGUAGE plpgsql;
