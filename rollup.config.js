import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';

const dev = process.env.ROLLUP_WATCH;

const plugins = [
  nodeResolve(),
  commonjs(),
  typescript({
    typescript: require('typescript'),
    objectHashIgnoreUnknownHack: true,
    tsconfigOverride: { compilerOptions: { sourceMap: false } },
  }),
  json(),
  babel({
    exclude: 'node_modules/**',
  }),
  dev && serve({
    contentBase: ['./dist'],
    host: '0.0.0.0',
    port: 5005,
    allowCrossOrigin: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  }),
  !dev && terser(),
].filter(Boolean);

export default {
  input: 'src/sidebar-card.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: false,
  },
  plugins,
};