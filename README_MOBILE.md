# Ryha Admin Mobile App Build Guide

The Android project for the Ryha Admin Panel has been successfully initialized in the `frontend/android` directory. The application logic has been updated to automatically redirect native mobile users to the Admin Dashboard.

## Prerequisites
To generate the APK file, you must have the **Android Development Environment** installed on your machine.
1. **Java Development Kit (JDK) 11 or 17**: [Download Here](https://adoptium.net/)
2. **Android Studio**: [Download Here](https://developer.android.com/studio)

## How to Build the APK
Since the Android SDK was not detected in the standard location on your system, you will need to perform the build using Android Studio (which will automatically set up the SDK for you).

1. **Open Android Studio**.
2. Select **Open** and navigate to:
   `C:\Users\vellu\ryhatechnologies-landing-page\frontend\android`
3. Wait for Android Studio to sync the project and download necessary Gradle dependencies/SDK tools.
4. Once synced, go to the top menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. The APK will be generated in `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.

## Updating the App
If you make changes to the React frontend, run these commands to update the mobile project:
```bash
cd frontend
npm run build
npx cap sync android
```
Then rebuild the APK in Android Studio.
