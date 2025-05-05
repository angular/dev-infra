FROM node:16-slim@sha256:3ebf2875c188d22939c6ab080cfb1a4a6248cc86bae600ea8e2326aa03acdb8f

WORKDIR /usr/src/app

COPY package.json ./

COPY credential-service.js ./

EXPOSE 8080

CMD ["node", "credential-service.js"]
