/* https://qiita.com/103ma2/items/9ed7e4a1323b8d06fa59 */

export default function extractAddress(orgAddress: string): string {
  let address = orgAddress;

  // https://blog.foresta.me/posts/replace-hyphen-for-js
  address = address.replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-');

  address = address.replace(/〒/g, '');
  address = address.trim();
  address = address.replace(/^[0-9０-９]{3}-?[0-9０-９]{4}/g, '');
  address = address.replace(/\(.*?\)/g, '');
  address = address.replace(/（.*?）/g, '');
  address = address.replace(/[0-9０-９]+[階|F].*?/g, '');

  const allNumber = '([0-9０-９]+|[一二三四五六七八九十百千]+)';
  const arr = address.match(
    new RegExp(`${allNumber}+(${allNumber}|(番町|丁目|丁|番地|番|号|-|の))*(${allNumber}|(丁目|丁|番地|番|号))`, 'g')
  );
  if (arr !== null) {
    let addressLike = '';
    const len = arr.length;
    for (let i = 0; i < len; i += 1) {
      const tempAddress = arr[i];
      if (tempAddress.length >= addressLike.length) {
        addressLike = tempAddress;
      }
    }
    const index = address.lastIndexOf(addressLike);
    address = address.substring(0, index + addressLike.length);
  }

  address = address.replace(/\s/gi, '');
  return address;
}
