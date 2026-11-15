# ZIP DELIVERY POLICY — MAWAQEET (مَواقيت) v3.0.3

## Single Source of Truth & Binary-Safe Packaging
1. **Authoritative Source Directory**: `/android/` on disk is the sole canonical Android Studio project root.
2. **Bundled Binary Assets**: `gradle/wrapper/gradle-wrapper.jar`, `res/mipmap-*`, `res/drawable-nodpi/ic_launcher_foreground.png`, `res/raw/adhan_1.mp3`, and `res/raw/adhan_2.mp3` are packaged binary-verbatim with SHA-256 verification.
3. **Pre-Delivery Automated Integrity Verification**: Before finalizing the v3.0.3 ZIP archive (`MAWAQEET_Android_Project_v3.0.3_2026-11-13.zip`), automated Pass One & Pass Two checks verify:
   - Exact file count and byte parity between the extracted ZIP and `/android/`.
   - `zip.testzip() is None` archive integrity pass.
   - `gradle/wrapper/gradle-wrapper.jar`, `gradlew` (`0755` POSIX executable mode), and `gradlew.bat` belong to official Gradle 8.9.0 and invoke `org.gradle.wrapper.GradleWrapperMain` via `-classpath`.
   - `app/build.gradle.kts` places `ksp { arg("room.schemaLocation", ...) }` at top-level and sets `versionCode = 7`, `versionName = "3.0.3"`.
   - Every `<activity>`, `<receiver>`, `<service>`, and `@raw`/`@drawable`/`@mipmap`/`@layout`/`@xml` resource resolves to an actual file.
   - `MawaqeetDatabase.kt` preserves `version = 6`, `MIGRATION_5_6`, and zero calls to `fallbackToDestructiveMigration`.
   - Zero private keystores (`*.jks`, `*.keystore`, `keystore.properties`) exist in `/android/` or the ZIP.
   - Zero removed UI sections remain visible in `MainActivity.kt` or `SettingsScreen.kt` (JSON Backup card, Self-Diagnostics card, TopBar coordinates/timezone/UTC pills, Section 14 Travel Mode).
4. **Release Archive Filename**:
   - `MAWAQEET_Android_Project_v3.0.3_2026-11-13.zip`

