#!/bin/bash

echo "🚀 DevPath Production Setup"
echo "============================"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborting setup"
        exit 1
    fi
fi

# Copy example
cp .env.example .env

# Generate secure JWT secret
echo "🔐 Generating secure JWT secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Update .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/your_secure_jwt_secret_here/$JWT_SECRET/" .env
else
    # Linux
    sed -i "s/your_secure_jwt_secret_here/$JWT_SECRET/" .env
fi

echo "✅ JWT secret generated"
echo ""

# Prompt for configuration
read -p "Enter database name (default: devpath): " DB_NAME
DB_NAME=${DB_NAME:-devpath}

read -p "Enter database user (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Enter database password: " DB_PASSWORD
echo ""

read -p "Enter frontend URL (e.g., https://devpath.com): " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}

read -p "Enter API URL (e.g., https://api.devpath.com/api): " PUBLIC_API_URL
PUBLIC_API_URL=${PUBLIC_API_URL:-http://localhost:4000/api}

# Update .env
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/DB_NAME=.*/DB_NAME=$DB_NAME/" .env
    sed -i '' "s/DB_USER=.*/DB_USER=$DB_USER/" .env
    sed -i '' "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
    sed -i '' "s|FRONTEND_URL=.*|FRONTEND_URL=$FRONTEND_URL|" .env
    sed -i '' "s|PUBLIC_API_URL=.*|PUBLIC_API_URL=$PUBLIC_API_URL|" .env
    sed -i '' "s/NODE_ENV=.*/NODE_ENV=production/" .env
else
    sed -i "s/DB_NAME=.*/DB_NAME=$DB_NAME/" .env
    sed -i "s/DB_USER=.*/DB_USER=$DB_USER/" .env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=$FRONTEND_URL|" .env
    sed -i "s|PUBLIC_API_URL=.*|PUBLIC_API_URL=$PUBLIC_API_URL|" .env
    sed -i "s/NODE_ENV=.*/NODE_ENV=production/" .env
fi

echo ""
echo "✅ Production environment configured!"
echo ""
echo "📋 Next steps:"
echo "   1. Review and edit .env file if needed"
echo "   2. Install dependencies: npm install"
echo "   3. Initialize database: npm run init-db"
echo "   4. Start server: npm start"
echo ""
echo "   Or use Docker:"
echo "   1. docker-compose up -d"
echo "   2. docker-compose exec api npm run init-db"
echo ""
