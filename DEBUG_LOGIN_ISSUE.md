# 🔍 DEBUG: Login Network Request Issue

## 🎯 Current Status
Login button shows "Signing in..." but no network request appears in DevTools.

## 🔧 Debugging Steps

### **Step 1: Check Console Logs**

I've added console logs to track the flow. Open browser console (F12 → Console) and try logging in.

**You should see:**
```
🔵 Form submitted! {email: "admin@sweepro.com"}
🔵 Validation passed, starting login...
🔵 Calling loginUser function...
```

**If you DON'T see these logs:**
- Form submit is not triggering
- Check if form element exists
- Check browser console for errors

**If you see the logs but no network request:**
- Issue is in UserContext or AuthService
- Check next steps

---

### **Step 2: Check UserContext**

The login flow is:
```
LoginForm.handleSubmit()
  ↓
UserContext.login(email, password)
  ↓
AuthService.login({email, password})
  ↓
apiRequest('/api/auth/login', ...)
  ↓
fetch() to backend
```

**Open**: `src/contexts/UserContext.tsx`
**Check**: Line 62-83 (login function)

---

### **Step 3: Check AuthService**

**Open**: `src/services/authService.ts`
**Check**: Line 83-118 (login function)

Look for this code:
```typescript
const response = await apiRequest<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
  method: HttpMethod.POST,
  body: credentials,
  requiresAuth: false
});
```

---

### **Step 4: Check API Request Function**

**Open**: `src/services/api.ts`
**Find**: `apiRequest` function

This should make the actual fetch call.

---

### **Step 5: Manual Test**

Try this in browser console:
```javascript
// Test 1: Check if fetch works
fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@sweepro.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Expected**: You should see network request in Network tab

---

### **Step 6: Check Vite Proxy**

**File**: `vite.config.ts`

Proxy configuration:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path
  }
}
```

**Test proxy:**
1. Backend running on `http://localhost:3000`
2. Frontend running on `http://localhost:8080`
3. Requests to `/api/*` should proxy to backend

---

### **Step 7: Check Backend**

**Is backend running?**
```bash
cd backend/sweep-pro-backend
npm run dev
```

**Expected output:**
```
Server running on port 3000
✅ WebSocket server initialized
```

**Test backend directly:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sweepro.com","password":"admin123"}'
```

---

## 🐛 Common Issues & Fixes

### **Issue 1: Form not submitting**

**Symptoms:**
- No console logs appear
- Button shows loading but nothing happens

**Fix:**
```tsx
// Make sure form has onSubmit
<form onSubmit={handleSubmit}>
  {/* fields */}
  <Button type="submit">Sign In</Button>
</form>
```

---

### **Issue 2: CORS Error**

**Symptoms:**
- Console shows: `CORS policy: No 'Access-Control-Allow-Origin'`
- Network request appears but fails

**Fix:**
Backend `src/index.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
```

---

### **Issue 3: Proxy Not Working**

**Symptoms:**
- Request goes to wrong URL
- 404 error

**Fix:**
1. Restart Vite dev server
2. Check vite.config.ts proxy settings
3. Make sure backend is on port 3000

---

### **Issue 4: Backend Not Running**

**Symptoms:**
- Network request shows "Failed to fetch"
- Connection refused error

**Fix:**
```bash
cd backend/sweep-pro-backend
npm run dev
```

---

## 🧪 Complete Test Procedure

### **1. Start Backend**
```bash
cd backend/sweep-pro-backend
npm run dev
```

**Wait for:**
```
Server running on port 3000
✅ WebSocket server initialized
```

### **2. Start Frontend**
```bash
cd frontend/sweep-pro-frontend
npm run dev
```

**Should open:** `http://localhost:8080`

### **3. Open DevTools**
- Press F12
- Go to Network tab
- Clear all requests (trash icon)
- Go to Console tab

### **4. Try Login**
- Email: `admin@sweepro.com`
- Password: `admin123`
- Click "Sign In"

### **5. Check Console**
Look for:
```
🔵 Form submitted! {email: "admin@sweepro.com"}
🔵 Validation passed, starting login...
🔵 Calling loginUser function...
🔑 AuthService: Starting login process
🔑 AuthService: Login API response received
```

### **6. Check Network Tab**
Look for:
```
POST /api/auth/login
Status: 200 OK
```

---

## 📊 Expected vs Actual

### **Expected Flow:**
1. ✅ Form submits
2. ✅ Console logs appear
3. ✅ Network request to `/api/auth/login`
4. ✅ Response with user data
5. ✅ Redirect to dashboard

### **If Network Request Missing:**

**Check in order:**
1. Are console logs appearing? → If NO: Form submit issue
2. Is backend running? → If NO: Start backend
3. Is proxy working? → Test with curl
4. Is CORS configured? → Check backend
5. Any console errors? → Fix errors first

---

## 🔥 Quick Fixes

### **Fix 1: Restart Everything**
```bash
# Stop all servers (Ctrl+C)

# Backend
cd backend/sweep-pro-backend
npm run dev

# Frontend (new terminal)
cd frontend/sweep-pro-frontend
npm run dev
```

### **Fix 2: Clear Browser Cache**
- Ctrl+Shift+Delete
- Clear cache
- Hard reload (Ctrl+F5)

### **Fix 3: Check Environment**
```bash
# Frontend should be on port 8080
# Backend should be on port 3000
```

### **Fix 4: Test API Directly**
```bash
# Test if backend is responding
curl http://localhost:3000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sweepro.com","password":"admin123"}'
```

---

## 📝 Checklist

Before reporting issue, verify:

- [ ] Backend is running on port 3000
- [ ] Frontend is running on port 8080
- [ ] No console errors in browser
- [ ] Form has `<form onSubmit={handleSubmit}>`
- [ ] Button has `type="submit"`
- [ ] Vite proxy is configured
- [ ] CORS is enabled in backend
- [ ] Console logs appear when clicking login
- [ ] Tried with different browser
- [ ] Cleared browser cache

---

## 🆘 Still Not Working?

**Provide this information:**

1. **Console Logs:**
   - Copy all console output
   - Include any errors (red text)

2. **Network Tab:**
   - Screenshot of Network tab
   - Any failed requests?

3. **Backend Logs:**
   - Copy backend terminal output
   - Any errors?

4. **Versions:**
   ```bash
   node --version
   npm --version
   ```

5. **Ports:**
   - Frontend URL: ?
   - Backend URL: ?

---

**Next Step: Try the manual fetch test in browser console to isolate the issue!**
