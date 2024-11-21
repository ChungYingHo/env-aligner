const { terser } = require('rollup-plugin-terser')
const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')

module.exports = [
  {
    input: 'src/lib/index.js',
    output: {
      file: 'dist/index.min.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'default'
    },
    plugins: [
      terser(),
      commonjs()
    ],
    external: ['dotenv', 'chalk', 'fs', 'path']
  },
  {
    input: 'src/bin/cli.js',
    output: {
      file: 'dist/cli.min.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'default',
      banner: '#!/usr/bin/env node'
    },
    plugins: [
      terser(),
      commonjs(),
      json()
    ],
    external: ['dotenv', 'chalk', 'fs', 'path', 'commander']
  }
]
