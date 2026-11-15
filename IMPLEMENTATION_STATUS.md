# IMPLEMENTATION STATUS — MAWAQEET (مَواقيت) v3.0.4

| Subsystem | Source Location | Implementation Status | Runtime Verification Status |
| :--- | :--- | :--- | :--- |
| Gradle Wrapper & Build Config | `gradlew`, `gradlew.bat`, `gradle-wrapper.jar`, `app/build.gradle.kts` | Complete (`Gradle 8.9.0`, top-level KSP, `versionCode=8`, `3.0.4`) | **BLOCKED** locally (no JDK/SDK/Gradle installed in container) |
| DEFECT-01 Fallback Channels | `domain/alarm/AudioFallbackResolver.kt`, `MawaqeetApp.kt` | Complete (`v4` deterministic channels `adhan1`/`adhan2`/`chime`; `v3` retired; `v2` preserved) | **IMPLEMENTED — NOT VERIFIED** on Android OS |
| Bundled & Custom Audio Recovery | `audio/AudioFileManager.kt`, `res/raw/adhan_1.mp3`, `adhan_2.mp3` | Complete (runtime fallback on missing/unreadable/corrupt custom audio) | Assets `PASS — VERIFIED` (`ffprobe`/`ffmpeg`); Android `MediaPlayer` **BLOCKED** |
| Foreground Sound Service | `alarm/AlarmSoundService.kt`, `alarm/AlarmScheduler.kt`, `AlarmActivity.kt` | Complete (`EXTRA_EVENT_KEY` forwarding + deterministic fallback channel logging) | **IMPLEMENTED — NOT VERIFIED** on Android OS |
| Home 3-Card Hero Carousel | `ui/screens/HomeScreen.kt`, `ui/viewmodel/MawaqeetViewModel.kt`, `RecurrenceEngine.kt` | Complete (`HorizontalPager` always starting Card 0, Next Lesson empty state, lifecycle ticker pause) | Web UI `PASS — VERIFIED` (Playwright); Compose runtime **BLOCKED** |
| Adhkar 6-Card Hub Navigation | `ui/screens/AdhkarScreen.kt`, `MainActivity.kt` | Complete (6 category cards first + `BackHandler` + deep-link compatibility) | Web UI `PASS — VERIFIED` (Playwright); Compose runtime **BLOCKED** |
| Settings Telegram & Attribution | `ui/screens/SettingsScreen.kt` | Complete (`«انضم إلينا»` + `https://t.me/Mawaqeet1` + bottom attribution) | Web UI `PASS — VERIFIED` (Playwright); Compose Intent **BLOCKED** |
| Room Entities & Migration v7 | `Entities.kt`, `MawaqeetDatabase.kt`, `BackupManager.kt` | Complete (`v7`, non-destructive `MIGRATION_6_7` indices, Backup `v6`) | Static SQL inspection only; Room migration instrumentation **BLOCKED** |
| Kotlin Unit Tests | `src/test/java/com/mawaqeet/app/V304AuditAndFeaturesTest.kt` | Added v3.0.4 fallback, lesson, and migration tests | Execution **BLOCKED** locally (container lacks JDK/Gradle runtime) |

