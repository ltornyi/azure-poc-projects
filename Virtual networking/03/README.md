# 03: Implement Azure Bastion

We will deploy a Developer SKU Bastion; check region availability [here](https://learn.microsoft.com/en-us/azure/bastion/quickstart-developer-sku#about-the-developer-sku). Paid Bastion SKUs require their own subnet named `AzureBastionSubnet` and a public IP.

## Create resource group and set environment variables for convenience

    RG_NAME="<your resource group>"
    LOCATION="<your preferred region>"
    az group create --name $RG_NAME --location $LOCATION

## VNet and subnet for a Linux VM

    az network vnet create \
      --name MainVnet \
      --resource-group $RG_NAME \
      --location $LOCATION \
      --address-prefix 10.1.0.0/16 \
      --subnet-name VMSubnet \
      --subnet-prefix 10.1.0.0/24

## VM with default NSG, no public IP

Two premium P6 managed disks are included in the 12-months free tier hence the 64 Gb OS disk size.

    az vm create \
      --name VM1 \
      --resource-group $RG_NAME \
      --location $LOCATION \
      --image Ubuntu2404 \
      --size Standard_B1s \
      --vnet-name MainVnet \
      --subnet VMSubnet \
      --os-disk-size-gb 64 \
      --admin-username azureuser \
      --public-ip-address "" \
      --ssh-key-values ~/.ssh/azure_id_rsa.pub

    az vm create \
      --name VM2 \
      --resource-group $RG_NAME \
      --location $LOCATION \
      --image Ubuntu2404 \
      --size Standard_B1s \
      --vnet-name MainVnet \
      --subnet VMSubnet \
      --os-disk-size-gb 64 \
      --admin-username azureuser \
      --public-ip-address "" \
      --generate-ssh-keys \
      --authentication-type all

## Deploy Bastion with Developer SKU

Currently the azure CLI doesn't support creating a Developer SKU Bastion. Go to the Azure portal to deploy one.

Try connecting to VM1 using your SSH private key - if it has a passphrase, add it to the dialog. Try connecting to VM2 using the password and/or the generated SSH key.