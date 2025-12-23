const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
  root: true,
  env: {
    browser: true,
    es2023: true,
    node: true,
    worker: true,
    sharedworker: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended-type-checked',
    '@typescript-eslint/stylistic-type-checked',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:tailwindcss/recommended',
    'plugin:sonner/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'tailwindcss',
    'sonner',
    'unused-imports',
    'security',
    'unicorn',
    'no-secrets'
  ],
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json'
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    },
    tailwindcss: {
      config: './tailwind.config.js'
    }
  },
  rules: {
    // TypeScript
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': [
      'warn',
      {
        ignoreRestArgs: true
      }
    ],
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]',
          match: false
        }
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase']
      },
      {
        selector: 'enumMember',
        format: ['UPPER_CASE']
      }
    ],

    // React
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-key': [
      'error',
      {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true,
        warnOnDuplicates: true
      }
    ],
    'react/jsx-no-leaked-render': ['error', { validStrategies: ['coerce', 'ternary'] }],
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',

    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks: '(useMemoOne|useCallbackOne|useDeepCompareEffect|useDeepCompareCallback|useDeepCompareMemo)'
      }
    ],

    // JSX A11y
    'jsx-a11y/no-noninteractive-element-interactions': [
      'error',
      {
        handlers: ['onClick']
      }
    ],
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/label-has-associated-control': ['error', { required: { some: ['nesting', 'id'] } }],

    // Import
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type'
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        },
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: ['builtin']
      }
    ],
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.{js,jsx,ts,tsx}',
          '**/*.spec.{js,jsx,ts,tsx}',
          '**/tests/**',
          '**/vitest.config.{js,cjs,mjs,ts}',
          '**/vite.config.{js,cjs,mjs,ts}',
          '**/tailwind.config.{js,cjs,mjs,ts}',
          '**/postcss.config.{js,cjs,mjs,ts}',
          '**/.eslintrc.{js,cjs,mjs,ts}',
          '**/.prettierrc.{js,cjs,mjs,json}',
          '**/jest.config.{js,cjs,mjs,ts}'
        ],
        optionalDependencies: false,
        peerDependencies: false
      }
    ],

    // Tailwind CSS
    'tailwindcss/classnames-order': 'error',
    'tailwindcss/enforces-shorthand': 'error',
    'tailwindcss/no-custom-classname': 'warn',
    'tailwindcss/no-contradicting-classname': 'error',

    // Unused Imports
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': 'off',

    // Security rules
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-object-injection': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-unsafe-regex': 'error',
    'no-secrets/no-secrets': 'error',

    // Unicorn rules
    'unicorn/consistent-destructuring': 'error',
    'unicorn/error-message': 'error',
    'unicorn/no-array-for-each': 'error',
    'unicorn/no-console-spaces': 'error',
    'unicorn/no-empty-file': 'error',
    'unicorn/no-for-loop': 'error',
    'unicorn/no-instanceof-array': 'error',
    'unicorn/no-nested-ternary': 'error',
    'unicorn/no-new-buffer': 'error',
    'unicorn/no-null': 'error',
    'unicorn/no-useless-spread': 'error',
    'unicorn/no-useless-undefined': 'error',
    'unicorn/prefer-array-find': 'error',
    'unicorn/prefer-array-flat': 'error',
    'unicorn/prefer-array-flat-map': 'error',
    'unicorn/prefer-array-index-of': 'error',
    'unicorn/prefer-array-some': 'error',
    'unicorn/prefer-at': 'error',
    'unicorn/prefer-date-now': 'error',
    'unicorn/prefer-default-parameters': 'error',
    'unicorn/prefer-dom-node-append': 'error',
    'unicorn/prefer-dom-node-dataset': 'error',
    'unicorn/prefer-dom-node-remove': 'error',
    'unicorn/prefer-dom-node-text-content': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-modern-math-apis': 'error',
    'unicorn/prefer-negative-index': 'error',
    'unicorn/prefer-node-protocol': 'error',
    'unicorn/prefer-object-from-entries': 'error',
    'unicorn/prefer-object-has-own': 'error',
    'unicorn/prefer-optional-catch-binding': 'error',
    'unicorn/prefer-query-selector': 'error',
    'unicorn/prefer-regexp-test': 'error',
    'unicorn/prefer-set-has': 'error',
    'unicorn/prefer-spread': 'error',
    'unicorn/prefer-string-replace-all': 'error',
    'unicorn/prefer-string-slice': 'error',
    'unicorn/prefer-string-starts-ends-with': 'error',
    'unicorn/prefer-string-trim-start-end': 'error',
    'unicorn/prefer-switch': 'error',
    'unicorn/prefer-ternary': 'error',
    'unicorn/prefer-top-level-await': 'error',
    'unicorn/string-content': 'error',
    'unicorn/switch-case-braces': 'error',
    'unicorn/throw-new-error': 'error',

    // General
    'no-console': process.env.NODE_ENV === 'production' ? ['warn', { allow: ['warn', 'error'] }] : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    'arrow-body-style': ['error', 'as-needed'],
    'no-unused-vars': 'off',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'no-eval': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'no-duplicate-imports': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'multi-line'],
    'consistent-return': 'error',
    'default-case': 'error',
    'no-alert': 'error',
    'no-lonely-if': 'error',
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always']
  },
  overrides: [
    {
      files: ['*.test.{ts,tsx}', '*.spec.{ts,tsx}', 'tests/**/*'],
      extends: ['plugin:testing-library/react'],
      env: {
        vitest: true,
        jest: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        'jsx-a11y/no-noninteractive-element-interactions': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'no-console': 'off'
      }
    },
    {
      files: ['*.js', '*.cjs', '*.mjs'],
      parser: 'espree',
      rules: {
        '@typescript-eslint/*': 'off'
      }
    },
    {
      files: ['vite.config.{ts,js}', 'tailwind.config.{ts,js}', 'postcss.config.{ts,js}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'import/no-extraneous-dependencies': 'off'
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.git/',
    '.next/',
    '.nuxt/',
    '.output/',
    '.turbo/',
    'coverage/',
    '*.d.ts',
    '*.js',
    '*.cjs',
    '*.mjs',
    '!.eslintrc.cjs',
    '!.prettierrc.cjs',
    '!.vite.config.ts'
  ]
});