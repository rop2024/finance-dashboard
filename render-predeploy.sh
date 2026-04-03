#!/bin/bash
# Render pre-deploy script
npx prisma generate
npx prisma migrate deploy