/// <reference types="jest" />
/// <reference types="node" />
module.exports = {
  displayName: '@bookfelt/mobile',
  preset: 'jest-expo',
  moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper: {
    '\\.svg$': '@nx/expo/plugins/jest/svg-mock',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?(' +
      'react-native|' +
      '@react-native|' +
      '@testing-library/react-native|' +
      'expo|' +
      '@expo|' +
      'react-navigation|' +
      '@react-navigation|' +
      '@unimodules|' +
      'unimodules|' +
      'react-native-svg|' +
      '@rn-primitives|' +
      '@shopify/flash-list|' +
      'react-native-reanimated|' +
      'react-native-gesture-handler|' +
      'react-native-heroicons|' +
      'react-native-purchases|' +
      '@supabase|' +
      '@10play|' +
      'react-native-linear-gradient|' +
      'react-native-actions-sheet|' +
      'react-native-view-shot|' +
      'react-native-vision-camera|' +
      'react-native-worklets-core' +
      ')(?:/|$))',
  ],
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        configFile: __dirname + '/.babelrc.js',
      },
    ],
  },
  coverageDirectory: '../../coverage/apps/mobile',
};
