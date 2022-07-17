const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then(/^a screenshot should be taken$/, () =>{
  cy.percySnapshot();
})