import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: './demo/demo.js',
  output: {
    file: 'demo/bundle.js',
    format: 'iife'
  },
  plugins: [commonjs(), nodeResolve()],
};