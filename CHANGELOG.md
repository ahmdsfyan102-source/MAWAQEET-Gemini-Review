# CHANGELOG — MAWAQEET (مَواقيت)

## [3.0.4] — 2026-11-13
### Fixed & Added
- **DEFECT-01 Fix — Deterministic Audio & Emergency Channel Fallback (`AudioFallbackResolver.kt`, `MawaqeetApp.kt`, `AudioFileManager.kt`, `AlarmSoundService.kt`, `AlarmScheduler.kt`, `AlarmActivity.kt`)**:
  - Replaced single hardcoded `mawaqeet_fallback_audible_v3` fallback channel with 3 deterministic v4 channels: `mawaqeet_fallback_adhan1_v4` (`R.raw.adhan_1`), `mawaqeet_fallback_adhan2_v4` (`R.raw.adhan_2`), and `mawaqeet_fallback_chime_v4` (gentle notification/alarm alert tone).
  - Safely handles missing, unreadable, or decode-failed `custom_file` paths by logging a localized warning and falling back deterministically by context without losing alert sound.
  - Preserves existing user notification settings on `v2` primary channels and silences legacy `v3` channel cleanly.
- **Home Screen Three-Card Carousel (`HomeScreen.kt`, `MawaqeetViewModel.kt`, `MainActivity.kt`, `RecurrenceEngine.kt`)**:
  - Replaced top hero/date section with a 3-card RTL `HorizontalPager` (non-saved `PagerState` strictly defaulting to Card 1 on every launch and process recreation) plus 3 position dots below: (1) Today & Current Time, (2) Next Lesson (`RecurrenceEngine.getNextUpcomingLesson`) or exact `"لا توجد دروس قادمة"`, (3) Next Prayer Countdown.
  - Added lifecycle-aware ticker pausing (`ON_START`/`ON_STOP`) and daily astronomical/Hijri caching so daily calculations are not recomputed every second.
- **Adhkar Six-Card Entry Hub (`AdhkarScreen.kt`, `MainActivity.kt`)**:
  - Adhkar tab opens on the 6 styled category cards (`أذكار الصباح`, `أذكار المساء`, `أذكار النوم`, `أذكار الاستيقاظ`, `السبحة`, `الأذكار والتذكيرات`) and enters only the selected category with prominent Back navigation and hardware `BackHandler` while keeping deep-link support.
- **Settings Bottom Sections (`SettingsScreen.kt`)**:
  - Added **«انضم إلينا»** linking safely to `https://t.me/Mawaqeet1` and placed `"أشرف على تصميمه الفقير إلى عفو ربه سفيان بن أحمد"` strictly below it at the bottom.
- **Database Migration & Versioning (`Entities.kt`, `MawaqeetDatabase.kt`, `BackupManager.kt`, `app/build.gradle.kts`)**:
  - Bumped `versionCode = 8`, `versionName = "3.0.4"`, `Room v7` with non-destructive `MIGRATION_6_7` indices (`idx_appointments_category_startDate`, `idx_dhikr_items_collection_sort`), and Backup schema `v6`.

## [3.0.3] — 2026-11-13
### Fixed & Added
- **Repair 1 — Gradle Wrapper (`gradlew`, `gradlew.bat`, `gradle-wrapper.jar`)**:
  - Replaced wrapper scripts with official Gradle `v8.9.0` UNIX/Windows scripts invoking `org.gradle.wrapper.GradleWrapperMain` via `-classpath "$CLASSPATH"`, preserving `0755` executable mode on `gradlew` and matching `gradle/wrapper/gradle-wrapper.jar` (`43,504` bytes).
- **Repair 2 — KSP & Versioning (`app/build.gradle.kts`)**:
  - Moved `ksp { arg("room.schemaLocation", "$projectDir/schemas") }` out of `defaultConfig` to top-level scope after `android { ... }`; incremented `versionCode = 7`, `versionName = "3.0.3"`.
- **Repair 3 — Complete Quranic Texts (`AdhkarEngine.kt`, `MawaqeetDatabase.kt`)**:
  - Integrated verbatim 30-verse **Surah As-Sajdah (`sleep_12_surah_sajdah`)** starting `الٓمٓ (1)` with `۞` (v11) & `۩` (v15) and 30-verse **Surah Al-Mulk (`sleep_13_surah_mulk`)** starting `تَبَٰرَكَ ٱلَّذِي ... (1)` through `(30)` without HTML/Markdown artifacts.
  - Non-destructive `reconcileWithDefaults()` upgrades v3.0.2 stub entries while preserving user-edited counts (`targetCount`) and progress (`currentCount`).
- **Repair 4 — Bundled Adhan Audio Assets & Per-Prayer Independence (`res/raw/adhan_1.mp3`, `res/raw/adhan_2.mp3`, `AudioFileManager.kt`, `MawaqeetApp.kt`, `MawaqeetDatabase.kt`, `PrayerScreen.kt`, `AppointmentsScreen.kt`, `AdhkarScreen.kt`, `AlarmSoundService.kt`, `BackupManager.kt`)**:
  - Packaged both user-supplied MP3 assets inside `res/raw/` (`adhan_1.mp3`, `adhan_2.mp3`) for 100% offline playback via `MediaPlayer.setDataSource(AssetFileDescriptor)`.
  - Assigned `adhan_1` as default for Fajr and `adhan_2` as default for Dhuhr, Asr, Maghrib, and Isha (`chime_gentle` for Sunrise), with transparent upgrade of legacy `"adhan_full"` records and fallback channel upgrade to `mawaqeet_fallback_audible_v3`.
