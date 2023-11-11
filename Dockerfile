ARG APP_DIR=/usr/src/app

FROM alpine:3 as app_base
ARG APP_DIR
# Installs latest Chromium (100) package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      npm
# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
## Run everything after as non-privileged user.
WORKDIR ${APP_DIR}
# add `node_modules/.bin` to $PATH
ENV PATH ${APP_DIR}/node_modules/.bin:$PATH
# install app dependencies
COPY package*.json ./
EXPOSE 4001

FROM app_base AS app_prod
RUN npm ci --silent
# add app
COPY . ./
CMD ["npm", "start"]

FROM app_base AS app_dev
RUN npm install
# add app
COPY . ./
CMD ["npm", "start"]
