import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'voxel-triangulation.js',
  output: {
    dir: 'demo',
    format: 'iife',
  },
  plugins: [commonjs()],
};