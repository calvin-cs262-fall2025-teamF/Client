# Testing Guide for API Integration

## Quick Start

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Run on your preferred platform:**
   - Press `w` for web browser
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Or scan QR code with Expo Go app on your phone

## Testing Steps

### 1. Test Sign Up (Create Account)

1. Navigate to the Sign Up screen
2. Fill in the form:
   - Name (required)
   - LinkedIn Profile (optional)
   - University (required)
   - Major (required)
   - Graduation Year (optional)
   - Target Companies, Roles, Industries, Locations (optional)
   - Resume Upload (optional)
3. Click "Create Account"
4. **What to check:**
   - ✅ Account should be created successfully
   - ✅ You should be redirected/logged in
   - ✅ Check browser console/network tab for API call to `/api/auth/signup`
   - ✅ Verify token is stored (see "Checking Token Storage" below)

### 2. Test Login

1. Navigate to the Login screen
2. Enter the name you used during signup
3. Click "Sign In"
4. **What to check:**
   - ✅ Login should be successful
   - ✅ Check browser console/network tab for API call to `/api/auth/login`
   - ✅ Verify token is stored
   - ✅ Subsequent API calls should include `Authorization: Bearer <token>` header

### 3. Check Network Requests

#### On Web Browser:
1. Open Developer Tools (F12 or Cmd+Option+I)
2. Go to **Network** tab
3. Filter by "Fetch/XHR"
4. Perform login/signup
5. **Check:**
   - ✅ Request URL should be `https://poros-data-service.vercel.app/api/auth/login` or `/signup`
   - ✅ Request headers should include `Content-Type: application/json`
   - ✅ After login, subsequent requests should include `Authorization: Bearer <token>`
   - ✅ Response should contain `token` and `user` data

#### On Mobile (Expo Go):
1. Shake your device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
2. Select "Debug Remote JS"
3. Open Chrome DevTools (should open automatically)
4. Go to **Network** tab
5. Test the same way as web

### 4. Check Token Storage

#### Method 1: Using React Native Debugger
1. Install React Native Debugger or use Chrome DevTools
2. In the console, run:
   ```javascript
   const AsyncStorage = require('@react-native-async-storage/async-storage').default;
   AsyncStorage.getItem('auth_token').then(token => console.log('Token:', token));
   ```

#### Method 2: Add Temporary Debug Code
Add this temporarily to your `apiService.ts` after `setToken`:
```typescript
async setToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    console.log('✅ Token stored:', token.substring(0, 20) + '...'); // Log first 20 chars
  } catch (error) {
    console.error('Error storing token:', error);
  }
}
```

#### Method 3: Check in Browser DevTools (Web)
1. Open DevTools → Application tab
2. Go to Local Storage
3. Look for key `auth_token`

### 5. Test API Endpoints

After logging in, test other endpoints:

```javascript
// In browser console or React Native Debugger
import apiService from './src/services/apiService';

// Get current user
apiService.getUser('user-id-here').then(console.log);

// Get applications
apiService.getApplications('user-id-here').then(console.log);
```

### 6. Verify Error Handling

1. **Test with invalid credentials:**
   - Try logging in with a name that doesn't exist
   - Should show error message

2. **Test with network offline:**
   - Turn off internet
   - Try to login
   - Should show appropriate error

3. **Test with invalid API URL:**
   - Temporarily change API_BASE_URL to invalid URL
   - Should handle error gracefully

## Expected API Response Format

### Login/Signup Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com",
    ...
  }
}
```

### API Request Headers (After Login):
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Common Issues & Solutions

### Issue: "Failed to log in" error
- **Check:** Is your backend running at `https://poros-data-service.vercel.app`?
- **Check:** Are the API endpoints correct? (`/api/auth/login`, `/api/auth/signup`)
- **Check:** Does the backend expect `name` or `email`/`password` for login?

### Issue: Token not being stored
- **Check:** Is AsyncStorage working? (Check console for errors)
- **Check:** Does the API response include a `token` field?

### Issue: 401 Unauthorized on subsequent requests
- **Check:** Is the token being included in headers?
- **Check:** Is the token valid/not expired?
- **Check:** Network tab to see if `Authorization` header is present

### Issue: CORS errors (web only)
- **Check:** Backend needs to allow CORS from your origin
- **Check:** Backend should include appropriate CORS headers

## Testing Checklist

- [ ] Sign up creates account successfully
- [ ] Token is stored after signup
- [ ] Login works with created account
- [ ] Token is stored after login
- [ ] Subsequent API calls include Authorization header
- [ ] Error messages display correctly
- [ ] Network requests show correct URL and headers
- [ ] App works on web, iOS, and Android

## Debugging Tips

1. **Add console logs:**
   ```typescript
   // In apiService.ts request method
   console.log('API Request:', url, { headers, body });
   console.log('API Response:', data);
   ```

2. **Check Redux state:**
   - Use Redux DevTools to see if user is stored in state

3. **Monitor AsyncStorage:**
   - Use React Native Debugger to inspect AsyncStorage values

4. **Test backend directly:**
   ```bash
   curl -X POST https://poros-data-service.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"name": "test"}'
   ```

