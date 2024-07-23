FROM node:lts-alpine3.20@sha256:cf5e7b223dea2efc6a73c55c6655b740576fe9c2596927a53533feded0fb5f5f

ADD package.json package-lock.json /
RUN npm ci --production
ADD entrypoint.js /
RUN chmod +x /entrypoint.js

ENTRYPOINT ["node", "/entrypoint.js"]
