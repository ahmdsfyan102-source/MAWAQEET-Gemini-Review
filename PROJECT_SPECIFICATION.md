# PROJECT SPECIFICATION — MAWAQEET (مَواقيت) v3.0.4

## Overview
**مَواقيت (MAWAQEET)** (`com.mawaqeet.app`, `versionCode = 8`, `versionName = "3.0.4"`) is an offline-first Native Android application (`Kotlin` + `Jetpack Compose` + `Room v7` + `AlarmManager` + `AlarmSoundService` + `Glance/AppWidget`) built exclusively for **Kafr El-Sheikh, Egypt**.

## Core Specifications (v3.0.4 Updates)

### A. Home & Top App Bar (`HomeScreen`, `MainActivity`)
- Clean brand header `"مَواقيت"` without exposed raw coordinates or UTC timezone/DST pills.
- Top Hero area houses a **three-card RTL horizontal swipe carousel** (`HorizontalPager`) with **3 position indicator dots**, strictly starting on **Card 1** whenever the app opens:
  1. **Card 1 (Default)**: Today & Current Time (Gregorian, Hijri, Kafr El-Sheikh local time, mode label).
  2. **Card 2**: Next Lesson (`category == "lesson"`) with date, start time, and live countdown; or exact `"لا توجد دروس قادمة"` when none exist.
  3. **Card 3**: Next Prayer countdown & progress bar.
- Followed by the 6 daily prayer times, Adhkar & next appointment cards, and today's tasks.

### B. Prayers (`PrayerScreen`) — Bundled Adhan 1 & 2 + Per-Prayer Independence
- Egyptian Survey Authority calculation (`31.1107° N, 30.9398° E`, `19.5°/17.5°`, Asr factor `1.0`).
- Independent minute offsets, enable switches, and sound modes (`adhan_1`, `adhan_2`, `chime_gentle`, `vibrate_only`, `silent`, `custom_file`) across all 5 prayers + Sunrise.

### C. Appointments (`AppointmentsScreen`) — Multiple Independent Alerts
- **4 Internal Sections**: `المواعيد والدروس`, `المهام اليومية`, `النماذج الجاهزة`, `السجل والتوثيق`.
- Unlimited per-appointment independent alerts with collision-free scheduling.

### D. Calendar (`CalendarScreen`)
- Monthly, Weekly, and Daily views synchronized with Umm al-Qura Hijri dates, appointments, tasks, and quick notes.

### E. Adhkar (`AdhkarScreen`) — Six Category Cards First
- Opens to **six styled category cards only**: `أذكار الصباح`, `أذكار المساء`, `أذكار النوم`, `أذكار الاستيقاظ`, `السبحة`, `الأذكار والتذكيرات`.
- Tapping a card opens only that category with clear Back navigation (`BackHandler` + top bar button); notification deep links jump directly to the target section and return cleanly to the 6-card hub.

### F. Settings (`SettingsScreen`) — Clean User Controls + «انضم إلينا» + Attribution
- Manual Winter (`UTC+2`) / Summer (`UTC+3`) selector, Permission audit + live test, Theme/Font/Card scaling, Snooze & Sound duration, Custom Audio manager, About card (`3.0.4`).
- Bottom section **«انضم إلينا»** opening `https://t.me/Mawaqeet1` safely, and below it at the very bottom: `أشرف على تصميمه الفقير إلى عفو ربه سفيان بن أحمد`.
