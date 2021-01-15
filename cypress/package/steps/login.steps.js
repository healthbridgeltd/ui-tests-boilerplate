import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'
import Auth from '../pages/auth.page'

Given(/^a user is on the "([^"]*)" page$/, (page) => {
  if (page === 'auth') {
    Auth.goTo()
  }
})

When(/^they complete the "([^"]*)" form$/, () =>{
  Auth.completeLogin()
})

Then(/^their account dashboard should be displayed$/, () =>{
  Auth.dashboardIsDisplayed()
})
