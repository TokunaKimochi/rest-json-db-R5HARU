-- �V�t�gJIS CRLF �R�}���h�v�����v�g�Ŏ��s
-- https://zenn.dev/awonosuke/articles/15e15b9fcd7030
-- https://zenn.dev/mpyw/articles/rdb-ids-and-timestamps-best-practices#postgres-3

/* updated_at �X�V�g���K�p�֐� �R�� */

-- ( 1 ) updated_at �J�������ύX����Ȃ��������ANULL��������
CREATE FUNCTION trg_updated_at_1() RETURNS trigger AS
$$
BEGIN
  IF NEW.updated_at = OLD.updated_at THEN
    NEW.updated_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ( 2 ) updated_at �J������NULL�̎��AUPDATE�����s�O�̃^�C���X�^���v��������
CREATE FUNCTION trg_updated_at_2() RETURNS trigger AS
$$
BEGIN
  IF NEW.updated_at IS NULL THEN
    NEW.updated_at := OLD.updated_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ( 3 ) updated_at �J������NULL�̎��A�g�����U�N�V�����J�n���̃^�C���X�^���v��������
CREATE FUNCTION trg_updated_at_3() RETURNS trigger AS
$$
BEGIN
  IF NEW.updated_at IS NULL THEN
    NEW.updated_at := clock_timestamp();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* customers �e�[�u�� */

-- �܂��P�ڂ̊֐������s
CREATE TRIGGER updated_at_1_customers
  BEFORE UPDATE ON customers FOR EACH ROW
  EXECUTE PROCEDURE trg_updated_at_1();

-- updated_at �J�������X�V���ꂽ���A�Q�ڂ̊֐������s
CREATE TRIGGER updated_at_2_customers
  BEFORE UPDATE OF updated_at ON customers FOR EACH ROW
  EXECUTE PROCEDURE trg_updated_at_2();

-- �Ō�ɂR�ڂ̊֐������s
CREATE TRIGGER updated_at_3_customers
  BEFORE UPDATE ON customers FOR EACH ROW
  EXECUTE PROCEDURE trg_updated_at_3();

/* invoice_types �e�[�u�� */

-- �܂��P�ڂ̊֐������s
CREATE TRIGGER updated_at_1_invoice_types
  BEFORE UPDATE ON invoice_types FOR EACH ROW
  EXECUTE PROCEDURE trg_updated_at_1();

-- updated_at �J�������X�V���ꂽ���A�Q�ڂ̊֐������s
CREATE TRIGGER updated_at_2_invoice_types
  BEFORE UPDATE OF updated_at ON invoice_types FOR EACH ROW
  EXECUTE PROCEDURE trg_updated_at_2();

-- �Ō�ɂR�ڂ̊֐������s
CREATE TRIGGER updated_at_3_invoice_types
  BEFORE UPDATE ON invoice_types FOR EACH ROW
  EXECUTE PROCEDURE trg_updated_at_3();

/* notes �e�[�u�� */

-- �܂��P�ڂ̊֐������s
CREATE TRIGGER updated_at_1_notes
  BEFORE UPDATE ON notes FOR EACH ROW
  EXECUTE PROCEDURE trg_updated_at_1();

-- updated_at �J�������X�V���ꂽ���A�Q�ڂ̊֐������s
CREATE TRIGGER updated_at_2_notes
  BEFORE UPDATE OF updated_at ON notes FOR EACH ROW
  EXECUTE PROCEDURE trg_updated_at_2();

-- �Ō�ɂR�ڂ̊֐������s
CREATE TRIGGER updated_at_3_notes
  BEFORE UPDATE ON notes FOR EACH ROW
  EXECUTE PROCEDURE trg_updated_at_3();