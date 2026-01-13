#!/bin/bash

# System Health Check Script
# Tests that all critical endpoints are working

echo "🔍 Testing Recruitment Management System..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq "$expected_code" ]; then
        echo -e "${GREEN}✓${NC} $name (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $name (Expected $expected_code, got $response)"
        ((FAILED++))
    fi
}

# Test Backend
echo "Backend Tests:"
test_endpoint "Health Check" "http://localhost:3000/health" 200
test_endpoint "API Docs" "http://localhost:3000/api-docs" 301
test_endpoint "Public Vacancies" "http://localhost:3000/api/public/vacancies" 200

# Test Frontend
echo ""
echo "Frontend Tests:"
test_endpoint "Frontend Home" "http://localhost:5174" 200

# Test Login
echo ""
echo "Authentication Test:"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@recruitment.com","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓${NC} Login successful (token received)"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Login failed"
    ((FAILED++))
fi

# Summary
echo ""
echo "================================"
echo "Summary: $PASSED passed, $FAILED failed"
echo "================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed ✗${NC}"
    exit 1
fi

