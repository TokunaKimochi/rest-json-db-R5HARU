/* eslint-disable import/no-extraneous-dependencies */
import { swc, defineRollupSwcOption } from 'rollup-plugin-swc3';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeExternals from 'rollup-plugin-node-externals';
// import circularDependencies from 'rollup-plugin-circular-dependencies';

export default {
  input: 'src\\index.ts',
  output: {
    file: 'dist\\assets\\bundle.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    swc(defineRollupSwcOption({ sourceMaps: true })),
    commonjs({
      transformMixedEsModules: true,
    }),
    nodeResolve({ preferBuiltins: true }),
    // nodeExternals({ deps: false, devDeps: true, peerDeps: false, optDeps: false }),
    nodeExternals(),
    json(),
    // circularDependencies(),
  ],
};
