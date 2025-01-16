-- シフトJIS CRLF で保存してコマンドプロンプトで実行
-- psql> \i <FULL_PATH(unix like)>.sql
CREATE OR REPLACE PROCEDURE create_year_range_partition_by_date(name, date)
AS $$
  <<fn>>
  DECLARE
    parent_name ALIAS FOR $1;
    target_date ALIAS FOR $2;
    child_name name := format('%s_%s', parent_name, to_char(target_date, 'YYYY'));
    start_timestamp timestamp := date_trunc('year', target_date);
    start_date date := start_timestamp::DATE;
    day_after_end_date date := cast(start_timestamp + '1 year'::INTERVAL as DATE);
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = fn.child_name) THEN
      RETURN;
    END IF;
    -- 引数から年レンジでパーティション子テーブルを作成
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %s PARTITION OF %s FOR VALUES FROM (%L) TO (%L)',
      child_name,
      parent_name,
      start_date,
      day_after_end_date
    );
  END;
$$ LANGUAGE plpgsql;
