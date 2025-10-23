#!/bin/sh
set -e

echo "Starting NocoDB Viewer..."

# Start the Next.js application
exec node server.js
