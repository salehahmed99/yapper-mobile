// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
    {
        ignores: [
            'eslint.config.mjs',
            'dist',
            'node_modules',
            'coverage',
            'build',
            'android',
            'ios',
        ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
            },
            sourceType: 'module',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            'brace-style': 'off',
            '@typescript-eslint/brace-style': 'off',
            indent: ['warn', 4, { SwitchCase: 1 }],
            'max-len': [
                'warn',
                {
                    code: 100,
                    ignoreComments: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                    ignoreUrls: true,
                },
            ],
            'comma-dangle': ['warn', 'never'],
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                    custom: {
                        regex: '^I[A-Z]',
                        match: true,
                    },
                },
                {
                    selector: 'typeAlias',
                    format: ['PascalCase'],
                },
                {
                    selector: 'class',
                    format: ['PascalCase'],
                },
                {
                    selector: 'function',
                    modifiers: ['exported'],
                    format: ['PascalCase'],
                },
                {
                    selector: 'function',
                    filter: '^use[A-Z]',
                    format: ['camelCase'],
                },
                {
                    selector: 'variable',
                    format: ['camelCase', 'UPPER_CASE'],
                    leadingUnderscore: 'allow',
                },
                {
                    selector: 'variable',
                    modifiers: ['const'],
                    format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                },
                {
                    selector: 'parameter',
                    format: ['camelCase'],
                    leadingUnderscore: 'allow',
                },
                {
                    selector: 'typeParameter',
                    format: ['PascalCase'],
                },
            ],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-debugger': 'error',
            'prefer-const': 'error',
            'no-var': 'error',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/require-await': 'warn',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-empty-function': 'warn',
            '@typescript-eslint/explicit-function-return-type': [
                'warn',
                { allowExpressions: true, allowTypedFunctionExpressions: true },
            ],
            'sort-imports': [
                'error',
                {
                    ignoreCase: true,
                    ignoreDeclarationSort: true,
                },
            ],
        },
    }
);
