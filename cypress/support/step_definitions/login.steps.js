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
