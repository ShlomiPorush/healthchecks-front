#!/bin/sh

# Runtime environment variable injection for Next.js
# This script replaces placeholder values with actual environment variables at container start

echo "Injecting runtime environment variables..."
echo "API URL: ${NEXT_PUBLIC_API_URL}"

# Use xargs for reliable replacement in all JS files
find /app/.next -name "*.js" -type f | xargs sed -i "s|__NEXT_PUBLIC_API_URL__|${NEXT_PUBLIC_API_URL}|g"
find /app/.next -name "*.js" -type f | xargs sed -i "s|__NEXT_PUBLIC_APIKEY__|${NEXT_PUBLIC_APIKEY}|g"
find /app/.next -name "*.js" -type f | xargs sed -i "s|__NEXT_PUBLIC_NAME__|${NEXT_PUBLIC_NAME:-Healthchecks Dashboard}|g"

# Also HTML files
find /app/.next -name "*.html" -type f | xargs sed -i "s|__NEXT_PUBLIC_NAME__|${NEXT_PUBLIC_NAME:-Healthchecks Dashboard}|g"

echo "Environment variables injected!"

# Start the Next.js app
exec npm start



