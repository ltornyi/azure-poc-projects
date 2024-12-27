param storageAccountName string = 'examplestorage1324'
param location string = resourceGroup().location
param virtualNetworkName string = 'example-vnet'
param appServicePlanName string = 'example-app-service-plan'
param webAppName string = 'example-webapp-1324'
param minimumTlsVersion string = 'TLS1_2'
param tags object = {
  Environment: 'Development'
  CostCenter: 'CC1'
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2021-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  tags: tags
  properties: {
    minimumTlsVersion: minimumTlsVersion
  }
}

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2021-02-01' = {
  name: virtualNetworkName
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
  }
}

resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'F1'
    tier: 'Free'
  }
  kind: 'linux'
  tags: tags
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: webAppName
  location: location
  tags: tags
  properties: {
    serverFarmId: appServicePlan.id
  }
}
