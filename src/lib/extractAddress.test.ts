import extractAddress from './extractAddress';

describe('住所を抜き出し、厳密比較', () => {
  it('東京都新宿区新宿四丁目1番6号 と厳密等価', () => {
    const result = extractAddress('東京都新宿区新宿四丁目1番6号 (JR新宿ミライナタワー23階 カフェ)');
    expect(result).toBe('東京都新宿区新宿四丁目1番6号');
  });

  it('東京都千代田区一番町8 と厳密等価', () => {
    const result = extractAddress('〒102-0082　東京都千代田区一番町8　住友不動産一番町ビル');
    expect(result).toBe('東京都千代田区一番町8');
  });

  it('京都市下京区烏丸通塩小路下ル東塩小路町ジェイア-ル京都伊勢丹隣接 と厳密等価', () => {
    const result = extractAddress('〒600-8555 京都市下京区烏丸通塩小路下ル東塩小路町  ジェイアール京都伊勢丹7階隣接');
    expect(result).toBe('京都市下京区烏丸通塩小路下ル東塩小路町ジェイア-ル京都伊勢丹隣接');
  });
});
