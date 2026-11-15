# PROJECT ARCHITECTURE — MAWAQEET (مَواقيت) v3.0.4

## 1. Notification & Audio Architecture (`com.mawaqeet.app`)

### Runtime Permissions & Lifecycle Re-Audit
- **`MainActivity.kt` & `DiagnosticsHelper.kt`**:
  - Requests `Manifest.permission.POST_NOTIFICATIONS` on Android 13+ (`API 33+`) via `ActivityResultContracts.RequestPermission()`.
  - Re-runs `vm.onLifecycleResume()` via `LifecycleEventObserver(ON_RESUME)` and pauses/resumes `vm.setClockTickerActive(...)` on `ON_START`/`ON_STOP` so background ticks and per-second astronomical recalculations stop cleanly.

### Notification Channel Migration (`v1 / v3 -> v4 fallback` in `MawaqeetApp.kt` & `AudioFallbackResolver.kt`)
- Deletes legacy `v1` channels and the retired `mawaqeet_fallback_audible_v3` channel while preserving user-configured `v2` channels.
- Registers 7 active channels:
  - `mawaqeet_prayer_channel_v2` (`IMPORTANCE_HIGH`, `setBypassDnd(true)`)
  - `mawaqeet_lesson_channel_v2` (`IMPORTANCE_HIGH`)
  - `mawaqeet_adhkar_channel_v2` (`IMPORTANCE_HIGH`)
  - `mawaqeet_custom_reminder_channel_v2` (`IMPORTANCE_HIGH`)
  - `mawaqeet_fallback_adhan1_v4` (`IMPORTANCE_HIGH`, `R.raw.adhan_1`)
  - `mawaqeet_fallback_adhan2_v4` (`IMPORTANCE_HIGH`, `R.raw.adhan_2`)
  - `mawaqeet_fallback_chime_v4` (`IMPORTANCE_HIGH`, default gentle notification/alarm ringtone)
- `AudioFallbackResolver` deterministically resolves emergency channels and handles missing/unusable/corrupt custom audio paths safely.

### UI & Navigation Architecture (v3.0.4)
- **`HomeScreen.kt`**: 3-card RTL `HorizontalPager` with non-saved `PagerState(currentPage = 0)` so Card 1 (`اليوم والوقت الحالي`) always opens first, Card 2 shows next lesson (`RecurrenceEngine.getNextUpcomingLesson`) or `"لا توجد دروس قادمة"`, and Card 3 shows Next Prayer countdown.
- **`AdhkarScreen.kt`**: Opens onto the 6 category cards first (`أذكار الصباح`, `أذكار المساء`, `أذكار النوم`, `أذكار الاستيقاظ`, `السبحة`, `الأذكار والتذكيرات`) and transitions into a single selected category with explicit Back button + `BackHandler`.
- **`SettingsScreen.kt`**: Ends with **«انضم إلينا»** (`https://t.me/Mawaqeet1` via safe `Intent.ACTION_VIEW` with `try/catch`) and below it `"أشرف على تصميمه الفقير إلى عفو ربه سفيان بن أحمد"`.

## 2. Database & Migration Architecture (`data/`)
- **Room `version = 7`** with explicit `MIGRATION_1_2 .. MIGRATION_6_7` (zero destructive migration); `MIGRATION_6_7` creates performance indices `idx_appointments_category_startDate` and `idx_dhikr_items_collection_sort`.
- `BackupManager` supports `BACKUP_SCHEMA_VERSION = 6` (`1..6` backwards-compatible).
