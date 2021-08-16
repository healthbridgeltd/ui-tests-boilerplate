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
    // mkdir is needed as otherwise docker will create the reports
    // folder with different permissions which jenkins can't access
    sh "mkdir allure-results"
    sh "./test.sh build_tests"
    status = sh([script: "./test.sh ui_tests jenkins", returnStatus: true])

    allure includeProperties: false, jdk: '', results: [[path: "allure-results"]]

    if (status != 0) {
      // Depending on pipeline setup you may wish to send a notification here
      // or catch it in a later part of the pipeline.
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
        withAWS(region: 'eu-west', role: 'arn:aws:iam::XXXXXXXXXXX:role/role_name') {
          awsIdentity()
          s3Upload(
            file: 'cypress/videos',
            bucket: 'test-reports',
            path: "path/to/dir"
          )
        }
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
          withAWS(region: 'eu-west', role: 'arn:aws:iam::XXXXXXXXXXX:role/role_name') {
            awsIdentity()
            s3Upload(
              file: 'cypress/videos',
              bucket: 'test-reports',
              path: "path/to/dir"
            )
          }
        }
      }
    }
  }

  // ...
}
