import { Then } from 'cypress-cucumber-preprocessor/steps'

Then(/^a screenshot should be taken$/, () =>{
  cy.percySnapshot();
})