import fixCorporateNameVariants from './fixCorporateNameVariants';

describe('法人名を正規化し、厳密比較', () => {
  it('アマゾンジャパン合同会社相模原C と厳密等価', () => {
    const result = fixCorporateNameVariants('アマゾンジャパン合同会社　相模原フルフィルメントセンター)');
    expect(result).toBe('アマゾンジャパン合同会社相模原C');
  });

  it('アマゾンジャパン合同会社東京品川DS と厳密等価', () => {
    const result = fixCorporateNameVariants('アマゾンジャパン合同会社 東京品川デリバリーステーション', true);
    expect(result).toBe('アマゾンジャパン合同会社東京品川DS');
  });

  it('JP楽天ロジスティクス 楽天C多摩 と厳密等価', () => {
    const result = fixCorporateNameVariants('JP楽天ロジスティクス　楽天フルフィルメントセンター多摩', false);
    expect(result).toBe('JP楽天ロジスティクス 楽天C多摩');
  });
});
