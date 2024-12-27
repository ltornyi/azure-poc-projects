# 01: Automate Azure Resource Deployment with Azure Resource Manager (ARM) Templates

## Set environment variables for convenience

  RESOURCE_GROUP="<MyResourceGroup>"
  LOCATION="<myLocation>"

## Create a resource group

    az group create \
      --name $RESOURCE_GROUP \
      --location $LOCATION

## Deply ARM template

    az deployment group create \
      --name MyARMDeployment \
      --resource-group $RESOURCE_GROUP \
      --template-file deployment.json

## Override tags during deployment

    az deployment group create \
      --name MyARMDeploymentProd \
      --resource-group $RESOURCE_GROUP \
      --template-file deployment.json \
      --parameters tags='{"Environment":"Production","CostCenter":"CC2"}'

## Decompile into Bicep

    az bicep decompile --file deployment.json

## Preview changes with the what-if operation

    az deployment group what-if \
      --resource-group $RESOURCE_GROUP \
      --template-file deployment.bicep \
      --parameters tags='{"Environment":"TST","CostCenter":"CC2"}' \
      --result-format FullResourcePayloads

    az deployment group what-if \
      --resource-group $RESOURCE_GROUP \
      --template-file deployment.json \
      --parameters tags='{"Environment":"Production","CostCenter":"CC2"}' \
      --result-format ResourceIdOnly

## Deploy changes with preview and confirmation

    az deployment group create \
      --name MyARMDeploymentTST \
      --resource-group $RESOURCE_GROUP \
      --template-file deployment.bicep \
      --parameters tags='{"Environment":"TST","CostCenter":"CC2"}' \
      --confirm-with-what-if