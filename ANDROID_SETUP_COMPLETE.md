# Verify Android SDK Setup

## Environment Variables Set:
- ANDROID_HOME=E:\android
- PATH includes: E:\android\platform-tools

## Verify Commands (Run these in a NEW PowerShell):

```powershell
# Check ANDROID_HOME
echo $env:ANDROID_HOME
# Should output: E:\android

# Check adb is accessible
adb --version
# Should show: Android Debug Bridge version X.X.X

# List connected devices
adb devices
# Should show: List of attached devices
# If phone is connected and USB Debugging is ON:
# emulator-XXXX    device
# OR
# your-phone-name  device
```

## If Commands Work:

You're ready to rebuild! Run:

```bash
cd "e:\native react apps\myFirstApp"
npx expo prebuild --clean
npx expo run:android
```

## Important: USB Debugging

Before running the build, make sure:

1. **Enable USB Debugging on your phone:**
   - Settings > About Phone
   - Tap "Build Number" 7 times
   - Settings > Developer Options
   - Turn ON "USB Debugging"

2. **Connect your phone via USB**

3. **Allow permissions** when prompted on phone

---

**Status: ✅ Android SDK installed and configured!**
