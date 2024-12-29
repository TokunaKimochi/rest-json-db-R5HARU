import { z } from 'zod';
import zipCodeQuerySchema from './addressDataByZipCode.schemas';

export type ZipCodeQuery = z.infer<typeof zipCodeQuerySchema>;
