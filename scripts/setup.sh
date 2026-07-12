#!/bin/bash
set -e

echo "Setting up FleetPilot Monorepo..."

echo "1. Installing dependencies"
npm install

echo "2. Generating Prisma client"
npm run build -w @fleetpilot/api

echo "3. Building all applications"
npm run build --workspaces

echo "Setup complete! Run 'docker compose -f docker-compose.prod.yml up --build' to start."
