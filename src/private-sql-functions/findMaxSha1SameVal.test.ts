import 'dotenv/config';
import findMaxSha1SameVal from './findMaxSha1SameVal';

describe('同じ住所はありません', () => {
  it('8'.repeat(40), async () => {
    const result = await findMaxSha1SameVal('8'.repeat(40));
    expect(result).toStrictEqual({ max_same_val: null });
  });
});
