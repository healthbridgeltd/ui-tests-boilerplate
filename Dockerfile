ARG BROWSER
FROM cypress/browsers:node12.4.0-${BROWSER}

RUN npm i cypress