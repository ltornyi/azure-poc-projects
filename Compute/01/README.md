# 01: Deploy a Simple Web Application with Azure App Service

## Run locally

    npm start

You should see the message: `Server is running on port 8080`. Go to `http://localhost:8080/`, you should see a simple message.

## Deploy to Azure App Service

* Create resource group
* Create App Service Plan, choose the Free SKU
* Create App Service Web app, choose the free app service plan created

Navigate to the root directory of your app project i.e. `Compute/01`

    zip -r project.zip .
    az webapp deploy --resource-group <group-name> --name <app-name> --src-path <zip-package-path>

Docs: [Deploy zip or war](https://learn.microsoft.com/en-us/azure/app-service/deploy-zip)

Stop the web app when you no longer need it.