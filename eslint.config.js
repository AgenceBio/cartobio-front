import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import globals from "globals";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";

export default defineConfigWithVueTs(
  {
    ignores: [
      "src/stores/storage.test.js",
      "src/stores/record.test.js",
      "src/utils/export-strategies/*.test.js",
      "src/components/records/Table/FeatureGroup.test.js",
      "src/components/forms/SingleItem*.test.js",
      "src/components/setup/Flow/index.test.js",
      "src/components/records/Table/index.test.js",
      "src/components/records/Header.test.js",
      "src/pages/certification/exploitations/index.test.js",
      "src/pages/exploitations/\\[numeroBio\\]/index.test.js",
    ],
  },
  js.configs.recommended,
  ...vue.configs["flat/essential"],
  vueTsConfigs.recommended,
  {
    files: ["**/*.{js,ts,vue}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { ignoreRestSiblings: true }],
      "vue/multi-word-component-names": "off",
      "vue/no-mutating-props": "warn",
      "vue/no-multiple-template-root": "off",
      "vue/no-undef-properties": "warn",
      "vue/block-lang": "off",
    },
  },
  {
    files: ["src/components/map/**"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "no-unexpected-multiline": "off",
    },
  },
);
