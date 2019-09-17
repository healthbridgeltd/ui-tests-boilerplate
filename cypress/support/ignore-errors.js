// eslint-disable-next-line handle-callback-err
Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})
