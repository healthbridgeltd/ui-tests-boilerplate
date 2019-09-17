const email = '#email'
const password = '#password'
const submit = '[type="submit"]'
const dashboard = '[ui-sref="dashboard"]'

export default class AuthPage {
  static goTo () {
    cy.visit('/auth')
  }

  static completeLogin() {
    cy.get(email).type('someone@somewhere.com')
    cy.get(password).type('password123')
    cy.get(submit).click()
  }

  static dashboardIsDisplayed() {
    cy.get(dashboard).should('be.visible')
  }
}
