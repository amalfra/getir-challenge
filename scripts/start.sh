#!/usr/bin/env bash

if ! type "docker" > /dev/null; then
  echo "Docker should be installed"
  exit 1
fi

cd $(git rev-parse --show-toplevel)

docker build -t getir-challenge .

echo -e "\n"

read -p 'Enter the port to start server in (default - 80): ' U_PORT
read -p 'Enter the mongo connection URL: ' MONGO_URL

if [ -z "${MONGO_URL}" ]; then 
  echo "MONGO_URL is required"
  exit 1
fi 

PORT="${U_PORT:=80}"

docker run -p $PORT:$PORT -ti --rm --init -e PORT=$PORT -e  MONGO_URL=$MONGO_URL getir-challenge