- **Repairs 5 & 6 — UI Cleanup (`MainActivity.kt`, `SettingsScreen.kt`)**:
  - Removed coordinates, timezone (`UTC+2/UTC+3`), and Egyptian Survey chips from TopBar; removed JSON Backup/Restore card and Self-Diagnostics card from `SettingsScreen` UI while keeping internal calculation, DB v6, notifications, multi-alerts, and backup logic intact.

## [3.0.2] — 2026-11-12
### Fixed & Added
- **End-to-End Android Notification System Repair (`MawaqeetApp.kt`, `AlarmSoundService.kt`, `AlarmScheduler.kt`, `Receivers.kt`, `DiagnosticsHelper.kt`, `MainActivity.kt`, `AlarmActivity.kt`, `AndroidManifest.xml`)**:
  - Added runtime `POST_NOTIFICATIONS` request/rationale flow (Android 13+), `canScheduleExactAlarms()` handling, `canUseFullScreenIntent()` check, per-channel importance verification across `v2` channels, and `ON_RESUME` permission refresh banner with direct System Settings intents.
  - Migrated legacy muted `v1` notification channels to active `v2` channels (`mawaqeet_*_channel_v2` + `mawaqeet_fallback_audible_v2`).
  - Introduced `AlarmSoundService` (`foregroundServiceType="mediaPlayback"`) as the single authoritative playback + high-priority notification host, preventing silent background drops and preventing duplicate audio between notification channels and `AlarmActivity`.
  - Added `NotificationSchedulePlanner` to schedule exact independent alarms across multiple alerts and upcoming recurrences with collision-free `requestCode` derivation (`buildAlertRequestCode`) and clean obsolete cancellation via tracked `SharedPreferences` registry.
- **Multiple Independent Alerts Per Appointment (`Entities.kt`, `MawaqeetDao.kt`, `MawaqeetViewModel.kt`, `AppointmentsScreen.kt`)**:
  - Replaced single-alert limitation with unlimited per-appointment independent alerts inside the Add/Edit Appointment modal (`إضافة تنبيه جديد`).
  - Each alert supports enable toggle, individual delete (without disturbing siblings), preset offsets (`0, -5, -10, -15, -30, -60, -120, -1440`), custom offsets, or custom fixed `HH:mm` time, recurrence compatibility, and transactional persistence (`saveAppointmentWithAlerts`).
- **Independent Audio Configuration & Resource Reliability (`AudioFileManager.kt`, `PrayerScreen.kt`, `AppointmentsScreen.kt`, `AdhkarScreen.kt`)**:
  - Connected independent per-alert sound selection directly inside each Appointment Alert card, independent per-prayer + separate Sunrise sound selection in `PrayerScreen`, and independent Morning/Evening/Periodic sounds in `AdhkarScreen`.
  - Added SAF `OpenDocument` inline audio import, MIME/stream size validation, `AudioManager` focus management, `MediaPlayer` leak prevention, single-preview-at-a-time enforcement, Stop Preview, Restore Default, and missing audio file fallback logging.
- **Database Migration `v5 -> v6` & Backup Schema `v5` (`MawaqeetDatabase.kt`, `BackupManager.kt`)**:
  - Added non-destructive `MIGRATION_5_6` extending `appointment_alerts` and `adhkar_settings` and safely backfilling an `AppointmentAlertEntity` for legacy appointments that lacked one without erasing any user data or Adhkar progress.
  - Upgraded `BackupManager` to `BACKUP_SCHEMA_VERSION = 5` (`appVersion = "3.0.2"`).
- **Settings Section 14 Removal (`SettingsScreen.kt`)**:
  - Completely removed **"Travel Mode and Geographical Information Alert (Section 14)"** (`معلومات التطبيق وإشعار السفر`) while preserving all approved Kafr El-Sheikh fixed settings, diagnostics, backup/restore, and appearance controls.
- **Official App Icon Integration (`res/mipmap-*`, `res/drawable-nodpi/ic_launcher_foreground.png`, `res/drawable/ic_launcher_background.xml`, `res/drawable/ic_notification_mawaqeet.xml`)**:
  - Generated adaptive, legacy, and round launcher assets directly from the official user-supplied crescent-mosque-clock PNG without redesigning or adding text, paired with monochrome status-bar vector icon `ic_notification_mawaqeet.xml`.
- **Tests (`NotificationAndBackupV302Test.kt`)**:
  - Added JVM unit tests for 3-alert scheduling isolation, single alert removal, recurring cancelled-date exclusion, 6-prayer audio independence, and Backup v5 schema validation.

## [3.0.1] — 2026-11-12
### Added & Changed
- Complete verbatim Adhkar catalog (`25/23/14/4`), Part 19.1 repetition default (`1`, `countOrigin = "default_editable"`), Sleep `#8` (`33/33/34`) grouped counters, `MIGRATION_4_5`, Backup schema v4, genuine Gradle 8.9.0 wrapper JAR, and release signing hardening.

## [3.0.0] — 2026-11-12
### Added
- Initial full Jetpack Compose native rebuild with Adhkar/Tasbeeh, Migrations v1 -> v4, Widget, Receivers, and Unit tests.
