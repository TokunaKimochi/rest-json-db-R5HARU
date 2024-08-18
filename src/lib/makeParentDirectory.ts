import pathNix from 'node:path/posix';
import pathWin from 'node:path/win32';
import { mkdir } from 'node:fs/promises';

const makeParentDirectory = async (filePath: string) => {
  let dirPath = filePath;
  //   https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Regular_expressions/Character_class#v_%E3%83%A2%E3%83%BC%E3%83%89%E3%81%A7%E3%81%AA%E3%81%84%E5%A0%B4%E5%90%88%E3%81%AE%E6%96%87%E5%AD%97%E3%82%AF%E3%83%A9%E3%82%B9
  if (/\//.test(filePath)) {
    dirPath = /[^/.]+\.[^/.]+$/.test(filePath) ? pathNix.dirname(filePath) : filePath;
  } else if (/\\/.test(filePath)) {
    dirPath = /[^\\.]+\.[^\\.]+$/.test(filePath) ? pathWin.dirname(filePath) : filePath;
  }
  await mkdir(dirPath, { recursive: true }).catch((err: string) => {
    throw new Error(err);
  });
};

export default makeParentDirectory;
