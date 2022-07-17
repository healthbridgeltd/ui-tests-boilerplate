const preprocessor = require('@badeball/cypress-cucumber-preprocessor')
const browserify = require('@badeball/cypress-cucumber-preprocessor/browserify')
const envFile = require(`./cypress/config/${process.env.configFile || 'staging'}.js`)

module.exports = {
  chromeWebSecurity: false,
  video: true,
  videoUploadOnPasses: false,
  reporter: 'mocha-allure-reporter',
  e2e: {
    setupNodeEvents,
    baseUrl: envFile.baseUrl,
    specPattern: 'cypress/features/**/*.feature',
    excludeSpecPattern: '*.js'
  },
  env: envFile.env,
  stepDefinitions: ['cypress/support/step_definitions/**/*.{js,ts}'],
  retries: {
	  runMode: 2,
	  openMode: 1
  }
}

async function setupNodeEvents (on, config) {
  await preprocessor.addCucumberPreprocessorPlugin(on, config)

  on('file:preprocessor', browserify.default(config))

  return config
}
