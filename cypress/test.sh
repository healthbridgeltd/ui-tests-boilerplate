#!/usr/bin/env bash
# utility script to simplify running of the ui-tests in docker
set -e

CLIENT_SERVICE="app"
APP_NAME="cypress-ui"
CLIENT_IMAGE="appname"
CLIENT_PORT="8090:8090"
NETWORK="ui-test-net"
CYPRESS_IMAGE="${CYPRESS_IMAGE:-cypress/included:13.4.0}"

function usage() {
  echo "$0 <commands>"
  echo ""
  echo "General Commands:"
  echo "   help                prints this message"
  echo ""
  echo "Testing commands:"
  echo "   build_tests         build the ui-tests docker container"
  echo "   ui_tests [PARAMS]   Run UI tests <standalone|local|staging|prod>"
  echo "   vis_diff            Run visual difference tests"
  exit 1
}

function help() {
  usage
}

# === Docker Utilities === #

function createNetwork() {
  docker network create ${NETWORK}
}

function networkWrapper() {
  echo "=== Setting up network ==="
  if createNetwork; then
    echo "Network: ${NETWORK} created"
  else
    echo "Network: ${NETWORK} already exists"
  fi
}

function cleanup() {
  docker stop ${APP_NAME}
}

# === Cypress Test Functions === #

function build_tests() {
  docker run -v "$(pwd):/e2e" -w "/e2e" --entrypoint="" "${CYPRESS_IMAGE}" sh -c "npm install"
}

function dockerTests() {
  docker run -v "$(pwd):/e2e" -w "/e2e" --entrypoint="" --network="${NETWORK}" "${CYPRESS_IMAGE}" sh -c "npm run cypress:test:$1"
}

function dockerTestsNoNet() {
  docker run -v "$(pwd):/e2e" -w "/e2e" --entrypoint="" "${CYPRESS_IMAGE}" sh -c "npm run cypress:test:$1"
}

function runStandaloneTests() {
  docker run -d --rm -w "/app" -v "$(pwd):/app" --name="${APP_NAME}" --network="${NETWORK}" -p ${APP_PORT} ${CLIENT_IMAGE} npm run serve
  dockerTests $1
}

function visual_diff() {
  docker run -v "$(pwd):/e2e" -w "/e2e" --entrypoint="" "${CYPRESS_IMAGE}" sh -c "npm run visdiff:run"
  docker run -v "$(pwd):/e2e" -w "/e2e" --entrypoint="" "${CYPRESS_IMAGE}" sh -c "npm run visdiff:verify"
}

function runTestWrapper() {
  networkWrapper
  echo "=== Running Tests ==="
  if runStandaloneTests $1; then
    echo "Tests Passed"
    cleanup
  else
    cleanup
    echo "Tests Failed"
    exit 1
  fi
}

function ui_tests() {
  if [[ $1 == 'standalone' ]]; then 
    runTestWrapper $1
  elif [[ $1 == 'local' ]]; then
    dockerTests $1
  else
    dockerTestsNoNet $1
  fi
}

num_args=$#
[[ (${num_args} < 1) ]] && {
  usage "You must supply at least 1 command"
}

exec_command=${1}
if [[ $(type -t ${exec_command} 2>/dev/null) == function ]]; then
  echo "Running command: ${exec_command}"
  ${exec_command} ${2} ${3}
  shift
else
  usage "Command ${exec_command} does not exist"
fi
