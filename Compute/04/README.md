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

## Set up Azure SQL database

Create a database; for example follow the [Quickstart](https://learn.microsoft.com/en-us/azure/azure-sql/database/single-database-create-quickstart?view=azuresql&tabs=azure-portal). Make sure your client's IP address is added to the database server firewall rules - this is needed to use the query editor in the portal. Also, the function app will connect to the database when running locally.

### Create schema and table

    CREATE SCHEMA poc;

    CREATE TABLE poc.todo (
        id UNIQUEIDENTIFIER PRIMARY KEY,
        [order] INT NULL,
        title NVARCHAR(200) NOT NULL,
        url NVARCHAR(200) NOT NULL,
        completed BIT NOT NULL
    );

Insert an example record:

    insert into poc.todo(id, [order], title, url, completed) values (NEWID(), 1, 'first todo', 'url', 0)

### Create password-based DB user

This will be used to connect when running the function app locally. The permission is obviously overkill.

    create user <your chosen username> WITH PASSWORD='<something complex>';
    alter role db_owner add member <your chosen username>;

## Integrate function app with Azure SQL database

### Add connection string environment variable to your local settings

* Go to the Azure SQL database in the portal, settings -> connection strings and copy the entry under `ADO.NET (SQL authentication)`. It will look like this:

    Server=tcp:your_Azure_SQL_server.database.windows.net,1433;Initial Catalog=your_Azure_SQL_database;Persist Security Info=False;User ID={your_username};Password={your_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;

* Replace `your_username` with the DB user created above and `your_password` with the DB password.
* Add this value to your `local.settings.json` file for the app setting called `SqlConnectionString`.

### Use the connection string in SQL bindings

See `AllToDos.ts` for an input binding example.

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