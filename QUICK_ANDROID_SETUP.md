# Quick Android SDK Setup - 5 Minutes

## TL;DR - Just Do This

### Step 1: Download Android Studio
- Go to: https://developer.android.com/studio
- Click Download
- Run the installer
- Click "Next" through everything
- Wait for it to finish (~5-10 mins)

### Step 2: Set Environment Variable
Open **PowerShell as Administrator** and run:

```powershell
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:USERPROFILE\AppData\Local\Android\Sdk", "User")
```

Then **close all PowerShell windows completely** and open a new one.

### Step 3: Enable USB Debugging on Phone

On your Android phone:
1. **Settings > About Phone**
2. **Tap "Build Number" 7 times** (yes, really!)
3. **Go back, then Settings > Developer Options**
4. **Turn ON "USB Debugging"**
5. **Connect phone via USB cable**

### Step 4: Rebuild & Deploy

```bash
cd "e:\native react apps\myFirstApp"
npx expo prebuild --clean
npx expo run:android
```

When it asks which device, pick your phone. Done!

---

## Verify It Works (Optional)

```powershell
# Check Android Home
echo $env:ANDROID_HOME

# Check adb is found
adb --version

# Check devices connected
adb devices
```

Should see your phone listed.

---

## Common Issues

| Problem | Solution |
|---------|----------|
| `adb not found` | Close PowerShell completely, open new one |
| `SDK not found` | Restart computer after setting environment var |
| Phone shows `unauthorized` | Tap "Allow" when phone prompts, reconnect |
| Phone doesn't show in `adb devices` | Enable USB Debugging in phone settings |
| Build still fails | Check Android Studio finished installing |

---

## That's It!

Once Android Studio is installed and environment variable is set, you're all set to build!

Next builds will be much faster since you won't need to install SDK again.
