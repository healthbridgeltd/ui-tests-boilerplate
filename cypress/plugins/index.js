const cucumber = require('cypress-cucumber-preprocessor').default

function getConfigurationByFile (environment) {
  return Object.assign({}, require(`../config/${environment}.js`))
}

module.exports = (on, config) => {
  // accept a configFile value or use development by default
  const environment = config.env.configFile || 'local'
  console.log(config.env.configFile)
  console.log(config.env.locale)
  on('file:preprocessor', cucumber())

  return getConfigurationByFile(environment)
}
