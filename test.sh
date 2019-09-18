#!/usr/bin/env bash
# utility script to simplify running of the ui-tests in docker
# It is meant to be run from the project root directory
set -e

CLIENT_SERVICE="app"
APP_NAME="cypress-ui"
CLIENT_IMAGE="hbl/appname"
NETWORK="ui-test-net"

function usage() {
  if [ -n "$1" ]; then
    error_msg "$1"
    echo ""
  fi
  echo "$0 <commands>"
  echo ""
  echo "General Commands:"
  echo "   help             prints this message"
  echo ""
  echo "Testing commands:"
  echo "   build-tests    build the ui-tests docker container"
  echo "   ui-tests [PARAMS]   Run UI tests <jenkins|local|staging|prod>"
  exit 1
}

function help() {
  usage
}

function build_tests() {
  docker build --build-arg "BROWSER=chrome76" -t zava/ui-tests:cypress -f Dockerfile .
}

function runDockerLocalTests() {
  docker run -v "$(pwd):/app" --name="${APP_NAME}" --network="${NETWORK}" -p $DEV_PORT $CLIENT_IMAGE npm run ui
  docker run -v "$(pwd):/e2e" -w "/e2e" --network="${NETWORK}" "zava/ui-tests:cypress" sh -c "npm run cypress:test:jenkins"
  docker stop ${APP_NAME}
  docker rm ${APP_NAME}
}

function ui_tests() {
  if [[ $2 == 'jenkins' ]]; then 
    runDockerLocalTests
  else
    docker run -v "$(pwd):/e2e" -w "/e2e" "zava/ui-tests:cypress" sh -c "npm run cypress:test:$2"
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
