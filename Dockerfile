# step 1: build sveltekit app
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install --include=dev

ARG ORIGIN=http://localhost:3000

ENV NODE_ENV=production
ENV ORIGIN=${ORIGIN}
ENV PUBLIC_APP_NAMESPACE=zentara
ENV BODY_SIZE_LIMIT=1000000
RUN npm run build
RUN npm prune --omit=dev

# step 2: copy sveltekit build output to a new image
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/static static/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/package.json package.json

ARG ORIGIN=http://localhost:3000

# step 3: start the server
EXPOSE 3000
ENV NODE_ENV=production
ENV ORIGIN=${ORIGIN}
ENV BODY_SIZE_LIMIT=1000000

VOLUME /app/data
EXPOSE 3000

CMD [ "node", "build" ]