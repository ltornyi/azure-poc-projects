# 01: Set Up a Load-Balanced Web Application with Azure Standard Load Balancer

## Create resource group and set environment variables for convenience

    RG_NAME="<your resource group>"
    LOCATION="<your preferred region>"
    az group create --name $RG_NAME --location $LOCATION

## VNet and subnet for the webserver VMs

    az network vnet create \
      --name MainVnet \
      --resource-group $RG_NAME \
      --location $LOCATION \
      --address-prefix 10.2.0.0/16 \
      --subnet-name VMSubnet \
      --subnet-prefix 10.2.0.0/24

## Public IP and the load balancer

    az network public-ip create \
      --name PublicIP \
      --resource-group $RG_NAME \
      --location $LOCATION \
      --sku Standard

    az network lb create \
      --name LoadBalancer \
      --resource-group $RG_NAME \
      --location $LOCATION \
      --sku Standard \
      --frontend-ip-name FrontendIP \
      --public-ip-address PublicIP \
      --backend-pool-name BackendPool

## Health probe and load balancer rule

    az network lb probe create \
      --resource-group $RG_NAME \
      --lb-name LoadBalancer \
      --name HealthProbe \
      --protocol tcp \
      --port 80

Disable outbound SNAT because we will set up an explicit outbound rule.

    az network lb rule create \
      --resource-group $RG_NAME \
      --lb-name LoadBalancer \
      --name HTTPRule \
      --protocol tcp \
      --frontend-port 80 \
      --backend-port 80 \
      --frontend-ip-name FrontendIP \
      --backend-pool-name BackendPool \
      --probe-name HealthProbe \
      --disable-outbound-snat true

## Outbound rule so that VMs in the backend pool can reach the internet (to install packages etc)

    az network lb outbound-rule create \
      --resource-group $RG_NAME \
      --lb-name LoadBalancer \
      --name OutboundRuleAll \
      --frontend-ip-configs FrontendIP \
      --backend-address-pool BackendPool \
      --protocol All \
      --idle-timeout 4

## NSG to allow HTTP traffic

The `AzureLoadBalancer` service tag as a source address prefix only includes probe traffic, not real traffic. In the backend pool the source port and address range applied for real traffic are from the originating computer, not the load balancer.

    az network nsg create \
      --resource-group $RG_NAME \
      --name MainNSG \
      --location $LOCATION

    az network nsg rule create \
      --resource-group $RG_NAME \
      --nsg-name MainNSG \
      --name AllowIncomingHTTP \
      --priority 100 \
      --access Allow \
      --direction Inbound \
      --protocol Tcp \
      --source-address-prefixes '*' \
      --destination-address-prefixes '*' \
      --destination-port-ranges 80 \
      --description "Allow HTTP traffic from anywhere"

## Create NICs for the webserver VMs; associated with the NSG created and with the backend pool

    az network nic create \
        --resource-group $RG_NAME \
        --name WebServer1VMNic \
        --vnet-name MainVnet \
        --subnet VMSubnet \
        --network-security-group MainNSG \
        --lb-name LoadBalancer \
        --lb-address-pools BackendPool

    az network nic create \
        --resource-group $RG_NAME \
        --name WebServer2VMNic \
        --vnet-name MainVnet \
        --subnet VMSubnet \
        --network-security-group MainNSG \
        --lb-name LoadBalancer \
        --lb-address-pools BackendPool

## Deploy VMs; no public IP and with SSH keys already generated

The SSH key is added just in case later we want SSH access - not used in this scenario. Two premium P6 managed disks are included in the 12-months free tier hence the 64 Gb OS disk size.

    az vm create \
      --name WebServer1 \
      --resource-group $RG_NAME \
      --location $LOCATION \
      --image Ubuntu2404 \
      --size Standard_B1s \
      --nics WebServer1VMNic \
      --os-disk-size-gb 64 \
      --admin-username azureuser \
      --public-ip-address "" \
      --ssh-key-values ~/.ssh/azure_id_rsa.pub

    az vm create \
      --name WebServer2 \
      --resource-group $RG_NAME \
      --location $LOCATION \
      --image Ubuntu2404 \
      --size Standard_B1s \
      --nics WebServer2VMNic \
      --os-disk-size-gb 64 \
      --admin-username azureuser \
      --public-ip-address "" \
      --ssh-key-values ~/.ssh/azure_id_rsa.pub

## Install webserver on VMs

see `configure-webserver.sh` for details.

    az vm run-command invoke \
      --command-id RunShellScript \
      --name WebServer1 \
      --resource-group $RG_NAME \
      --scripts @configure-webserver.sh \
      --parameters WebServer1

    az vm run-command invoke \
      --command-id RunShellScript \
      --name WebServer2 \
      --resource-group $RG_NAME \
      --scripts @configure-webserver.sh \
      --parameters WebServer2

## Test webserver on VMs

    az vm run-command invoke \
      --command-id RunShellScript \
      --name WebServer1 \
      --resource-group $RG_NAME \
      --scripts "curl -s http://localhost"

    az vm run-command invoke \
      --command-id RunShellScript \
      --name WebServer2 \
      --resource-group $RG_NAME \
      --scripts "curl -s http://localhost"

## Test the overall setup

    az network public-ip show \
      --resource-group $RG_NAME \
      --name PublicIP \
      --query ipAddress \
      --output tsv

    curl -s http://<PUBLIC IP>
