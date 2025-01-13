-- �V�t�gJIS CRLF �ŕۑ����ăR�}���h�v�����v�g�Ŏ��s
-- psql> \i <FULL_PATH(unix like)>.sql
CREATE TABLE shipping_instruction_print_history (
  delivery_date DATE NOT NULL DEFAULT current_date + 1,
  delivery_time_str VARCHAR(32),
  printed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  page_num_str VARCHAR(8),
  customer_name VARCHAR(60) NOT NULL DEFAULT '���̖�����',
  customer_address VARCHAR(96) NOT NULL DEFAULT '�Z��������',
  -- �����ƎҁA������
  wholesaler VARCHAR(32),
  order_number VARCHAR(64),
  shipping_date DATE NOT NULL DEFAULT current_date,
  carrier VARCHAR(32),
  package_count SMALLINT,
  items_of_order TEXT NOT NULL DEFAULT '����������',
  PRIMARY KEY (delivery_date, printed_at)
)
PARTITION BY
  RANGE (delivery_date);