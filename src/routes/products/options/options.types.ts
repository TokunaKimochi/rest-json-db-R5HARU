import { z } from 'zod';
import { optionTypesSchemas, productOptionsIdAndNameSchemas } from './options.schemas';

export type ProductOptionsIdAndName = z.infer<typeof productOptionsIdAndNameSchemas>;
export type OptionTypes = z.infer<typeof optionTypesSchemas>;
