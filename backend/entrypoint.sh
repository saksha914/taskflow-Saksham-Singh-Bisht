#!/bin/sh
set -e
echo '==> Waiting for PostgreSQL...'
until pg_isready -h "$DB_HOST" -U "$DB_USER"; do sleep 1; done
echo '==> Running migrations...'
migrate -path /app/migrations -database "$DATABASE_URL" up
echo '==> Seeding...'
psql "$DATABASE_URL" -f /app/seed/seed.sql
echo '==> Starting server...'
exec node dist/server.js
