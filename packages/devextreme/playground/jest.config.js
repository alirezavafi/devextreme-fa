// Unit tests for the demo-site helpers in playground/shell. The playground is
// outside the library's Jest roots, so it gets its own config that reuses the
// jsdom project's environment, aliases and transform.
const path = require('path');
const { projects } = require('../jest.config');

const jsdomProject = projects.find((p) => p.displayName === 'jsdom-tests');

module.exports = {
    ...jsdomProject,
    displayName: 'playground',
    rootDir: path.resolve(__dirname, '..'),
    roots: ['<rootDir>/playground'],
    testMatch: ['<rootDir>/playground/**/__tests__/*.test.ts'],
};
