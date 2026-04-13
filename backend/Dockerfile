FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
RUN apk add --no-cache postgresql-client curl
ADD https://github.com/golang-migrate/migrate/releases/download/v4.17.0/migrate.linux-amd64.tar.gz /tmp/
RUN tar -xzf /tmp/migrate.linux-amd64.tar.gz -C /usr/local/bin && chmod +x /usr/local/bin/migrate && rm /tmp/migrate.linux-amd64.tar.gz
WORKDIR /app
COPY --from=builder /app/dist        ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY migrations ./migrations
COPY seed       ./seed
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["./entrypoint.sh"]
