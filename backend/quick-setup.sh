#!/bin/bash

echo "🚀 DevPath Backend Quick Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo "Checking PostgreSQL status..."
if ! pg_isready > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL is not running${NC}"
    echo "Start it with: brew services start postgresql@15"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Database configuration
DB_NAME="devpath_db"
DB_USER="postgres"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
    read -p "Drop and recreate? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        dropdb "$DB_NAME" 2>/dev/null
        echo -e "${GREEN}✅ Dropped existing database${NC}"
    fi
fi

# Create database
if ! psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Creating database '$DB_NAME'..."
    createdb "$DB_NAME"
    echo -e "${GREEN}✅ Database created${NC}"
fi
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Using existing .env file"
    else
        rm .env
        echo -e "${GREEN}✅ Removed old .env${NC}"
    fi
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    
    # Generate JWT secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=

# Server Configuration
PORT=4000
FRONTEND_URL=http://localhost:4321

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
EOF
    
    echo -e "${GREEN}✅ .env file created${NC}"
fi
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
fi

# Initialize database tables
echo "Initializing database tables..."
npm run init-db
echo ""

# Test database connection
echo "Testing database connection..."
if node -e "const pool = require('./src/config/database'); pool.query('SELECT NOW()').then(() => { console.log('✅ Database connection successful'); process.exit(0); }).catch(err => { console.error('❌ Connection failed:', err.message); process.exit(1); });" 2>&1 | grep -q "✅"; then
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}🎉 Setup Complete!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the server: npm run dev"
    echo "2. Test the API: curl http://localhost:4000/health"
    echo "3. Create a user: curl -X POST http://localhost:4000/api/v1-signup \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}'"
    echo ""
else
    echo -e "${RED}❌ Database connection test failed${NC}"
    echo "Please check your .env configuration"
    exit 1
fi

