#!/bin/bash

set -e

COMPOSE_FILE="docker-compose.yml"
INIT_FILE="postgres/init/init.sql"
AUTH_JS_FILE="web/backend/auth.mjs"
ENV_FILE=".env"

# Function to generate random password
generate_password() {
    head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32
}

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "[*] Creating .env file with random passwords..."
    cat > "$ENV_FILE" << EOF
POSTGRES_PASSWORD=$(generate_password)
POSTGRES_WEB_PASSWORD=$(generate_password)
POSTGRES_CLI_PASSWORD=$(generate_password)
SECRET_KEY=$(generate_password)
EOF
    echo "[+] .env file created!"
else
    echo "[+] .env file already exists!"
fi

# Source the .env file
source "$ENV_FILE"

# Update docker-compose.yml with passwords from .env
echo "[*] Updating docker-compose.yml with passwords from .env..."
sed -i "s/POSTGRES_PASSWORD=password/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" "$COMPOSE_FILE"
sed -i "s/POSTGRES_WEB_PASSWORD=webpass/POSTGRES_WEB_PASSWORD=$POSTGRES_WEB_PASSWORD/" "$COMPOSE_FILE"
sed -i "s/POSTGRES_CLI_PASSWORD=clipass/POSTGRES_CLI_PASSWORD=$POSTGRES_CLI_PASSWORD/" "$COMPOSE_FILE"

# Update init.sql with passwords from .env
echo "[*] Updating init.sql with passwords from .env..."
sed -i "s/LOGIN PASSWORD 'webpass'/LOGIN PASSWORD '$POSTGRES_WEB_PASSWORD'/" "$INIT_FILE"
sed -i "s/LOGIN PASSWORD 'clipass'/LOGIN PASSWORD '$POSTGRES_CLI_PASSWORD'/" "$INIT_FILE"

# Update auth.mjs with JWT secret from .env
echo "[*] Updating auth.mjs with JWT secret from .env..."
sed -i "s/const SECRET_KEY = 'SECRET_KEY_PLACEHOLDER'/const SECRET_KEY = '$SECRET_KEY'/" "$AUTH_JS_FILE"

# Create data directory
echo "[*] Checking for data directory..."
if [ ! -d "./postgres/data" ]; then
    mkdir -p ./postgres/data
fi

echo "[+] All done! Starting compose..."
docker compose up --build -d
