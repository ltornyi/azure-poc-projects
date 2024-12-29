#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <storage account>"
  echo "Example: $0 stgacct12345"
  exit 1
fi

STORAGE_ACCOUNT=$1
CONTAINER_NAME="test-container"

#SAS expires at today +1 day:
END="$(date -v+1d '+%Y-%m-%dT%H:%MZ')"


az storage container generate-sas \
  --account-name "$STORAGE_ACCOUNT" \
  --name "$CONTAINER_NAME" \
  --expiry "$END" \
  --https-only \
  --permissions racwdl -o tsv