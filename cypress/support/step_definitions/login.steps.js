import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'
import Auth from '../pages/auth.page'

Given(/^a user is on the auth page$/, () => {
  Auth.goTo()
})

When(/^they complete the login form$/, () =>{
  Auth.completeLogin()
})

Then(/^their account dashboard should be displayed$/, () =>{
  Auth.dashboardIsDisplayed()
})
