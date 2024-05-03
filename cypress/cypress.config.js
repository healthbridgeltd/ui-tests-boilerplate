const preprocessor = require('@badeball/cypress-cucumber-preprocessor')
const webpack = require('@cypress/webpack-preprocessor')
const { allureCypress } = require('allure-cypress/reporter')
const envFile = require(`./config/${
  process.env['CONFIG_FILE'] || 'staging'
}.js`)

module.exports = {
  chromeWebSecurity: false,
  defaultCommandTimeout: 15000,
  video: true,

  e2e: {
    setupNodeEvents,
    baseUrl: envFile.baseUrl,
    specPattern: 'features/**/*.feature',
    excludeSpecPattern: '*.js',
    supportFile: 'support/e2e.js',
    fixturesFolder: 'fixtures',
    screenshotsFolder: 'screenshots',
    videosFolder: 'videos'
  },

  env: envFile.env,

  component: {
    supportFile: 'support/e2e.js',
    devServer: {
      framework: 'vue-cli',
      bundler: 'webpack'
    }
  },

  stepDefinitions: ['support/step_definitions/**/*.{js,ts}']
}

async function setupNodeEvents (cypressOn, config) {
  const on = require('cypress-on-fix')(cypressOn)
  await preprocessor.addCucumberPreprocessorPlugin(on, config)

  on(
    'file:preprocessor',
    webpack({
      webpackOptions: {
        resolve: {
          fallback: { 'path': require.resolve('path-browserify') },
          extensions: ['.jsx', '.js', '.tsx', '.ts']
        },
        module: {
          rules: [
            {
              test: /\.feature$/,
              use: [
                {
                  loader: '@badeball/cypress-cucumber-preprocessor/webpack',
                  options: config
                }
              ]
            }
          ]
        }
      }
    })
  )

  allureCypress(on, {
    resultsDir: './allure-results'
  })

  return config
}
