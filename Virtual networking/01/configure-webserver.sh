#!/bin/bash
VM_NAME=$1

HTML_CONTENT="<html>
<head>
    <title>VM Web Server</title>
</head>
<body>
    <h1>Hello from $VM_NAME</h1>
</body>
</html>"

sudo apt update && sudo apt install -y nginx
echo "$HTML_CONTENT" | sudo tee /var/www/html/index.html
sudo systemctl enable nginx
sudo systemctl start nginx
