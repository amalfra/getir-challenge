FROM node:14.17 as build

WORKDIR /app
COPY package*.json ./
COPY ./src/ ./src
ENV NODE_ENV production
RUN npm i

FROM node:14.17-alpine

COPY --from=build /app /
CMD ["npm", "start"]
