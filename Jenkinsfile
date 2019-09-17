@Library('jenkins-shared-libraries@1.6.1')
import com.zavamed.Slack
import com.zavamed.Utils
import com.zavamed.NewRelic
import com.zavamed.Cloudflare

slack = new Slack(this)
utils = new Utils(this)

def branchName="${env.BRANCH_NAME}"
def version="${env.BUILD_TIMESTAMP}"
def isMasterBranch=(branchName == 'master')
def deployToProd = false
def artifactRepoPath = "spa/porta/${branchName}/${version}/porta.tgz"
def artifactRepoPathProd = "spa/porta/${branchName}/${version}/porta.prod.tgz"
def buildsLogPath = "builds/porta-builds/builds"

// Settings for slack notifications
def notificationSlackChannel = '#jenkins-garuda'
def featureSlackChannel = '#jenkins-garuda-fea'

branchProperties = [parameters([
  stringParam(name: 'BuildPriority', defaultValue: '4', description: 'Branch checks')
])]
masterProperties = [parameters([
  stringParam(name: 'BuildPriority', defaultValue: '2', description: 'Staging/Production deployment')
])]

node('aws-slave') {
  properties([disableConcurrentBuilds()])
  properties(isMasterBranch ? masterProperties : branchProperties)

  stage('Checkout') {
    cleanWs()
    checkout scm
  }

  stage('Build container') {
    echo "Building container"

    status = sh([
      script: ".build/jenkins.sh buildContainer",
      returnStatus: true
    ])
  }

  stage('Build project') {
    echo "Building version: ${version}"

    status = sh([
      script: ".build/jenkins.sh buildProject",
      returnStatus: true
    ])

    // Archive the built artifacts
    archive(includes: 'porta.tgz')

    if (status != 0) {
      error "Build of image failed! (see reports)"
    }
  }

  stage('Unit tests') {
    echo "Starting Unit tests"

    status = sh([
      script: ".build/jenkins.sh runUnitTest",
      returnStatus: true
    ])

    if (status != 0) {
      error "Unit tests failed! (see reports)"
    }
  }

  stage('SonarQube Analysis') {
    utils.sonarTest(slackChannel: notificationSlackChannel)
    timeout(15) {
      waitForQualityGate abortPipeline: true
    }
  }

  stage('Publish to distribution repo') {
    withAWS(region: 'eu-west-1') {
      awsIdentity()

      s3Upload(
        file: 'porta.tgz',
        bucket: 'repo.zavamed.com',
        path: artifactRepoPath
      )

      echo "Uploaded ${artifactRepoPath}"
      echo "Distribution Archive URL: https://s3-eu-west-1.amazonaws.com/repo.zavamed.com/${artifactRepoPath}"
    }
  }

  if (isMasterBranch) {
    stage('Deploy to staging') {
      withAWS(region: 'eu-west-1') {
        awsIdentity()

        def uploadTarget = "stg/"
        s3Upload(
          file: 'dist',
          bucket: 'porta.zavamed.com',
          path: "${uploadTarget}"
        )

        echo "Archive URL: http://porta.zavamed.com.s3-website-eu-west-1.amazonaws.com/${uploadTarget}"
      }

      purgeCloudflare()
    }
  } else {
     stage('Deploy to feature environment') {
      withAWS(region:'eu-west-1', role: 'arn:aws:iam::506161635316:role/jenkins_deploy_role') {
      awsIdentity()

      branchName = "${env.BRANCH_NAME}".replaceAll("[^a-zA-Z0-9\\s]", "")
      branchName = branchName.toLowerCase()

      s3Upload(
              file: 'dist',
              bucket: 'fea-porta',
              path: branchName
       )

    def msg =
      "Feature ZAVA URLs:```<https://fea-${branchName}.auth.feature.zavasrv.com/uk/auth|Auth UK>, <https://fea-${branchName}.auth.feature.zavasrv.com/ie/auth|Auth IE>, <https://fea-${branchName}.auth.feature.zavasrv.com/de/auth|Auth DE>, <https://fea-${branchName}.auth.feature.zavasrv.com/fr/auth|Auth FR>, <https://sd-fea-${branchName}.auth.feature.zavasrv.com/auth|Auth SD UK>, <https://sd-fea-${branchName}.auth.feature.zavasrv.com/ie/auth|Auth SD IE>```"

      echo msg
      slack.success(
         channel: featureSlackChannel,
         message: msg
      )
     }
    }
  }
}

