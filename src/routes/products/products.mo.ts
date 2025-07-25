import { PostReqNewProduct, PostReqNewSetProduct } from './products.types';

export const registerOneRegularProduct = (body: PostReqNewProduct): void => {
  console.log(body);
};

export const registerOneSetProduct = (body: PostReqNewSetProduct): void => {
  console.log(body);
};
