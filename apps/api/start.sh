#!/bin/sh

echo "Iniciando API..."
node dist/main.js

# Inicia o JSON server
echo "Iniciando JSON Server..."
npx json-server --watch src/utils/mockPosts.json --host 0.0.0.0 --port ${JSON_SERVER_PORT}

# Aguarda a instancia do Postgres ficar pronta
echo "Waiting for Postgres to be ready..."
while ! pg_isready -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER; do
  sleep 1
done

# Roda as migrations antes do build
echo "Running migrations..."
npx typeorm-ts-node-esm migration:run -d src/data-source.ts
