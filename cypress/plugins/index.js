const cucumber = require('cypress-cucumber-preprocessor').default
const fs = require('fs-extra')
const path = require('path')

function getConfigurationByFile (file) {
  const pathToConfigFile = path.resolve('./cypress', 'config', `${file}.json`)

  return fs.readJsonSync(pathToConfigFile)
}

// plugins file
module.exports = (on, config) => {
  // accept a configFile value or use development by default
  const file = config.env.configFile || 'local'
  on('file:preprocessor', cucumber())

  return getConfigurationByFile(file)
}
