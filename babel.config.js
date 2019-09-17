// cypress needs to ignore the presets since this issue is still outstanding:
// https://github.com/cypress-io/cypress/issues/2945
// otherwise there will be a syntax error when using import / export
module.exports = process.env.CYPRESS_ENV
  ? {}
  : { presets: [['@babel/preset-env']] }
