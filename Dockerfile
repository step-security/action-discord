FROM node:26-alpine3.23@sha256:f1394b3ffc021bc3f4aaf363e70a8d9667f7a9a63538bc824d7cc583129fffad

ADD package.json package-lock.json /
RUN npm ci --production
ADD entrypoint.js /
RUN chmod +x /entrypoint.js

ENTRYPOINT ["node", "/entrypoint.js"]
