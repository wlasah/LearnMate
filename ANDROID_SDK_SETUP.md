# Android SDK Setup Guide - Complete Solution

## Problem
Your system can't find the Android SDK, which is required to build and deploy the app to your Android phone.

```
Failed to resolve the Android SDK path. Default install location not found: 
C:\Users\RYZEN - 5\AppData\Local\Android\Sdk
Error: 'adb' is not recognized as an internal or external command
```

## Solution - 3 Options

### OPTION 1: Install Android Studio (Recommended - Easiest)

**Step 1: Download Android Studio**
1. Go to: https://developer.android.com/studio
2. Click "Download Android Studio"
3. Run the installer

**Step 2: Complete Installation**
1. Accept license agreements
2. Choose "Standard" installation
3. Let it install Android SDK, emulator, and tools
4. This automatically sets up everything correctly

**Step 3: Verify Installation**
```bash
# Restart PowerShell and try:
adb --version
```

If it shows a version number, you're good! Skip to "Rebuild" section.

---

### OPTION 2: Manual Android SDK Installation (Advanced)

**Step 1: Download Command Line Tools**
1. Go to: https://developer.android.com/studio#command-tools
2. Download "Command line tools only" for Windows
3. Extract to: `C:\Android\cmdline-tools\`
4. Rename the extracted folder to `latest`

**Step 2: Install SDK**
```bash
# Open PowerShell as Administrator
cd C:\Android\cmdline-tools\latest\bin

# Accept licenses
.\sdkmanager.bat --licenses
# Type 'y' and press Enter for each license

# Install required packages
.\sdkmanager.bat "platforms;android-34"
.\sdkmanager.bat "build-tools;34.0.0"
.\sdkmanager.bat "platform-tools"
```

**Step 3: Set Environment Variable**
```bash
# Open PowerShell as Administrator
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android", "User")
[Environment]::SetEnvironmentVariable("Path", "$env:Path;C:\Android\platform-tools", "User")

# Restart PowerShell
```

**Step 4: Verify**
```bash
adb --version
```

---

### OPTION 3: Quick Fix (If You Have Android SDK Elsewhere)

**If your Android SDK is in a different location:**

```bash
# Open PowerShell as Administrator
# Replace PATH with your actual Android SDK location
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\path\to\your\Android\Sdk", "User")

# Add platform-tools to PATH
[Environment]::SetEnvironmentVariable(
  "Path",
  "$env:Path;C:\path\to\your\Android\Sdk\platform-tools",
  "User"
)

# Restart PowerShell and verify
adb --version
```

---

## Setting Environment Variable - Detailed Steps

### Using PowerShell (Easiest)

```bash
# 1. Open PowerShell as Administrator
#    Right-click Windows menu > Windows PowerShell (Admin)

# 2. Run this command (after Android Studio installs SDK):
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:USERPROFILE\AppData\Local\Android\Sdk", "User")

# 3. Close and reopen PowerShell completely

# 4. Verify it worked:
echo $env:ANDROID_HOME
# Should show: C:\Users\YourUsername\AppData\Local\Android\Sdk

# 5. Verify adb is found:
adb --version
# Should show: Android Debug Bridge version X.X.X
```

### Using GUI (If PowerShell Method Doesn't Work)

1. **Press Windows Key + Pause/Break** to open System
2. Click **"Advanced system settings"**
3. Click **"Environment Variables"** button
4. Under "User variables", click **"New"**
5. Set:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\RYZEN - 5\AppData\Local\Android\Sdk`
6. Click OK and apply
7. **Restart PowerShell completely**

---

## Verify Everything is Working

```bash
# Check Android Home is set
echo $env:ANDROID_HOME

# Check adb works
adb --version

# Check SDK is complete
ls $env:ANDROID_HOME\platforms
# Should show: android-XX folders
```

---

## After Setup - Rebuild App

```bash
# Navigate to project
cd "e:\native react apps\myFirstApp"

# Clean rebuild
npx expo prebuild --clean

# Deploy to phone (make sure USB debugging is ON)
npx expo run:android
```

---

## Troubleshooting

### Still Getting "adb not found"?

```bash
# PowerShell doesn't always reload environment vars in current session
# Close PowerShell completely (all windows)
# Then open a new PowerShell window
# Try again

adb --version
```

### USB Debugging Not Enabled?

On your phone:
1. **Settings > About phone**
2. **Tap "Build number" 7 times** (until "Developer mode" appears)
3. **Settings > Developer options**
4. **Enable "USB Debugging"**
5. Connect phone via USB
6. Allow the permission prompt on phone

### Phone Not Showing in adb?

```bash
# Check devices
adb devices

# If your phone shows "unauthorized":
# 1. Disconnect phone
# 2. Tap "Allow" on phone permission dialog
# 3. Reconnect phone
# 4. Try again
adb devices
```

### Still Stuck?

Try using an Android emulator instead (easier for development):

```bash
# Open Android Studio > Device Manager > Create New Device
# Then use emulator instead of phone:
npx expo run:android
# Select the emulator when prompted
```

---

## Path Explanation

Your username has a **space** in it: `RYZEN - 5`

This can cause issues in some cases. The proper path is:
```
C:\Users\RYZEN - 5\AppData\Local\Android\Sdk
```

PowerShell handles this correctly, but command-line tools sometimes don't. If you still get errors with spaces, try:

```bash
# Set ANDROID_HOME with full path in quotes
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\RYZEN - 5\AppData\Local\Android\Sdk", "User")
```

---

## Complete Step-by-Step (All-In-One)

If you want to start completely fresh:

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Run installer, accept defaults
   - Wait for it to complete

2. **Set Environment Variable**
   ```bash
   # PowerShell as Admin
   [Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:USERPROFILE\AppData\Local\Android\Sdk", "User")
   # Close and reopen PowerShell
   ```

3. **Verify Setup**
   ```bash
   adb --version
   # If it works, continue...
   ```

4. **Enable USB Debugging on Phone**
   - Settings > About Phone > tap Build # 7 times
   - Settings > Developer Options > USB Debugging ON

5. **Rebuild App**
   ```bash
   cd "e:\native react apps\myFirstApp"
   npx expo prebuild --clean
   npx expo run:android
   ```

6. **When prompted**: Select your phone from the list

---

## Quick Reference

| Error | Solution |
|-------|----------|
| `adb not found` | Set ANDROID_HOME, restart PowerShell |
| `SDK path not found` | Install Android Studio or manual SDK |
| `Phone not showing` | Enable USB Debugging, reconnect |
| `Unauthorized device` | Tap "Allow" on phone, reconnect |

---

**Once Android SDK is set up, you'll be able to build and deploy to your phone with one command!**
