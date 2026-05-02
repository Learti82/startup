#!/usr/bin/env bash
set -e

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   PronA — Property Risk Analyzer             ║"
echo "║   Kosovo MVP                                 ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌  Docker is not running. Start Docker Desktop first."
  exit 1
fi

# Check docker compose is available
if ! docker compose version > /dev/null 2>&1; then
  echo "❌  docker compose not found. Install Docker Desktop."
  exit 1
fi

echo "🔨  Building and starting all services..."
echo "    (first run takes ~2-3 minutes to download images)"
echo ""

docker compose up --build -d

echo ""
echo "⏳  Waiting for database to initialize..."
sleep 8

echo ""
echo "✅  PronA is running!"
echo ""
echo "   🌐  App:      http://localhost:5173"
echo "   🔧  API:      http://localhost:3001/api/health"
echo "   🗄️   Database: localhost:5432"
echo ""
echo "   Demo accounts:"
echo "   👤  Blerës:   arbeni@demo.ks  /  password123"
echo "   🛡️   Admin:    admin@prona.ks  /  Admin@2024!"
echo "   ⚖️   Avokat:   avokati@demo.ks /  password123"
echo ""
echo "   To stop:  docker compose down"
echo "   To reset: docker compose down -v && docker compose up --build -d"
echo ""
