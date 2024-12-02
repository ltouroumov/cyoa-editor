import eslint from '@eslint/js';
import unocss from '@unocss/eslint-config/flat';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import vue from 'eslint-plugin-vue';
import tslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  tslint.config(
    {
      ignores: ['**/node_modules', '**/dist', '.nuxt/'],
    },
    eslint.configs.recommended,
    ...tslint.configs.recommended,
    ...vue.configs['flat/recommended'],
    prettier,
    unocss,
    {
      languageOptions: {
        parser: vueParser,
        parserOptions: {
          project: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
      plugins: {
        'import-x': importX,
        'unused-imports': unusedImports,
      },
      settings: {},
      rules: {
        // Interferes with unused-import
        '@typescript-eslint/no-unused-vars': 'off',
        'no-console': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/no-multiple-template-root': 'off',
        'sort-imports': [
          'error',
          {
            ignoreCase: false,
            ignoreDeclarationSort: true,
            // don"t want to sort import lines, use eslint-plugin-import instead
            ignoreMemberSort: false,
            memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
            allowSeparatedGroups: true,
          },
        ],
        // turn on errors for missing imports
        // This behaves weirdly with the json-schema module
        'import/no-unresolved': 'off',
        // 'import/no-named-as-default-member': 'off',
        'import/order': [
          'error',
          {
            groups: [
              'builtin',
              // Built-in imports (come from NodeJS native) go first
              'external',
              // <- External imports
              'internal',
              // <- Absolute imports
              ['sibling', 'parent'],
              // <- Relative imports, the sibling and parent types they can be mingled together
              'index',
              // <- index imports
              'unknown',
              // <- unknown
            ],
            'newlines-between': 'always',
            alphabetize: {
              /* sort in ascending order. Options: ["ignore", "asc", "desc"] */
              order: 'asc',
              /* ignore case. Options: [true, false] */
              caseInsensitive: true,
            },
          },
        ],
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'warn',
          {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_',
          },
        ],
      },
    },
  ),
);
