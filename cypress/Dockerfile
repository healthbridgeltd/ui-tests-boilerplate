FROM cypress/included:13.4.0

WORKDIR /e2e

ADD cypress/ /e2e/

# To use percy visual diffs, we need to add the .git
# directory otherwise no commit data is sent
ADD .git/ /e2e/.git/

RUN npm ci
