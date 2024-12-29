# 02: Set Up Monitoring and Alerts for a Storage account in Azure

## Set up Python environment

    python3 -m venv venv
    . ./venv/bin/activate
    pip install azure-storage-blob python-dotenv

## Create Azure resources

Execute `create_azure_resources.sh` with a location parameter, for example:

    ./create_azure_resources.sh uksouth

Generate a SAS token: execute `generate_sas.sh` with the storage account as a parameter:

    ./generate_sas.sh stgacct12345

## Edit .env

Based on the `example.env` file, create your `.env` file. Add the storage account and the generated SAS token.

## Configure diagnostic settings for the storage account

* Create a log analytics workspace in the Azure portal
* Go to the storage account -> Monitoring -> Diagnostic settings
* select blob, select `Storage Read`, `Storage Write` and `Storage Delete`
* select `Send to log analytics workspace` and choose the workspace created

## Run the main script to generate blob operations

Run `blob_stresser.py`; optionally with the `--interval` parameter. Kill it after a few operations.

## Check Azure Monitor and metrics explorer

Start from Monitor -> Metrics or from the storage account -> Monitoring -> Metrics. View metrics (transactions, egress, ingress etc).

## KQL

Go to the log analytics workspace and run some KQL against the `StorageBlobLogs` table. Example:

    StorageBlobLogs
    | where OperationName in ('PutBlob', 'GetBlob', 'DeleteBlob')
    | summarize Count = count() by OperationName, bin(TimeGenerated, 1h)
    | order by TimeGenerated desc

## Define metrics alert

Monitor -> Alerts -> create alert rule. Select scope (storage account), define condition and lookback period. Add action group (notifications and actions). Set alert severity and alert rule name.

## Clean up blobs uploaded

Run `delete_blobs.py`.