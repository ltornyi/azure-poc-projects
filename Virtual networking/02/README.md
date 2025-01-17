# 02: Create a Virtual Private Network (VPN) with Azure Virtual Network and VPN Gateway

## Create resource group

Set environment variables for convenience.

    RG_NAME="<your resource group>"
    LOCATION="<your preferred region>"
    az group create --name $RG_NAME --location $LOCATION

## Set up the virtual network

    VNET_NAME="MyVnet"
    VNET_ADDRESS_SPACE="10.2.0.0/16"

    az network vnet create \
      --resource-group $RG_NAME \
      --name $VNET_NAME \
      --location $LOCATION \
      --address-prefixes $VNET_ADDRESS_SPACE

### Set up subnet for VM and deploy VM

    VM_SUBNET_NAME="VmSubnet"
    VM_SUBNET_ADDRESS_SPACE="10.2.2.0/24"

    az network vnet subnet create \
      --resource-group $RG_NAME \
      --vnet-name $VNET_NAME \
      --name $VM_SUBNET_NAME \
      --address-prefixes $VM_SUBNET_ADDRESS_SPACE

Use existing ssh key and no public IP:

    az vm create \
      --name MyPrivateVM \
      --resource-group $RG_NAME \
      --location $LOCATION \
      --vnet-name $VNET_NAME \
      --subnet $VM_SUBNET_NAME \
      --image Ubuntu2204 \
      --size Standard_B1s \
      --os-disk-size-gb 64 \
      --admin-username azureuser \
      --public-ip-address "" \
      --ssh-key-values ~/.ssh/azure_id_rsa.pub

Optional: deploy a Developer SKU Bastion to check VM connectivity.

## Create storage account and restrict access to the VmSubnet

### Create storage account

    STORAGE_ACCOUNT_NAME="mysecuredsa$RANDOM"

    az storage account create \
      --resource-group $RG_NAME \
      --name $STORAGE_ACCOUNT_NAME \
      --location $LOCATION \
      --sku Standard_LRS \
      --kind StorageV2 \
      --enable-hierarchical-namespace false

### Enable service endpoint and restrict storage account access

A private endpoint is probably a better solution but that comes with a cost.

    az network vnet subnet update \
      --resource-group $RG_NAME \
      --vnet-name $VNET_NAME \
      --name $VM_SUBNET_NAME \
      --service-endpoints "Microsoft.Storage"

    az storage account network-rule add \
      --resource-group $RG_NAME \
      --account-name $STORAGE_ACCOUNT_NAME \
      --vnet-name $VNET_NAME \
      --subnet $VM_SUBNET_NAME

    az storage account update \
      --resource-group $RG_NAME \
      --name $STORAGE_ACCOUNT_NAME \
      --default-action Deny

### Check vnet setup and storage account firewall / network settings

Take a look on the portal or execute the following commands:

    az network vnet subnet show \
      --resource-group $RG_NAME \
      --vnet-name $VNET_NAME \
      --name $VM_SUBNET_NAME \
      --query "serviceEndpoints" \
      --output table

    az storage account show \
      --resource-group $RG_NAME \
      --name $STORAGE_ACCOUNT_NAME \
      --query "networkRuleSet" \
      --output json

## Test storage account connectivity

We will try to create a container. This will fail from the desktop because account keys cannot be listed.

    CONTAINER_NAME="test-container"

    az storage container create \
      --name $CONTAINER_NAME \
      --account-name $STORAGE_ACCOUNT_NAME

Deploy an Developer SKU Bastion, connect to the VM and execute the same command - it should succeed. You might need to install the CLI first:

    curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

Login using

    az login --use-device-code

## Configure the VPN Gateway to access the VM and the storage account

### Add the GatewaySubnet

    GW_SUBNET_NAME="GatewaySubnet"
    GW_SUBNET_ADDRESS_SPACE="10.2.1.0/24"

    az network vnet subnet create \
      --resource-group $RG_NAME \
      --vnet-name $VNET_NAME \
      --name $GW_SUBNET_NAME \
      --address-prefixes $GW_SUBNET_ADDRESS_SPACE

### Create a Public IP for the VPN Gateway

    az network public-ip create \
      --resource-group $RG_NAME \
      --name PublicVPNGwIP \
      --location $LOCATION \
      --sku Standard

### Create the VPN Gateway

It can take 45 minutes or more to fully deploy the gateway.

    az network vnet-gateway create \
      --name VPNGateway \
      --resource-group $RG_NAME \
      --location $LOCATION \
      --vnet $VNET_NAME \
      --public-ip-address PublicVPNGwIP \
      --gateway-type Vpn \
      --vpn-type RouteBased \
      --sku VpnGw1 \
      --no-wait

### Specify client IP address pool

If you forgot at creation time...

    az network vnet-gateway update \
      --resource-group $RG_NAME \
      --name VPNGateway \
      --address-prefix 172.16.0.0/24

### Generate certificates

Root certificate and client certificate on local machine

    # Generate a root certificate (private key)
    openssl genpkey -algorithm RSA -out root-cert-key.pem

    # Create the root certificate (public part)
    openssl req -x509 -new -key root-cert-key.pem -out root-cert.pem -days 3650 -subj "/CN=RootVPNCert"
    
    # Generate a private key for the client certificate
    openssl genpkey -algorithm RSA -out client-cert-key.pem

    # Generate a certificate signing request (CSR) for the client certificate
    openssl req -new -key client-cert-key.pem -out client-cert.csr -subj "/CN=MyClient"

    # Sign the client certificate with the root certificate
    openssl x509 -req -in client-cert.csr -CA root-cert.pem -CAkey root-cert-key.pem -CAcreateserial -out client-cert.pem -days 365

### Upload root certificate

    az network vnet-gateway root-cert create \
      --resource-group $RG_NAME \
      --gateway-name VPNGateway \
      --name VPNRootCert \
      --public-cert-data root-cert.pem

### Export VPN client configuration

Download VPN client from the portal; unzip the downloaded file. Find the `vpnconfig.ovpn` file, open it in a text editor and add the contents of the `client-cert.pem` and the `client-cert-key.pem` to the relevant places.

## Install and configure VPN client

OpenVPN Connect or Tunnelblick or similar. Point your favourite to the `vpnconfig.ovpn` file.

    brew install --cask openvpn-connect