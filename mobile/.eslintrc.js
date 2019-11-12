module.exports = {
  env: {
    es6: true
  },
  extends: [
    'standard',
    'standard-react-native',
    'prettier',
    'prettier/react'
  ],
  globals: {
    __DEV__: 'readonly',
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    'react',
    'prettier'
  ],
  rules: {
    'react/jsx-no-bind': 'off',
    'prettier/prettier': 'error',
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
    'semi': ['error', 'never'],
    'import/prefer-default-export': 'off'
  },
  settings: {
    "import/resolver": {
      "babel-plugin-root-import": {
        rootPathStuffix: "src"
      }
    }
  }
}
