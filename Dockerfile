FROM node:18-alpine AS build

# Create app directory
WORKDIR /app

COPY package*.json /app
RUN npm ci --force
COPY . /app
RUN npm run build


FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json

EXPOSE 3000
ENTRYPOINT [ "node" ]
CMD [ "dist/main.js" ]