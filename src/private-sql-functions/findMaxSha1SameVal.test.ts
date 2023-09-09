import findMaxSha1SameVal from './findMaxSha1SameVal';

describe('存在しない住所', () => {
  it('8'.repeat(40), async () => {
    const result = await findMaxSha1SameVal('8'.repeat(40));
    expect(result).toBe(null);
  });
});

describe('同じ住所が沢山有ります', () => {
  it('4001330a9795f59ff788fe7c8b89220c939bc5ec', async () => {
    const result = await findMaxSha1SameVal('4001330a9795f59ff788fe7c8b89220c939bc5ec');
    expect(result).toBeGreaterThan(8);
  });
});
