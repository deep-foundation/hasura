FROM node:15.10.0-alpine3.12
COPY package.json .
COPY .env .
COPY tsconfig.json .
COPY node_modules ./node_modules
CMD [ "npm", "run", "dev" ]