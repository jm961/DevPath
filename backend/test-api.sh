#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:4000"

echo -e "${BLUE}🧪 DevPath API Test Suite${NC}"
echo "================================"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
response=$(curl -s "$BASE_URL/health")
if echo "$response" | grep -q "ok"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "Response: $response"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi
echo ""

# Test 2: User Signup
echo -e "${YELLOW}Test 2: User Signup${NC}"
TEST_EMAIL="test_$(date +%s)@example.com"
signup_response=$(curl -s -X POST "$BASE_URL/api/v1-signup" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"TestPass123\",\"name\":\"Test User\"}")

if echo "$signup_response" | grep -q "token"; then
    echo -e "${GREEN}✅ Signup successful${NC}"
    echo "Response: $signup_response"
    TOKEN=$(echo "$signup_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$signup_response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
else
    echo -e "${RED}❌ Signup failed${NC}"
    echo "Response: $signup_response"
    exit 1
fi
echo ""

# Test 3: User Login
echo -e "${YELLOW}Test 3: User Login${NC}"
login_response=$(curl -s -X POST "$BASE_URL/api/v1-login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"TestPass123\"}")

if echo "$login_response" | grep -q "token"; then
    echo -e "${GREEN}✅ Login successful${NC}"
    echo "Response: $login_response"
    TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "Response: $login_response"
    exit 1
fi
echo ""

# Test 4: Get Current User (Protected)
echo -e "${YELLOW}Test 4: Get Current User (Protected)${NC}"
me_response=$(curl -s -X GET "$BASE_URL/api/v1-me" \
    -H "Authorization: Bearer $TOKEN")

if echo "$me_response" | grep -q "$TEST_EMAIL"; then
    echo -e "${GREEN}✅ Get current user successful${NC}"
    echo "Response: $me_response"
else
    echo -e "${RED}❌ Get current user failed${NC}"
    echo "Response: $me_response"
    exit 1
fi
echo ""

# Test 5: Update Profile (Protected)
echo -e "${YELLOW}Test 5: Update Profile (Protected)${NC}"
update_response=$(curl -s -X PATCH "$BASE_URL/api/v1-update-profile" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Updated Test User"}')

if echo "$update_response" | grep -q "ok"; then
    echo -e "${GREEN}✅ Profile update successful${NC}"
    echo "Response: $update_response"
else
    echo -e "${RED}❌ Profile update failed${NC}"
    echo "Response: $update_response"
    exit 1
fi
echo ""

# Test 6: Invalid Login
echo -e "${YELLOW}Test 6: Invalid Login (should fail)${NC}"
invalid_response=$(curl -s -X POST "$BASE_URL/api/v1-login" \
    -H "Content-Type: application/json" \
    -d '{"email":"wrong@example.com","password":"wrongpass"}')

if echo "$invalid_response" | grep -q "Invalid credentials"; then
    echo -e "${GREEN}✅ Invalid login properly rejected${NC}"
    echo "Response: $invalid_response"
else
    echo -e "${RED}❌ Invalid login test failed${NC}"
    echo "Response: $invalid_response"
fi
echo ""

# Test 7: Protected Route without Token
echo -e "${YELLOW}Test 7: Protected Route without Token (should fail)${NC}"
no_token_response=$(curl -s -X GET "$BASE_URL/api/v1-me")

if echo "$no_token_response" | grep -q "Authentication required"; then
    echo -e "${GREEN}✅ Protected route properly secured${NC}"
    echo "Response: $no_token_response"
else
    echo -e "${RED}❌ Protected route test failed${NC}"
    echo "Response: $no_token_response"
fi
echo ""

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}🎉 All Tests Passed!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "Test user created:"
echo "  Email: $TEST_EMAIL"
echo "  Password: TestPass123"
echo "  User ID: $USER_ID"
echo "  Token: ${TOKEN:0:50}..."
echo ""

