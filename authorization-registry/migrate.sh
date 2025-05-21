#!/bin/bash

set -e

export DATABASE_URL=$(cat /opt/ar/.config.json | jq -r ".database_url")
sea-orm-cli migrate -d migration "$@"
