// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";
import jsdoc from "eslint-plugin-jsdoc";
import preferArrow from "eslint-plugin-prefer-arrow";
import officeAddins from "eslint-plugin-office-addins";
import globals from "globals";

export default tseslint.config(
    {
        ignores: ["dist/**", "coverage/**", ".angular/**"],
    },
    {
        files: ["**/*.ts"],
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommended,
            ...angular.configs.tsRecommended,
            jsdoc.configs["flat/recommended-typescript-flavor"],
            ...officeAddins.configs.recommended,
        ],
        processor: angular.processInlineTemplates,
        plugins: {
            "prefer-arrow": preferArrow,
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                Office: "readonly",
                Word: "readonly",
                OfficeRuntime: "readonly",
                OfficeExtension: "readonly",
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@angular-eslint/directive-selector": [
                "error",
                { type: "attribute", prefix: "app", style: "camelCase" },
            ],
            "@angular-eslint/component-selector": [
                "error",
                { type: "element", prefix: "app", style: "kebab-case" },
            ],
            "prefer-arrow/prefer-arrow-functions": "warn",
            // No Prettier setup in this repo yet; don't block lint on formatting.
            "prettier/prettier": "off",
            // Several components deliberately use Eager change detection
            // (Office.js callbacks update state outside Angular's zone).
            "@angular-eslint/prefer-on-push-component-change-detection": "off",
        },
    },
    {
        files: ["**/*.html"],
        extends: [
            ...angular.configs.templateRecommended,
            ...angular.configs.templateAccessibility,
        ],
        rules: {},
    }
);