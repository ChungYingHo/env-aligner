import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.{js,ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
      indent: ['error', 2, { SwitchCase: 1 }],
      'eol-last': ['error', 'always'],
      'brace-style': ['error', '1tbs', { allowSingleLine: false }],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-useless-return': 'warn',
      'no-else-return': 'warn',
      'no-unexpected-multiline': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]
