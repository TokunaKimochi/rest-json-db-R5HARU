import extractSemanticAddress from './extractSemanticAddress';

describe('有り触れた入力', () => {
  it('大田区平和島６丁目１番１号東京流通センター', async () => {
    const result = await extractSemanticAddress('大田区平和島６丁目１番１号東京流通センター');
    expect(result).toStrictEqual({
      nja_pref: '東京都',
      nja_city: '大田区',
      nja_town: '平和島六丁目',
      nja_addr: '1-1',
      nja_lat: '35.579188',
      nja_lng: '139.749429',
      nja_level: 3,
      address_sha1: '4001330a9795f59ff788fe7c8b89220c939bc5ec',
    });
  });
});

describe('丁目を「-」に省略するケース', () => {
  it('北海道札幌市西区二十四軒二条2丁目3番3号メゾンコーポ２０１号室', async () => {
    const result = await extractSemanticAddress('北海道札幌市西区24-2-2-3-3メゾンコーポ２０１号室');
    expect(result).toStrictEqual({
      nja_pref: '北海道',
      nja_city: '札幌市西区',
      nja_town: '二十四軒二条二丁目',
      nja_addr: '3-3',
      nja_lat: '43.074273',
      nja_lng: '141.315099',
      nja_level: 3,
      address_sha1: '430eee9d6d3833bcb384d6405faa46813491975b',
    });
  });
});

describe('町丁目内の文字列の「町」の省略に関連するケース', () => {
  it('東京都江戸川区西小松川12-345 コーポメゾン２０１号室', async () => {
    const result = await extractSemanticAddress('東京都江戸川区西小松川12-345 コーポメゾン２０１号室');
    expect(result).toStrictEqual({
      nja_pref: '東京都',
      nja_city: '江戸川区',
      nja_town: '西小松川町',
      nja_addr: '12-345',
      nja_level: 3,
      nja_lat: '35.698405',
      nja_lng: '139.862007',
      address_sha1: 'f3b1ed7c01f3c40286ef0911bb21faf9058e85d9',
    });
  });
});

describe('自治体内に町あり/なしが違うだけでほぼ同じ名前の町丁目が共存しているケース', () => {
  it('福島県須賀川市西川町123-456　ザ・ライオンズミレス須賀川1001', async () => {
    const result = await extractSemanticAddress('福島県須賀川市西川町123-456　ザ・ライオンズミレス須賀川1001');
    expect(result).toStrictEqual({
      nja_pref: '福島県',
      nja_city: '須賀川市',
      nja_town: '西川町',
      nja_addr: '123-456',
      nja_level: 3,
      nja_lat: '37.294611',
      nja_lng: '140.359974',
      address_sha1: 'b70a97cb6dee024334238f66541c28d37e29df80',
    });
  });

  it('福島県須賀川市西川123-456ライオンズ須賀川グランプレイス1001', async () => {
    const result = await extractSemanticAddress('福島県須賀川市西川123-456ライオンズ須賀川グランプレイス1001');
    expect(result).toStrictEqual({
      nja_pref: '福島県',
      nja_city: '須賀川市',
      nja_town: '西川',
      nja_addr: '123-456',
      nja_level: 3,
      nja_lat: '37.296938',
      nja_lng: '140.343569',
      address_sha1: 'e537b54ab7d679145690f3bf9b33992ad33b2726',
    });
  });
});
