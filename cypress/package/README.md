# Assessment: Shared Steps and Pages
## Steps
```js
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
```