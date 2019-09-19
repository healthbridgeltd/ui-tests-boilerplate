def branchName = "${env.BRANCH_NAME}"
def isMasterBranch=(branchName == 'master')
def deployToProd = false
def network = "ui-test-net"

node('worker') {

  stage('Checkout') {
    checkout scm
  }

  // ...

  stage('Run Local Tests') {
    echo "Starting local UI Tests"
    sh "mkdir allure-results"
    sh "./test.sh build_tests"
    status = sh([script: "./test.sh ui_tests jenkins", returnStatus: true])

    allure includeProperties: false, jdk: '', results: [[path: "allure-results"]]

    if (status != 0) {
      error "UI tests failed."
    }
  }
  
  if (isMasterBranch) {
    
    // ...

    stage('Run Staging Tests') {
      echo "Starting staging UI tests"
      status = sh([script: "./test.sh ui_tests staging", returnStatus: true])

      allure includeProperties: false, jdk: '', results: [[path: "allure-results"]]

      if (status != 0) {
        error "UI tests failed."
      }
    }
  }

  // ...

  if (deployToProd) {
    node('aws-slave') {
      stage('Run Production Tests') {
        echo "Starting production UI tests"
        status = sh([script: "./test.sh ui_tests production", returnStatus: true])

        if (status != 0) {
          error "UI tests failed."
        }
      }
    }
  }

  // ...
}
