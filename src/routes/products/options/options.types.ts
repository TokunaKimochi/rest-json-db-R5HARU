import { z } from 'zod';
import {
  optionTypesSchemas,
  productOptionsIdAndNameSchemas,
  productPackagingTypeFlagsSchemas,
} from './options.schemas';

export type ProductOptionsIdAndName = z.infer<typeof productOptionsIdAndNameSchemas>;
export type OptionTypes = z.infer<typeof optionTypesSchemas>;
export type ProductPackagingTypeFlags = z.infer<typeof productPackagingTypeFlagsSchemas>;
