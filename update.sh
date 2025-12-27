#!/bin/bash

# Navigate to the application directory
if [[ "$(pwd)" != "/home/exsys/dashboard-phoenix-agentics" ]]; then
    echo "Error: Navigate to the app directory first."
    exit 1
fi

# Pull the latest changes from the git repository
echo "Pulling latest changes from git..."
git pull origin main || {
    echo "Error: Git pull failed."
    exit 1
}

# Install dependencies and build the application
echo "Installing dependencies and building the application..."
npm install || {
    echo "Error: Failed to install dependencies."
    exit 1
}

npm run build || {
    echo "Error: Build process failed."
    exit 1
}

# Restart the PM2 instance
echo "Restarting app..."
pm2 restart pa-dashboard || {
    echo "Error: Failed to restart PM2 instance."
    exit 1
}

echo "App updated successfully."