#!/bin/bash

# Кольори для зручності
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== NestJS Docker Manager ===${NC}"
echo "1) Development (Watch mode, Hot-reload)"
echo "2) Production Emulate (Build, 200MB Limit, No Watch)"
echo -ne "Choose an option [1-2]: "
read -r opt

case $opt in
  1)
    echo -e "${GREEN}🚀 Starting DEV mode...${NC}"
    # Використовує стандартний docker-compose.yml
    docker compose down
    docker compose up --build
    ;;
  2)
    echo -e "${GREEN}🏗️ Starting PROD EMULATION mode...${NC}"
    PROD_CONF="docker-compose.prodEmulate.yaml"

    NODE_ENV='PRODUCTION'
    
    # Зупиняємо все
    docker compose -f $PROD_CONF down
    
    # Запускаємо в фоні, щоб відкрити stats
    docker compose -f $PROD_CONF up --build
    ;;
  *)
    echo "Invalid option. Exiting."
    exit 1
    ;;
esac