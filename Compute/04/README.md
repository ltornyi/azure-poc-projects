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

### Use Entra authentication locally

You can also leverage an Entra user when running the function app locally.

* Create your externally identified user in the database (see details below under the managed identity section)
* Replace the local `SqlConnectionString` with the following:

    Server=tcp:your_Azure_SQL_server.database.windows.net,1433;Initial Catalog=your_Azure_SQL_database;Persist Security Info=False;User ID={your_entra_username};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Authentication=\"Active Directory Default\";

More details are [here](https://learn.microsoft.com/en-us/sql/connect/ado-net/sql/azure-active-directory-authentication?view=sql-server-ver16#using-default-authentication)

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

## Connect the function app to Azure SQL with managed identity

This is based on [MS documentation](https://learn.microsoft.com/en-gb/azure/azure-functions/functions-identity-access-azure-sql-with-managed-identity)

### Check if your database server has an Entra admin

    SQL_SERVER_RG="resource group of your SQL server"
    SQL_SERVER_NAME="name of your SQL server"
    az sql server ad-admin list \
      --resource-group $SQL_SERVER_RG \
      --server-name $SQL_SERVER_NAME

If there's no Micrososft Entra administrator, follow the steps [here](https://learn.microsoft.com/en-us/azure/azure-sql/database/authentication-aad-configure?view=azuresql&tabs=azure-portal#provision-azure-ad-admin-sql-database) to add one.

### Add managed identity to your function app

Either enable system-assigned managed identity or add a user-assigned managed identity. You can do this from the portal (settings -> identity) or you can use the CLI; see instructions [here](https://learn.microsoft.com/en-gb/azure/app-service/overview-managed-identity?tabs=cli%2Cdotnet&toc=%2Fazure%2Fazure-functions%2Ftoc.json#add-a-system-assigned-identity). The name of the system-assigned identity is always the name of the function app.

### Create database user for the managed identity

    CREATE USER [<identity-name>] FROM EXTERNAL PROVIDER;
    ALTER ROLE db_datareader ADD MEMBER [<identity-name>];
    ALTER ROLE db_datawriter ADD MEMBER [<identity-name>];

You can fine-tune the database permissions by creating a custom role etc.

### Set the connection string for the deployed function app

If you used the system-assigned managed identity, the connection string should look like:

    Server=tcp:your_Azure_SQL_server.database.windows.net,1433;Initial Catalog=your_Azure_SQL_database;Persist Security Info=False;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Authentication="Active Directory Managed Identity";

If you used a user-assigned managed identity, the connection string should look like:

    Server=tcp:your_Azure_SQL_server.database.windows.net,1433;Initial Catalog=your_Azure_SQL_database;Persist Security Info=False;User ID=ClientIdOfManagedIdentity;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Authentication="Active Directory Managed Identity";

### Check active DB connections

    SELECT DB_NAME(dbid) AS DBName,
        COUNT(dbid) AS NumberOfConnections,
        loginame
    FROM sys.sysprocesses
    GROUP BY dbid, loginame
    ORDER BY DB_NAME(dbid)

    select pr.name,
        pr.type_desc,
        sess.session_id,
        sess.login_time,
        sess.program_name
    from sys.dm_exec_sessions as sess
    join sys.database_principals as pr on pr.sid = sess.original_security_id
    where sess.is_user_process=1