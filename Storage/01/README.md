# 01: Deploy a Static Website Using Azure Storage

## Run site locally

    cd Storage/01
    python -m http.server

Go to `http://localhost:8000` and check the page.

## Deploy to Azure

* Create resource group
* Create storage account; should be general purpose V2
* Enable static website hosting: storage account -> Data management -> Static website
* set `index.html` as the index document
* set `404.html` as the error document
* find the primary endpoint URL: `https://<storage-account-name>.<something>.web.core.windows.net/`
* upload example files to the `$web` container