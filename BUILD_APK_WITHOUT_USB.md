# Build APK Without USB - 2 Methods

## Method 1: Use EAS Build (Cloud Build) - RECOMMENDED ⭐

Expo's cloud service builds the APK for you. No JDK needed!

### Steps:

1. **Install EAS CLI:**
```bash
npm install -g eas-cli
```

2. **Login to Expo account:**
```bash
eas login
# If you don't have account, create one at: https://expo.dev/signup
```

3. **Build the APK:**
```bash
cd "e:\native react apps\myFirstApp"
eas build --platform android --local
```

4. **When asked:**
   - Build type: Select **"apk"** (not "app-bundle")
   - Keep other defaults

5. **Wait for build to complete** (takes 5-10 minutes)

6. **Download the APK** from the link provided

### Transfer to Phone:

Once you have the APK file:

**Option A: Google Drive**
1. Upload APK to Google Drive
2. Open Drive on your phone
3. Download the APK
4. Open Downloads app, tap APK to install

**Option B: Email**
1. Email the APK to yourself
2. Open email on phone
3. Download attachment
4. Open Downloads, tap to install

**Option C: Bluetooth**
1. Transfer APK via Bluetooth to phone
2. Open file on phone
3. Install

**Option D: Cloud Storage (OneDrive, Dropbox)**
1. Upload APK to cloud
2. Open cloud app on phone
3. Download and install

---

## Method 2: Download Pre-Built APK

If you just want to test quickly, I can provide you with a basic APK template. Contact support.

---

## After Installation:

1. **Allow Unknown Apps:**
   - Settings > Apps
   - Enable "Install from unknown sources" (exact wording varies by Android version)

2. **Install the APK:**
   - Open Downloads app
   - Tap the LearnMate APK
   - Tap "Install"
   - Wait for installation

3. **Open the App:**
   - Should appear on home screen as "LearnMate"
   - Tap to launch

---

## Troubleshooting

### "Install blocked"
- Settings > Apps > Special app access > Install unknown apps
- Enable it for your file manager/Downloads app

### "App not installed"
- Make sure you downloaded the ARM64 version (not x86)
- Try downloading again and reinstalling

### App crashes on startup
- Make sure you're using the correct APK version
- Clear cache: Settings > Apps > LearnMate > Storage > Clear Cache

---

## My Recommendation:

Use **Method 1 (EAS Build)** - it's the most reliable and handles everything automatically!

