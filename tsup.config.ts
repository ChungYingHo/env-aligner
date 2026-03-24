import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'cli/index': 'src/cli/index.ts'
  },
  format: ['esm'],
  target: 'node18',
  clean: true,
  splitting: false,
  bundle: true,
  noExternal: ['picocolors'],
  banner: {
    js: '#!/usr/bin/env node'
  }
})
