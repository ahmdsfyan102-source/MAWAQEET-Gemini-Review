# KNOWN ISSUES & ENVIRONMENT LIMITATIONS — MAWAQEET (مَواقيت) v3.0.4

## 1. Environment & Build Verification Limitations (Honest Disclosure)
- **No Local Android SDK / JDK / Gradle / Emulator (`BLOCKED`)**: This workspace executes inside a Linux/Node.js cloud container without `java`, `javac`, `kotlinc`, `gradle`, `adb`, or an Android emulator. Consequently:
  - `./gradlew --version`, `./gradlew testDebugUnitTest`, `./gradlew assembleDebug`, `./gradlew lint`, Room schema compilation, and Android `connectedAndroidTest` could **NOT** be executed in this container (`BLOCKED`).
  - Real Android OS runtime delivery of notifications, lockscreen full-screen alarms, and Android `MediaPlayer` playback are **IMPLEMENTED — NOT VERIFIED** on device until built and run in Android Studio or on an Android device.
- **Gradle Wrapper Fixed & Included**: Official Gradle `8.9.0` wrapper scripts (`gradlew` with mode `0755`, `gradlew.bat`) and `gradle/wrapper/gradle-wrapper.jar` (`43,504` bytes) are packaged inside the ZIP.
- **Release Signing Requires User Keystore**: `app/build.gradle.kts` guards `assembleRelease`/`bundleRelease` so builds fail explicitly if external `keystore.properties` or `MAWAQEET_KEYSTORE_*` environment variables are absent.

## 2. Content, Audio Fallback & Database Notes (v3.0.4)
- **DEFECT-01 Fixed in Code**: `AudioFallbackResolver` and three deterministic `v4` channels (`mawaqeet_fallback_adhan1_v4`, `mawaqeet_fallback_adhan2_v4`, `mawaqeet_fallback_chime_v4`) replace the single hardcoded `v3` channel (`mawaqeet_fallback_audible_v3`). Runtime behavior on Android OS awaits device verification (`IMPLEMENTED — NOT VERIFIED`).
- **Database Upgrade (`v6 -> v7`)**: `MawaqeetDatabase` defines explicit `MIGRATION_6_7` indices without destructive fallback; live SQLite schema migration test requires Android runtime (`BLOCKED`).

## 3. Android OS Restrictions
- **User Force-Stop**: When a user explicitly force-stops an app in Android System Settings, Android suspends alarms until the user next opens the app (standard Android platform security).
- **Do Not Disturb & Silent Mode**: Notification/alarm channels declare `USAGE_ALARM` and `setBypassDnd(true)` on prayer alerts where supported, but device OEM mute switches or strict DND rules still apply per Android OS policy.
- **OEM Background Restrictions**: Xiaomi, Oppo, Vivo, Realme, Samsung, and Huawei battery savers may delay background alarms until battery optimization is exempted.
- **Android 14+ Full-Screen Intent**: Requires user permission on some non-alarm apps; `AlarmSoundService` gracefully falls back to high-priority heads-up notifications on the context-matched `v4` fallback channel without crashing or duplicating audio.
