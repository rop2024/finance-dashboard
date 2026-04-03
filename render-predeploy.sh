#!/bin/bash
# Render pre-deploy script for database setup
echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🗄️ Running database migrations..."
npx prisma migrate deploy

echo "✅ Pre-deploy setup complete!"