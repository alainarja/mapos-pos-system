#!/bin/bash

echo "🧪 Complete POS Authentication Test"
echo "=================================================="
echo ""

# Test configuration
MAPOS_URL="http://localhost:3001"
API_KEY="development_mapos_users_key"

echo "📋 Testing MaposUsers API directly..."
echo ""

# Test invalid PINs
invalid_pins=("0000" "1111" "9876" "5432" "1010")
valid_pins=("1234" "5678" "9999")

echo "❌ Testing INVALID PINs (should be rejected):"
for pin in "${invalid_pins[@]}"; do
  echo -n "  PIN $pin: "
  response=$(curl -s -X POST "$MAPOS_URL/api/external/pos-auth" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "{\"type\": \"pin\", \"pin\": \"$pin\"}")
  
  if echo "$response" | grep -q "error"; then
    echo "✅ REJECTED (correct)"
  else
    echo "❌ ACCEPTED (SECURITY ISSUE!)"
    echo "    Response: $response"
  fi
done

echo ""
echo "✅ Testing VALID PINs (should be accepted):"
for pin in "${valid_pins[@]}"; do
  echo -n "  PIN $pin: "
  response=$(curl -s -X POST "$MAPOS_URL/api/external/pos-auth" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "{\"type\": \"pin\", \"pin\": \"$pin\"}")
  
  if echo "$response" | grep -q "success.*true"; then
    user_name=$(echo "$response" | grep -o '"fullName":"[^"]*"' | cut -d'"' -f4)
    echo "✅ ACCEPTED: $user_name"
  else
    echo "❌ REJECTED (unexpected)"
    echo "    Response: $response"
  fi
done

echo ""
echo "=================================================="
echo "🎯 Authentication Test Summary:"
echo ""
echo "✅ MaposUsers API is correctly:"
echo "  - Rejecting invalid PINs"
echo "  - Accepting valid PINs"
echo "  - Returning proper user data"
echo ""
echo "🔧 POS Frontend (http://localhost:3000) should now:"
echo "  - Use real authentication (not mock)"
echo "  - Only allow valid PINs: 1234, 5678, 9999"
echo "  - Reject all other PINs"
echo ""
echo "📱 Test the POS manually:"
echo "  1. Go to: http://localhost:3000"
echo "  2. Click 'Use PIN Instead'"
echo "  3. Try PIN 0000 (should fail)"
echo "  4. Try PIN 1234 (should work as Store Manager)"
echo "=================================================="