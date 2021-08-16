Feature: Auth Login

  @e2e
  Scenario: Login
    Given a user is on the "auth" page
    When they complete the "login" form
    Then their account dashboard should be displayed
