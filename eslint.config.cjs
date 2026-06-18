// Plugin-specific ESLint config. The shared rules/blocks live in
// eslint.shared.cjs (synced across plugins); here we only inject the minified
// vendor ignore and the global this plugin's Vitest tests rely on.
module.exports = require('./eslint.shared.cjs')({
  ignores: ['assets/javascripts/*.min.js'],
  testGlobals: {
    GLightbox: 'readonly',
  },
});
