import gitly from 'gitly';
import symlinkDir from 'symlink-dir';

const geoJpApiUpdate = async () => {
  const date = new Date().toLocaleString('sv', { timeZone: 'Asia/Tokyo' }).replace(/\D/g, '.');

  const [archive, exPath] =
    (await gitly('geolonia/japanese-addresses', `./vendor/japanese-addresses/${date}`, { throw: true }).catch(
      (e: unknown) => console.error(`  >>>> ✘ ${e}`)
    )) || [];
  if (!archive || !exPath) throw new Error('gitly() の戻り値が想定外です');

  console.log(`●工程1/2: 成功✨ ${archive} を ${exPath} に展開しました`);

  const resultObj = (await symlinkDir(`${exPath}/api`, './vendor/japanese-addresses/api').catch((e) =>
    console.error(`  >>>> ✘ ${e}`)
  )) || { warn: '' };
  if (resultObj.warn) throw new Error(`symlinkDir().warn: ${resultObj.warn}`);

  console.log('●工程2/2: 成功✨ api にリンクを通しました');
};

try {
  geoJpApiUpdate();
} catch (e: unknown) {
  console.error(`  >>>> ✘ ${e}`);
}
