@Library('jenkins-shared-libraries@1.6.1')
import com.zavamed.Slack
import com.zavamed.Docker

slack = new Slack(this)
dockerUtils = new Docker(this)

def isMasterBranch=(branchName == 'master')
def deployToProd = false
def network = "ui-test-net"

node('aws-slave') {
  try {
    properties([disableConcurrentBuilds()])

    stage('Checkout') {
      cleanWs()
      checkout scm
    }

    // ...

    stage('Run Local Tests') {
      echo "Starting local UI Tests"
      sh "mkdir allure-results"
      sh "./app build_tests"
      sh "docker network create ${network}"
      status = sh([script: "./app jenkins_test", returnStatus: true])

      allure includeProperties: false, jdk: '', results: [[path: "allure-results"]]

      if (status != 0) {
        error "UI tests failed."
      }
    }
    
    if (isMasterBranch) {
      
      // ...

      stage('Run Staging Tests') {
        echo "Starting staging UI tests"
        status = sh([script: "./app test_ui staging", returnStatus: true])

        allure includeProperties: false, jdk: '', results: [[path: "allure-results"]]

        if (status != 0) {
          error "UI tests failed."
        }
      }
    }

    stage('Clean up') {
      dockerUtils.cleanUpNetwork(network)
      cleanWs()
    }
  } catch (e) {
    dockerUtils.cleanUpNetwork(network)
    cleanWs()
    error "Build Failed"
  }
}

// ...

if (deployToProd) {
  node('aws-slave') {
    stage('Run Production Tests') {
      echo "Starting production UI tests"
      status = sh([script: "./app test_ui production", returnStatus: true])

      if (status != 0) {
        error "UI tests failed."
      }
    }
  }
}
// ...
