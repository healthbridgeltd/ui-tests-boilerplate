# ui-tests-boilerplate
Boilerplate for adding Cypress test framework to any project.

## Summary
This boilerplate uses Cypress with Cucumber and Docker support for writing integration and e2e ui tests. The main focus on how to incorporate it into a continuous integration or continous deployment pipeline.

## Important Notes
### Cypress and Docker
Since Cypress install dependecies based on the OS being used we recommend keeping an eye on the npm packages that are being mounted as they will likely need reinstalling. We get around this by installing Cypress on build in the pipeline.

### CI/CD Tools
Currently this is only written for Jenkins. Though we plan to cover CodePipeline AWS. Feel free to include any other pipeline examples.

### IFrames
The Cypress driver had an oversight when it came to interacting with iframes, where it believes they are detached from the DOM. We have included the command in `commands.js`. You will need to call the entire element again to avoid conflicts if you interact with it multiple times.

## Setup
The setup is pretty straightforward:
```bash
git clone https://github.com/healthbridgeltd/ui-tests-boilerplate
cd ui-tests-boilerplate
npm install
npm run cypress:open:local
```
Make sure to set the urls of the environments to wish to point Cypress at. The json files are stored in the `config` directory.

```json
{
  "baseUrl": "https://staging.example.com",
  "env": {
    "name": "staging",
    "mocks": false
  }
}
```
## Writing Tests with Cucumber
The first step with writing tests in cucumber is to work out what the feature is you need. Followed by the behaviour that is expected. With Cucumber you write it in Gherkin Script, as shown below:
```gherkin
Scenario: Login
  Given a user is on the "auth" page 
  When they complete the "login" form
  Then their account dasboard should be displayed
```
Ideally we try to keep this high-level so we can reuse it and it is easy to understand by business.
Next we need to translate this into steps:
```javascript
import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'
import Auth from '../pages/auth.page'

Given(/^a patient is on the "([^"]*)" page$/, (page) => {
  if (page === 'auth') {
    Auth.goTo()
  }
})

When(/^they complete the login form$/, () =>{
  Auth.completeLogin()
})

Then(/^their account dasboard should be displayed$/, () =>{
  Auth.dashboardIsDisplayed()
})
```
The steps are ideally a small set or singular actions that are either calling the driver directly or call a page object. We use page objects as we have multiple tests running on each page and it removes a lot of duplication.
```javascript
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
```
Here we have set up the actual actions that need to carried out by the Cypress driver. While storing out element value as constants. Ideally we can also store the personal information in a json or js object if need be. But for this example we have stuck with the basics.

Once the tests have been set up we can either run them using the Cypress UI as shown above with the `npm run cypress:open:{environment}`. We can also run it using the headless electron browser: `npm run cypress:test:{environment}` or using docker: `sh app test_ui {environment}`.
