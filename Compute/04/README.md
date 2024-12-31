# 04: Function app implements CRUD APIs

## Set up local developer environment

### Install Azure Functions Core Tools on a Mac

    brew tap azure/functions
    brew install azure-functions-core-tools@4

### Initialize function app project

    mkdir backend-app
    cd backend-app
    func init --typescript
    func new --name ServerTime --template "HTTP trigger" --authlevel "function"

### Run locally

    npm start

You can run `tsc -w` or `npm run watch` in a separate shell to enable incremental compilation. Point your client to `http://localhost:7071/api/<function>`, for example `http://localhost:7071/api/ServerTime`.

## Deploy to Azure

### Create resource group, storage account and function app

    LOCATION="your region"
    RG_NAME="your resource group"
    SA_NAME="your storage account name"
    APP_NAME="your function app name"

    az group create --name $RG_NAME --location $LOCATION

    az storage account create --name $SA_NAME \
      --location $LOCATION \
      --resource-group $RG_NAME \
      --sku Standard_LRS \
      --allow-blob-public-access false

    az functionapp create \
      --resource-group $RG_NAME \
      --consumption-plan-location $LOCATION \
      --runtime node --runtime-version 20 \
      --functions-version 4 \
      --name $APP_NAME \
      --storage-account $SA_NAME \
      --os-type Linux

### Build and deploy the function app

    npm run build
    func azure functionapp publish $APP_NAME

### Call a function

Note the URLs printed by the deployment; for authLevel=function endpoints you will need to pass a function key i.e. `https://<your function app>.azurewebsites.net/api/<your function route>?code=<your function key>`. Example CLI command:

    az functionapp function keys list \
      --function-name ServerTime \
      --name $APP_NAME \
      --resource-group $RG_NAME