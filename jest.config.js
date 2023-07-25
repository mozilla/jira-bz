export default {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!src/data/*.js',
  ],
  coverageDirectory: 'coverage',
  setupFiles: ['./jest.setup.js'],
  testEnvironment: 'jsdom',
  transform: {},
};
