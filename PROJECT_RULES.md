# PROJECT RULES — MAWAQEET (مَواقيت) v3.0.4

These governance rules are mandatory across all Native Android Kotlin modules and companion documentation in this repository.

## 1. Fixed Geography & Astronomical Method
- **Single City Lock**: Kafr El-Sheikh, Egypt ONLY (`Latitude = 31.1107° N`, `Longitude = 30.9398° E`).
- **Zero Location Permissions**: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`, GPS, Wi-Fi/cell location, and city selectors are strictly forbidden.
- **No Travel Mode / Geographical Info Notice (Section 14 Removed)**: Travel mode / geographical alert notices (`Section 14`) MUST remain absent from UI, state, and settings.
- **Fixed Calculation Parameters**:
  - Authority: Egyptian General Authority of Survey (`الهيئة المصرية العامة للمساحة`).
  - Fajr angle: `19.5°`, Isha angle: `17.5°`, Asr factor: `1.0` (Standard / Majority).
  - Sunrise (`الشروق`) is calculated, displayed, and configured for audio alerts separately from Fajr and Dhuhr.
  - Manual minute offsets (`fajrOffset..ishaOffset`) apply **after** astronomical computation.

## 2. Authoritative Manual Seasonal Time Rule
- Users manually choose either **Winter Time (`UTC+2`)** or **Summer Time (`UTC+3`)** **exclusively in Settings (`SettingsScreen`)**.

## 3. Navigation Structure (Strictly 6 Bottom Destinations)
1. `الرئيسية` (`home`)
2. `الصلاة` (`prayers`)
3. `المواعيد` (`appointments` — includes Tasks, Templates, History/Logs, Conflict Detection)
4. `التقويم` (`calendar`)
5. `الأذكار` (`adhkar`)
6. `الإعدادات` (`settings`)

## 4. Notification, Multi-Alert & Independent Audio Governance (v3.0.4)
- Runtime permission (`POST_NOTIFICATIONS` on API 33+), `canScheduleExactAlarms()`, `areNotificationsEnabled()`, and active channel importance checks MUST be refreshed on `ON_RESUME`. Never claim notifications are active when OS permissions block delivery.
- Notification playback goes through single-playback `AlarmSoundService` (with deterministic `AudioFallbackResolver` v4 channels if FGS is blocked or custom audio is missing/unreadable); channels do NOT duplicate `AlarmActivity` sound.
- Every appointment supports **unlimited independent alerts** (`AppointmentAlertEntity`), each with its own enable flag, trigger offset/custom `HH:mm`, and sound config (`adhan_1`, `adhan_2`, `chime_gentle`, `vibrate_only`, `silent`, `custom_file`). Editing or deleting one alert must never overwrite siblings.
- Each prayer (`fajr`, `sunrise`, `dhuhr`, `asr`, `maghrib`, `isha`) and each Adhkar alert category (`morning`, `evening`, `periodic`) persists an independent sound selection connected directly to delivery.

## 5. Room Database & Migration Integrity
- **Never** call `.fallbackToDestructiveMigration()`.
- Current database version: `7` (`MIGRATION_1_2` .. `MIGRATION_6_7`).

## 6. Adhkar Persistence, Verbatim Integrity & Repetition Rule
- Preserve verbatim counts (`25/23/14/4`), default `1` (`default_editable`), Sleep `#8` `33/33/34`, sequential `وَاذْكُرُوا اللَّهَ`, and strict non-fabrication of Surahs `#12`/`#13`.

## 7. Honest Delivery, Signing & Icon Governance
- Use exact user-supplied crescent-mosque-clock official artwork (`ic_launcher*`) without alteration or added text.
- Never embed keystore files or passwords in source or ZIP archives; guard release builds if external signing credentials are missing.
- Never report Gradle compilation, APK builds, or Android device runs as passed when JDK/Android SDK/device tools are absent in the execution container.

## 8. Automatic Project ZIP Delivery Rule
- **Mandatory Post-Edit Delivery**: After every modification requested by the user, automatically rebuild, run Pass One & Pass Two verification on the clean Android Studio project ZIP in `/public/downloads/` (preserving `0755` permissions on `gradlew`, removing stale older ZIPs, and copying to the artifacts directory), verify HTTP `200 OK`, and include the direct clickable ZIP download link, byte size, and SHA-256 checksum directly in the final response without waiting to be asked.

