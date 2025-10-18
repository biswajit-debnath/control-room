# Testing Configuration Guide

This application includes a centralized testing configuration system to help with development and testing.

## Configuration File

Location: `/testing.config.ts`

## Available Flags

### `autoFillDGForm` (default: `true`)
Automatically fills the DG Operations form with test data when you visit the page.

**What it fills:**
- Testing Hours From/To
- Progressive Hours
- Oil Levels
- Battery Condition
- On Duty Staff
- Remarks
- All numeric fields

**What you still need to fill:**
- Date & Time (required)
- Shift (required)
- EOD in Shift (optional)

**How to disable:**
```typescript
// In testing.config.ts
autoFillDGForm: false,
```

---

### `showDebugLogs` (default: `true`)
Shows testing-related debug messages in the browser console.

**Example output:**
```
🧪 [TEST] Auto-filling DG Operations form...
🧪 [TEST] Form auto-filled! Remember to set Date/Time, Shift, and EOD.
```

**How to disable:**
```typescript
// In testing.config.ts
showDebugLogs: false,
```

---

### `skipValidation` (default: `false`)
**⚠️ Not recommended for normal testing**

Skip form validation for faster testing. Use with caution as it may allow invalid data.

---

### `reducedDelays` (default: `true`)
Reduces timeouts and delays throughout the application for faster testing.

**Effects:**
- Auto-fill delay: 300ms instead of 500ms
- Other delays reduced proportionally

---

### `autoLogin` (default: `false`)
**🚧 For future implementation**

Automatically log in with test credentials.

---

### `mockAPIResponses` (default: `false`)
**🚧 For future implementation**

Use mocked API responses instead of real backend calls.

---

## Quick Start

### Enable All Testing Features
```typescript
// testing.config.ts
export const testingConfig = {
  autoFillDGForm: true,
  showDebugLogs: true,
  skipValidation: false, // Keep validation on
  autoLogin: false,
  mockAPIResponses: false,
  reducedDelays: true,
}
```

### Disable All Testing Features
```typescript
// testing.config.ts
export const testingConfig = {
  autoFillDGForm: false,
  showDebugLogs: false,
  skipValidation: false,
  autoLogin: false,
  mockAPIResponses: false,
  reducedDelays: false,
}
```

### Production Mode
All testing features are **automatically disabled** in production builds (`NODE_ENV=production`).

---

## Helper Functions

### `isTestingEnabled()`
Returns `true` if running in development mode.

```typescript
import { isTestingEnabled } from '@/testing.config'

if (isTestingEnabled()) {
  // Run testing-specific code
}
```

### `testLog(message, ...args)`
Logs a message with the testing prefix if `showDebugLogs` is enabled.

```typescript
import { testLog } from '@/testing.config'

testLog('User action completed', { userId: 123 })
// Output: 🧪 [TEST] User action completed { userId: 123 }
```

---

## Adding New Testing Features

1. **Add flag to `testing.config.ts`:**
```typescript
export const testingConfig = {
  // ... existing flags
  myNewFeature: true,
}
```

2. **Use in your component:**
```typescript
import testingConfig, { isTestingEnabled, testLog } from '@/testing.config'

useEffect(() => {
  if (isTestingEnabled() && testingConfig.myNewFeature) {
    testLog('Running my new feature...')
    // Your feature code here
  }
}, [])
```

---

## Best Practices

1. ✅ **Always check `isTestingEnabled()`** before using testing features
2. ✅ **Use `testLog()`** instead of `console.log()` for testing messages
3. ✅ **Keep validation enabled** during normal testing
4. ✅ **Document new flags** in this file when adding them
5. ❌ **Never commit sensitive data** in the testing config
6. ❌ **Don't rely on testing features** in production code

---

## Troubleshooting

### Auto-fill not working?
1. Check that `autoFillDGForm: true` in `testing.config.ts`
2. Open browser console to see testing logs
3. Verify you're in development mode (`npm run dev`)
4. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### No console logs?
1. Check that `showDebugLogs: true` in `testing.config.ts`
2. Verify browser console is set to show all log levels
3. Make sure you're using `testLog()` not `console.log()`

### Features working in production?
- All testing features are automatically disabled in production
- Double-check your build environment variables
- Never set `NODE_ENV=development` in production

---

## Quick Toggle Tips

Want to quickly toggle features without editing the file?

**Browser Console:**
```javascript
// This won't persist across page reloads, but useful for quick tests
// Note: This only works if you expose it in your code
```

**Environment Variables (Future):**
```env
# .env.local
NEXT_PUBLIC_TESTING_AUTO_FILL=false
NEXT_PUBLIC_TESTING_DEBUG_LOGS=false
```

---

## Support

For questions or issues with testing features:
1. Check this documentation
2. Review `testing.config.ts` comments
3. Look for `testLog()` messages in console
4. Contact the development team

---

**Last Updated:** October 18, 2025
