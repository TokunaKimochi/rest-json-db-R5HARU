import { DataBaseError, db } from '@/db';
import { OptionTypes, ProductOptionsIdAndName } from './options.types';

// eslint-disable-next-line import/prefer-default-export
export const findAllProductOptions = async (): Promise<Record<OptionTypes, ProductOptionsIdAndName[]>> => {
  const rows: { table_name: OptionTypes; id: number; name: string }[] = await db
    .manyOrNone('SELECT table_name, id, name FROM ids_and_names_for_products ORDER BY table_name, id')
    .catch((err: string) => Promise.reject(new DataBaseError(err)));

  const result: Record<OptionTypes, ProductOptionsIdAndName[]> = {
    unit_types: [],
    product_sourcing_types: [],
    product_categories: [],
    product_packaging_types: [],
    product_inner_packaging_types: [],
  };

  rows.forEach(({ table_name, id, name }) => {
    if (!result[table_name]) {
      result[table_name] = [];
    }
    result[table_name].push({ id, name });
  });

  return result;
};
