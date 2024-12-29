#!/bin/bash

# Variables
RESOURCE_GROUP="monitor02storageRG"
STORAGE_ACCOUNT="stgacct$RANDOM" # Ensure unique name
CONTAINER_NAME="test-container"

# Check if location parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <location>"
  echo "Example: $0 eastus"
  exit 1
fi

# Use the provided location
LOCATION=$1

az group create --name $RESOURCE_GROUP --location $LOCATION

az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot

az storage container create \
  --name $CONTAINER_NAME \
  --account-name $STORAGE_ACCOUNT

echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "Storage Account: $STORAGE_ACCOUNT"
echo "Blob Container: $CONTAINER_NAME"
