import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import * as parserVue from 'vue-eslint-parser'
import configTypeScript from '@typescript-eslint/eslint-plugin'
import parserTypeScript from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        parser: parserTypeScript,
        sourceType: 'module'
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off'
    }
  },
  {
    files: ['*.ts', '**/*.ts'],
    languageOptions: {
      parser: parserTypeScript,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        NodeJS: 'readonly',
        console: 'readonly',
        process: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': configTypeScript
    },
    rules: {
      ...configTypeScript.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-unexpected-multiline': 'off',
      'no-useless-escape': 'off'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts', '*.backup']
  }
]