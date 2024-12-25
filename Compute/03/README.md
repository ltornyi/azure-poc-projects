# 03: Deploy a Containerized Web Application Using Azure Container Apps

## Develop locally

### Run the server

    npm start

You should see the message: `Server is running on port 8080`. Go to `http://localhost:8080/`, you should see a simple message.

### Build image

    docker build -t nodejs-container-app .

### Run container locally

    docker run -d -p 8080:8080 nodejs-container-app

Visit `http://localhost:8080` to confirm it works.

### Useful commands while working locally

    docker ps --all
    docker stop <container id>
    docker rm <container id>

## Deploy to Azure Container Apps

* Create resource group
* Create Azure Container Registry; check free tier eligibility

### Tag local image with the ACR name and push it to ACR

    docker tag nodejs-container-app <registry-name>.azurecr.io/nodejs-container-app
    az acr login --name <registry-name>
    docker push <registry-name>.azurecr.io/nodejs-container-app

### Set up environment variables

    RESOURCE_GROUP="<RESOURCE_GROUP>"
    LOCATION="<LOCATION>"
    CONTAINERAPPS_ENVIRONMENT="<CONTAINERAPPS_ENVIRONMENT>"

### Create an environment and a container app from the image

    az containerapp env create \
      --name $CONTAINERAPPS_ENVIRONMENT \
      --resource-group $RESOURCE_GROUP \
      --location "$LOCATION"

    az containerapp create \
      --name nodejs-container-app \
      --resource-group $RESOURCE_GROUP \
      --environment $CONTAINERAPPS_ENVIRONMENT \
      --image <registry-name>.azurecr.io/nodejs-container-app:latest \
      --target-port 8080 \
      --ingress external \
      --registry-server <registry-name>.azurecr.io \
      --query properties.configuration.ingress.fqdn

### Optional: load test using Siege and Hey

    brew install siege
    brew install hey

While you are running the commands below, monitor the number of replicas in the portal.

    siege --concurrent=50 --reps=100 https://nodejs-container-app.<your app details>.azurecontainerapps.io/
    hey -c 50 -n 5000 https://nodejs-container-app.<your app details>.azurecontainerapps.io/

The container app will scale to zero by default eventually - feel free to stop it fully.