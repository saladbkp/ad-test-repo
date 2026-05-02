#!/bin/env bash

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y jq

secret="$(openssl rand -hex 32)"
sed -i -e "s/CUSTOM_SECRET: changeme/CUSTOM_SECRET: $secret/" compose.yml

TEAM_ID=$(cat /root/teamid || echo 99)

if [ -f teams.json ]; then
    team_name=$(cat teams.json | jq ".[\"$TEAM_ID\"]")
    rm teams.json
    if [ $team_name = "null" ]; then
        team_name='ccit'
    fi

    sed -i -e "s/VENUE: .*/VENUE: $team_name/" compose.yml
fi

docker compose up -d --build