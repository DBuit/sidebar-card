import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';

const dev = process.env.ROLLUP_WATCH;

const serveopts = {
  contentBase: ['./dist'],
  host: '0.0.0.0',
  port: 5000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  sourcemap: false
};

const plugins = [
  nodeResolve({sourcemap: false}),
  commonjs({sourcemap: false}),
  typescript({
    sourcemap: false,
    typescript: require('typescript'),
    objectHashIgnoreUnknownHack: true
  }),
  json({sourcemap: false}),
  babel({
    exclude: 'node_modules/**',
    sourcemap: false
  }),
  dev && serve(serveopts),
  !dev && terser(),
];

export default [
  {
    input: 'src/sidebar-card.ts',
    output: {
      dir: 'dist',
      format: 'es',
      sourcemap: false
    },
    plugins: [...plugins],
  },
];
