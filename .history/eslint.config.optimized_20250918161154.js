import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default [
  // 基础 JavaScript 配置
  js.configs.recommended,
  
  // Vue 文件配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vue.parser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      }
    },
    plugins: {
      vue,
      '@typescript-eslint': typescript
    },
    rules: {
      ...vue.configs['vue3-recommended'].rules,
      ...typescript.configs.recommended.rules,
      
      // Vue 特定规则
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'error',
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/define-macros-order': ['error', {
        order: ['defineProps', 'defineEmits']
      }],
      'vue/html-self-closing': ['error', {
        html: {
          void: 'never',
          normal: 'always',
          component: 'always'
        },
        svg: 'always',
        math: 'always'
      }],
      'vue/max-attributes-per-line': ['error', {
        singleline: { max: 3 },
        multiline: { max: 1 }
      }],
      'vue/no-unused-vars': 'error',
      'vue/padding-line-between-blocks': 'error',
      'vue/prefer-import-from-vue': 'error',
      'vue/require-macro-variable-name': 'error',
      'vue/block-order': ['error', {
        order: ['script', 'template', 'style']
      }]
    }
  },
  
  // TypeScript 文件配置
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...typescript.configs['recommended-requiring-type-checking'].rules,
      
      // TypeScript 特定规则
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-const': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        disallowTypeAnnotations: false
      }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/member-delimiter-style': ['error', {
        multiline: { delimiter: 'none' },
        singleline: { delimiter: 'semi' }
      }]
    }
  },
  
  // 通用规则
  {
    files: ['**/*.js', '**/*.ts', '**/*.vue'],
    rules: {
      // 代码质量
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-alert': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-void': 'error',
      'no-with': 'error',
      
      // 最佳实践
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'dot-notation': 'error',
      'no-else-return': 'error',
      'no-empty-function': 'warn',
      'no-magic-numbers': ['warn', { 
        ignore: [-1, 0, 1, 2],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true
      }],
      'no-multi-spaces': 'error',
      'no-return-assign': 'error',
      'no-return-await': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-promise-reject-errors': 'error',
      'radix': 'error',
      'yoda': 'error',
      
      // 变量
      'no-delete-var': 'error',
      'no-label-var': 'error',
      'no-restricted-globals': 'error',
      'no-shadow': 'off', // 由 @typescript-eslint/no-shadow 处理
      'no-shadow-restricted-names': 'error',
      'no-undef-init': 'error',
      'no-undefined': 'off',
      'no-unused-vars': 'off', // 由 @typescript-eslint/no-unused-vars 处理
      'no-use-before-define': 'off', // 由 @typescript-eslint/no-use-before-define 处理
      
      // 风格
      'array-bracket-spacing': ['error', 'never'],
      'block-spacing': ['error', 'always'],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'camelcase': ['error', { properties: 'never' }],
      'comma-dangle': ['error', 'never'],
      'comma-spacing': ['error', { before: false, after: true }],
      'comma-style': ['error', 'last'],
      'computed-property-spacing': ['error', 'never'],
      'eol-last': ['error', 'always'],
      'func-call-spacing': ['error', 'never'],
      'indent': ['error', 2, { SwitchCase: 1 }],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'keyword-spacing': ['error', { before: true, after: true }],
      'linebreak-style': ['error', 'unix'],
      'max-len': ['error', { 
        code: 100,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'never'],
      'space-before-blocks': ['error', 'always'],
      'space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }],
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'space-unary-ops': ['error', { words: true, nonwords: false }]
    }
  },
  
  // 忽略文件
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.git/**',
      '.vscode/**',
      '.idea/**',
      'coverage/**',
      '*.min.js',
      'public/**',
      'docs/.vitepress/cache/**',
      'docs/.vitepress/dist/**'
    ]
  },
  
  // Prettier 配置（必须放在最后）
  prettier
]