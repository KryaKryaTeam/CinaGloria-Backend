#!/bin/bash

# Кольори для зручності
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== NestJS Docker Manager ===${NC}"
echo "1) Development (Watch mode, Hot-reload)"
echo "2) Production Emulate (Build, 200MB Limit, No Watch)"
echo "3) Clear docker cache and volumes"
echo "4) Generate new migration"
echo "5) Create new migration"
echo "6) Run tests"
echo -ne "Choose an option [1-6]: "
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
  3)
    echo -e "${RED}🕯️ Clearing docker...${NC}"
    docker system prune -a -f
    docker volume prune -f
    [ -d "./server/uploads" ] && rm -rf ./server/uploads && echo "Uploads cleared."
    echo -e "${GREEN}Done!${NC}"
  ;;
  4)
    echo -e "${GREEN}✏️ Generate new migration...${NC}"
    docker compose down
    docker compose up --build -d
    cd server
    npm run migration:generate
    docker compose down
    echo -e "${GREEN}✅ Migration generated!${NC}"
    ;;
  5)
    echo -e "${GREEN}✏️ Create new migration...${NC}"
    cd server
    npm run migration:create
    echo -e "${GREEN}✅ Migration created!${NC}"
    ;;
  6)
    echo -e "${GREEN}Start testing...${NC}"
    cd server
    npm run test
    ;;
  *)
    echo "Invalid option. Exiting."
    exit 1
    ;;
esac