Feature: Auth Login

Scenario: Login
  Given a patient is on the "auth" page
  When they complete the login form
  Then their account dasboard should be displayed
