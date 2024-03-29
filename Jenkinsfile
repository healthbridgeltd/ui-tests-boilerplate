@Library('jenkins-shared-libraries@3.7.1')
import com.zavamed.Tests

tests = new Tests(this)

def branchName = "${env.BRANCH_NAME}"
def projectName = "<projectName>"
def notificationSlackChannel = "#jenkins-<team>"
def cypressImage = "cypress/included:7.4.0" // at least 7.4.0
def isMasterBranch=(branchName == 'master')
def deployToProd = false

node('worker') {

  stage('Checkout') {
    checkout scm
  }

  // ...
  
  /**
  * Optional: Only if the app supports local testing. 
  * This allows us to get feedback before merging to master.
  */
  stage('Run Local Tests') {
    echo "Starting local UI Tests"
    /**
    * mkdir is needed as otherwise docker will create the reports
    * folder with different permissions which jenkins can't access
    */
    sh "mkdir allure-results"
    status = sh([script: "./test.sh ui_tests jenkins", returnStatus: true])

    allure includeProperties: false, jdk: '', results: [[path: "allure-results"]]

    if (status != 0) {
      /**
      * Depending on pipeline setup you may wish to send a notification here
      * or catch it in a later part of the pipeline.
      */
      error "UI tests failed."
    }
  }
  
  if (isMasterBranch) {
    
    // ...

    // We can now use jenkins-codebuild for more stable testing.
    node('jenkins-codebuild') {
      tests.runVisualDifferenceTests(
        environment: 'staging',
        image: cypressImage,
        channel: notificationSlackChannel,
        project: projectName,
        command: 'visdiff:test',
        percyToken: percyToken
      )

      tests.runFunctionalTests(
        environment: 'staging',
        image: cypressImage,
        channel: notificationSlackChannel,
        project: projectName,
        command: 'cypress:test:staging'
      )
    }
  }

  // ...

  if (deployToProd) {
    node('jenkins-codebuild') {
      tests.runFunctionalTests(
        environment: 'production',
        image: cypressImage,
        channel: notificationSlackChannel,
        project: projectName,
        command: 'cypress:test:production'
      )
    }
  }

  // ...
}