if (isMasterBranch) {
  stage("Deploy to Production?") {
    def msg = "@here PORTA: Approval for production deploy of ${version} needed: ${BUILD_URL}"
    slack.info(
      channel: notificationSlackChannel,
      message: msg,
      user: env.CHANGE_AUTHOR
    )

    // this will cause the build pipeline to pause and wait for user input
    // the deploy
    deployToProd = input(message: 'Deploy to Production?', parameters: [
      booleanParam(
        defaultValue: false,
        description: 'Selecting the checkbox will cause a production deploy',
        name: 'Yes - Deploy')
    ])
  }
}

node('aws-slave') {
  if (deployToProd) {

    stage('Build project [production env]') {
      echo "Building version: ${version}"

       status = sh([
        script: "VUE_APP_ENV=production .build/jenkins.sh buildProject",
        returnStatus: true
      ])

       // Archive the built artifacts
      archive(includes: 'porta.prod.tgz')

       if (status != 0) {
        error "Build of production image failed! (see reports)"
      }
    }

     stage('Publish to distribution repo') {
      withAWS(region: 'eu-west-1') {
        awsIdentity()

         s3Upload(
          file: 'porta.prod.tgz',
          bucket: 'repo.zavamed.com',
          path: artifactRepoPathProd
        )

         echo "Uploaded ${artifactRepoPathProd}"
        echo "Distribution Archive URL: https://s3-eu-west-1.amazonaws.com/repo.zavamed.com/${artifactRepoPathProd}"
      }
    }

    stage("Deploying to Production Bucket") {
      withAWS(region:'eu-west-1') {
        awsIdentity()

        echo "Downloading release..."

        s3Download(
          file: 'porta.prod.tgz',
          bucket: 'repo.zavamed.com',
          path: "${artifactRepoPathProd}",
          force: true
        )

        echo "Extracting release..."

        sh """
          mkdir -p release
          tar -xzvf porta.prod.tgz -C release
        """

        def uploadTarget="prd/"
        s3Upload(
          file: 'release',
          bucket: 'porta.zavamed.com',
          path: "${uploadTarget}"
        )

        def msg = "PORTA: Production Deploy URL: http://porta.zavamed.com.s3-website-eu-west-1.amazonaws.com/${uploadTarget}"
        echo "${msg}"
        slack.success(
          channel: notificationSlackChannel,
          message: msg,
          user: env.CHANGE_AUTHOR
        )
      }

      purgeCloudflare()

      def newrelic = new NewRelic(this)
      withCredentials([string(credentialsId: 'newrelic-insight', variable: 'NEWRELIC_INSIGHT_KEY')]) {
        newrelic.insight(
          insightKey: "${NEWRELIC_INSIGHT_KEY}",
          applicationId: '333690229',
          accountId: 70139,
          appName: 'porta'
        )
      }
    }
  }

  if (isMasterBranch) {
    stage('Append Builds Log') {
      withAWS(region:'eu-west-1') {
        awsIdentity()
        s3Download(
          file: 'builds',
          bucket: 'repo.zavamed.com',
          path: buildsLogPath,
          force: true
        )

        echo "Updating builds"
        sh "echo ${artifactRepoPathProd} >> builds"

        s3Upload(
          file: 'builds',
          bucket: 'repo.zavamed.com',
          path: buildsLogPath
        )
      }
    }
  }
}

if (isMasterBranch && deployToProd == false) {
  // When the user decided not to deploy to production
  slack.info(
    channel: notificationSlackChannel,
    message: "PORTA: job ${version} done, but not deployed to production: ${BUILD_URL}",
    user: env.CHANGE_AUTHOR
  )
}

stage("Done") {
  echo "Pipeline Run finished."
}

def purgeCloudflare() {
  withCredentials([
    string(credentialsId: 'cloudflare-api-key', variable: 'CLOUDFLARE_API_KEY'),
    string(credentialsId: 'cloudflare-email', variable: 'CLOUDFLARE_EMAIL')]) {

    cloudflare_zone_ids = [
      "2dd884e6cc4ad7525014342c95b426bc",
      "560250b52a74774c94ad39405a27e811",
      "3704be9d7ef5d1620fb430bd14efa41d"
    ]

    def cloudflare = new Cloudflare(this)
    for (zone_id in cloudflare_zone_ids) {
      cloudflare.purgeByTag(
        key: CLOUDFLARE_API_KEY,
        email: CLOUDFLARE_EMAIL,
        applicationId: zone_id,
        cacheTag: "porta",
      )
    }
  }
}
