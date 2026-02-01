import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import nx from '@nx/eslint-plugin';

const tsFiles = ['**/*.ts', '**/*.tsx', '**/*.vue'];

export default [
  js.configs.recommended,
  {
    files: tsFiles,
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        extraFileExtensions: ['.vue']
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      vue,
      nx
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { "argsIgnorePattern": "^_" }],
      'nx/enforce-module-boundaries': [
        'error',
        {
          "enforceBuildableLibDependency": false,
          "allow": [],
          "depConstraints": [
            {
              "sourceTag": "type:app",
              "onlyDependOnLibsWithTags": ["type:lib"]
            },
            {
              "sourceTag": "type:lib",
              "onlyDependOnLibsWithTags": ["type:lib"]
            },
            {
              "sourceTag": "layer:foundation",
              "onlyDependOnLibsWithTags": ["layer:foundation"]
            },
            {
              "sourceTag": "layer:platform",
              "onlyDependOnLibsWithTags": ["layer:foundation", "layer:platform"]
            },
            {
              "sourceTag": "layer:ui",
              "onlyDependOnLibsWithTags": ["layer:foundation", "layer:platform", "layer:ui"]
            }
          ]
        }
      ]
    }
  },
  {
    files: ['apps/**/*.{ts,tsx,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          "paths": [
            { "name": "ant-design-vue", "message": "Import UI through @shared/ui" },
            { "name": "primevue", "message": "Import UI through @shared/ui" }
          ],
          "patterns": [
            { "group": ["ant-design-vue/*"], "message": "Import UI through @shared/ui" },
            { "group": ["primevue/*"], "message": "Import UI through @shared/ui" }
          ]
        }
      ]
    }
  },
  {
    files: ['apps/**/src/**/*.{ts,tsx,vue}', 'libs/**/src/**/*.{ts,tsx,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          "patterns": [
            {
              "group": ["libs/shared/**/src/**"],
              "message": "از مسیر عمومی @shared/<lib> استفاده کنید."
            }
          ]
        }
      ]
    }
  },
  ...vue.configs['flat/recommended']
];
