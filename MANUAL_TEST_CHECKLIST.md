# 🧪 Manual Testing Checklist for Deployed POS

## 📋 **Test the Deployment - https://mapos-pos-system.vercel.app/**

### **Phase 1: Debug Page Test**
1. Go to: **https://mapos-pos-system.vercel.app/debug**
2. Click **"Run Debug Tests"**
3. **Check Configuration Status:**
   - ✅ **Base URL:** Should show `https://maposusers.vercel.app` (not "Not configured")
   - ✅ **Has API Key:** Should show "Yes" (not "No")
   - ✅ **Using Mock Auth:** Should show "No (Real API)" (not "Yes (Mock)")

4. **Check Environment Variables:**
   - ✅ **NEXT_PUBLIC_MAPOS_USERS_API_URL:** Should show `https://maposusers.vercel.app`
   - ✅ **NEXT_PUBLIC_MAPOS_USERS_API_KEY:** Should show "SET"
   - ✅ **VERCEL:** Should show "1" or "true"

5. **Check PIN Authentication Tests:**
   - ❌ **PIN 0000:** Should show "❌ Invalid PIN..." (REJECTED)
   - ✅ **PIN 1234:** Should show "✅ Store Manager" (ACCEPTED)
   - ✅ **PIN 5678:** Should show "✅ Store Cashier" (ACCEPTED)
   - ✅ **PIN 9999:** Should show "✅ POS Administrator" (ACCEPTED)

### **Phase 2: Authentication UI Test**
1. Go to: **https://mapos-pos-system.vercel.app/**
2. Click **"Use PIN Instead"**

#### **Test Invalid PIN (Should Fail):**
3. Enter: **0000**
4. **Expected Result:**
   - 🔄 PIN field should **shake**
   - 🔄 PIN should **clear automatically**
   - 🔄 Should **stay on login screen**
   - 🔄 **No error message needed** (visual feedback is enough)

#### **Test Valid PIN - Manager (Should Work):**
5. Enter: **1234**
6. **Expected Result:**
   - ✅ Should **login successfully**
   - ✅ Should show **"Store Manager"** or user name
   - ✅ Should show **POS interface/dashboard**
   - ✅ Should have **manager permissions**

#### **Test Logout and Cashier PIN:**
7. **Logout** (if logout button available)
8. Enter: **5678**
9. **Expected Result:**
   - ✅ Should **login successfully**
   - ✅ Should show **"Store Cashier"** or user name
   - ✅ Should have **limited permissions** compared to manager

#### **Test Admin PIN:**
10. **Logout** and try: **9999**
11. **Expected Result:**
    - ✅ Should **login successfully**
    - ✅ Should show **"POS Administrator"** or user name
    - ✅ Should have **full admin access**

### **Phase 3: Browser Console Check**
1. **Open Developer Tools** (F12)
2. Go to **Console tab**
3. Try a PIN authentication
4. **Look for:**
   - ✅ **API requests** to `https://maposusers.vercel.app`
   - ❌ **No "mock authentication" warnings**
   - ❌ **No "not properly configured" messages**
   - ✅ **Successful authentication responses**

### **Phase 4: Network Tab Check**
1. In **Developer Tools**, go to **Network tab**
2. Try PIN authentication
3. **Look for:**
   - ✅ **POST request** to `https://maposusers.vercel.app/api/external/pos-auth`
   - ✅ **Status 200** for valid PINs
   - ✅ **Status 401** for invalid PINs
   - ✅ **Proper request headers** with API key

## 🚨 **If Tests Fail:**

### **Debug Page Shows "Mock Auth":**
- Environment variables not set in Vercel
- Redeploy after setting variables

### **Debug Page Shows "Not configured":**
- Environment variables have wrong values
- Check Vercel environment variable settings

### **All PINs Are Accepted:**
- Mock authentication is still active
- Environment variables not properly loaded

### **Network Requests Fail:**
- MaposUsers service not deployed or reachable
- CORS issues between services
- API key mismatch

### **No Network Requests Visible:**
- Frontend is using mock authentication
- Environment variables not available to browser

## ✅ **Success Indicators:**

- ❌ **PIN 0000:** Rejected with shake animation
- ✅ **PIN 1234:** Logs in as Store Manager
- ✅ **PIN 5678:** Logs in as Store Cashier
- ✅ **PIN 9999:** Logs in as POS Administrator
- 🌐 **Network:** Real API calls to MaposUsers service
- 🔧 **Debug:** Shows real API configuration

## 📊 **Report Results:**

After testing, please report:
1. **Debug page results** (screenshot helpful)
2. **PIN authentication behavior** for each PIN
3. **Console messages** (any errors or warnings)
4. **Network requests** (successful API calls?)

This will help identify any remaining issues with the deployment!