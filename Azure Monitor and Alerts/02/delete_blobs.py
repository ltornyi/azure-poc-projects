import os
from azure.storage.blob import ContainerClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Read sensitive information from the environment
STORAGE_ACCOUNT_URL = os.getenv("STORAGE_ACCOUNT_URL")
CONTAINER_NAME = os.getenv("CONTAINER_NAME")
ACCESS_KEY = os.getenv("ACCESS_KEY")

if not STORAGE_ACCOUNT_URL or not CONTAINER_NAME or not ACCESS_KEY:
    raise ValueError("Missing required environment variables. Check your .env file.")

# Initialize the ContainerClient
container_client = ContainerClient(
    account_url=STORAGE_ACCOUNT_URL,
    container_name=CONTAINER_NAME,
    credential=ACCESS_KEY
)

for blob in container_client.list_blobs():
    container_client.delete_blob(blob.name)
