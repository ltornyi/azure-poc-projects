import os
import time
import argparse
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

def upload_blob(blob_name, content):
    """Upload a blob to the container."""
    blob_client = container_client.get_blob_client(blob_name)
    blob_client.upload_blob(content, overwrite=True)
    print(f"Uploaded: {blob_name}")

def download_blob(blob_name):
    """Download a blob from the container."""
    blob_client = container_client.get_blob_client(blob_name)
    data = blob_client.download_blob().readall()
    print(f"Downloaded: {blob_name}")
    return data

# Command-line argument parsing
parser = argparse.ArgumentParser(description="Azure Blob Storage continuous read/write script.")
parser.add_argument(
    "--interval",
    type=int,
    default=5,
    help="Time interval (in seconds) between read/write operations (default: 5 seconds)."
)
args = parser.parse_args()

# Main Loop
try:
    print(f"Starting continuous read/write operations with an interval of {args.interval} seconds...")
    i = 0
    while True:
        # Generate a test file content
        blob_name = f"test_blob_{i}.txt"
        content = f"This is blob number {i}\n"

        # Write to blob storage
        upload_blob(blob_name, content)

        # Read from blob storage
        downloaded_content = download_blob(blob_name)

        # Verify content
        assert content == downloaded_content.decode("utf-8")
        print(f"Verified: {blob_name}")

        # Increment counter and sleep for the specified interval
        i += 1
        time.sleep(args.interval)

except KeyboardInterrupt:
    print("Stopped continuous read/write operations.")
except Exception as e:
    print(f"Error: {e}")
