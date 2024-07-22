FROM mhart/alpine-node:12.19.1@sha256:31eebb77c7e3878c45419a69e5e7dddd376d685e064279e024e488076d97c7e4

ADD package.json package-lock.json /
RUN npm ci --production
ADD entrypoint.js /
RUN chmod +x /entrypoint.js

ENTRYPOINT ["node", "/entrypoint.js"]
