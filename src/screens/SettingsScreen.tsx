import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  Clock,
  Download,
  ExternalLink,
  Moon,
  Music,
  Play,
  Sliders,
  Square,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { AudioFileManager } from '../audio/audioManager';
import { useMawaqeet } from '../state/MawaqeetContext';
import type { ThemeMode } from '../types/models';

export const SettingsScreen: React.FC = () => {
  const {
    state,
    notificationPermission,
    requestNotificationPermission,
    setTimeMode,
    updatePrayerConfig,
    importCustomAudioFile,
    deleteCustomAudio,
    triggerAlarm,
    triggerImmediateNotificationTest,
    exportFullBackup,
    restoreFullBackup,
  } = useMawaqeet();

  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const cfg = state.prayerConfig;

  const handleBackupDownload = () => {
    const json = exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mawaqeet-kafr-elsheikh-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
          <Clock className="w-5 h-5 text-[#527D68]" aria-hidden="true" />
          <h2>التوقيت اليدوي لكفر الشيخ</h2>
        </div>
        <p className="text-xs text-[#51665A] dark:text-[#B5C4BC]">
          اختر التوقيت الشتوي أو الصيفي يدوياً، ولا يُعدل التطبيق الساعة من تلقاء نفسه.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTimeMode('winter')}
            className={`min-h-[52px] px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer ${
              cfg.timeMode === 'winter'
                ? 'bg-[#527D68] text-[#F5EBDD] border-[#527D68]'
                : 'border-[#D6C6A8] dark:border-[#3D5546] text-[#34483D] dark:text-[#F5EBDD]'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>التوقيت الشتوي (UTC+2)</span>
          </button>
          <button
            type="button"
            onClick={() => setTimeMode('summer')}
            className={`min-h-[52px] px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer ${
              cfg.timeMode === 'summer'
                ? 'bg-[#527D68] text-[#F5EBDD] border-[#527D68]'
                : 'border-[#D6C6A8] dark:border-[#3D5546] text-[#34483D] dark:text-[#F5EBDD]'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>التوقيت الصيفي (UTC+3)</span>
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
          <Bell className="w-5 h-5 text-[#527D68]" aria-hidden="true" />
          <h2>الإشعارات واختبار المنبه</h2>
        </div>
        <p className="text-xs text-[#51665A] dark:text-[#B5C4BC]">
          حالة إذن إشعارات المتصفح:{' '}
          <strong className="text-[#34483D] dark:text-[#F5EBDD]">
            {notificationPermission === 'granted'
              ? 'ممنوح'
              : notificationPermission === 'denied'
              ? 'مرفوض (ستظهر التنبيهات داخل التطبيق)'
              : notificationPermission === 'default'
              ? 'بانتظار التفعيل'
              : 'غير مدعوم في هذا المتصفح'}
          </strong>
        </p>

        <div className="flex flex-wrap gap-2">
          {notificationPermission !== 'granted' &&
            notificationPermission !== 'unsupported' && (
              <button
                type="button"
                onClick={() => void requestNotificationPermission()}
                className="min-h-[42px] px-4 rounded-xl border border-[#527D68] text-sm font-bold text-[#527D68] dark:text-[#98C4AD] cursor-pointer"
              >
                طلب إذن الإشعارات
              </button>
            )}
          <button
            type="button"
            onClick={triggerImmediateNotificationTest}
            className="min-h-[42px] px-4 rounded-xl bg-[#527D68] hover:bg-[#426956] text-[#F5EBDD] text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <BellRing className="w-4 h-4" />
            <span>إشعار تجريبي الآن</span>
          </button>
          <button
            type="button"
            onClick={() =>
              triggerAlarm({
                title: 'معاينة شاشة منبه الأذان',
                subtitle: 'اختبار الصوت والغفوة والإيقاف — كفر الشيخ',
                eventType: 'prayer',
                soundMode: 'adhan_1',
                scheduledTime: 'الآن',
              })
            }
            className="min-h-[42px] px-4 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-bold cursor-pointer"
          >
            معاينة شاشة المنبه
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
          <Sliders className="w-5 h-5 text-[#527D68]" aria-hidden="true" />
          <h2>المظهر وخيارات الصوت والتقويم</h2>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-[#34483D] dark:text-[#F5EBDD]">المظهر</p>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { mode: 'auto', label: 'تلقائي' },
                { mode: 'light', label: 'نهاري' },
                { mode: 'dark', label: 'ليلي' },
              ] as Array<{ mode: ThemeMode; label: string }>
            ).map(({ mode, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => updatePrayerConfig({ ...cfg, themeMode: mode })}
                className={`min-h-[42px] rounded-xl border text-xs font-bold cursor-pointer ${
                  cfg.themeMode === mode
                    ? 'bg-[#527D68] text-[#F5EBDD] border-[#527D68]'
                    : 'border-[#D6C6A8] dark:border-[#3D5546]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span>حجم الخط</span>
              <span className="font-clock">{Math.round(cfg.fontScale * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.85}
              max={1.3}
              step={0.05}
              value={cfg.fontScale}
              onChange={(e) =>
                updatePrayerConfig({ ...cfg, fontScale: Number(e.target.value) })
              }
              className="w-full accent-[#527D68]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span>تدرج حجم البطاقات</span>
              <span className="font-clock">{Math.round(cfg.cardScale * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.9}
              max={1.2}
              step={0.05}
              value={cfg.cardScale}
              onChange={(e) =>
                updatePrayerConfig({ ...cfg, cardScale: Number(e.target.value) })
              }
              className="w-full accent-[#527D68]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold block">مدة الغفوة الافتراضية</label>
            <select
              value={cfg.defaultSnoozeMinutes}
              onChange={(e) =>
                updatePrayerConfig({
                  ...cfg,
                  defaultSnoozeMinutes: Number(e.target.value),
                })
              }
              className="w-full min-h-[42px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-semibold"
            >
              {[5, 10, 15, 20].map((m) => (
                <option key={m} value={m}>
                  {m} دقائق
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold block">مدة تشغيل صوت التنبيه</label>
            <select
              value={cfg.soundDurationSeconds}
              onChange={(e) =>
                updatePrayerConfig({
                  ...cfg,
                  soundDurationSeconds: Number(e.target.value),
                })
              }
              className="w-full min-h-[42px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-semibold"
            >
              <option value={15}>15 ثانية</option>
              <option value={30}>30 ثانية</option>
              <option value={60}>60 ثانية</option>
              <option value={0}>المقطع كاملاً</option>
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold block">
              تعديل اليوم الهجري (أم القرى): {cfg.hijriDayOffset >= 0 ? `+${cfg.hijriDayOffset}` : cfg.hijriDayOffset} يوم
            </label>
            <div className="flex gap-2">
              {[-2, -1, 0, 1, 2].map((off) => (
                <button
                  key={off}
                  type="button"
                  onClick={() => updatePrayerConfig({ ...cfg, hijriDayOffset: off })}
                  className={`flex-1 min-h-[38px] rounded-xl border text-xs font-clock font-bold cursor-pointer ${
                    cfg.hijriDayOffset === off
                      ? 'bg-[#527D68] text-[#F5EBDD] border-[#527D68]'
                      : 'border-[#D6C6A8] dark:border-[#3D5546]'
                  }`}
                >
                  {off > 0 ? `+${off}` : off}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
            <Music className="w-5 h-5 text-[#527D68]" aria-hidden="true" />
            <h2>مكتبة الأصوات المخصصة ({state.customAudioFiles.length})</h2>
          </div>

          <label className="min-h-[40px] px-4 rounded-xl bg-[#527D68] text-[#F5EBDD] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>استيراد ملف صوتي</span>
            <input
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) await importCustomAudioFile(f);
              }}
            />
          </label>
        </div>

        {state.customAudioFiles.length === 0 ? (
          <p className="text-xs text-[#51665A] dark:text-[#B5C4BC]">
            لم تقم باستيراد ملفات صوتية مخصصة بعد.
          </p>
        ) : (
          <div className="space-y-2">
            {state.customAudioFiles.map((audio) => (
              <div
                key={audio.id}
                className="rounded-xl bg-[#F5EBDD]/60 dark:bg-[#1E2B24] px-3.5 py-2.5 flex items-center justify-between gap-2"
              >
                <span className="text-sm font-semibold truncate">{audio.name}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (playingAudioId === audio.id) {
                        AudioFileManager.stopAudio();
                        setPlayingAudioId(null);
                      } else {
                        setPlayingAudioId(audio.id);
                        AudioFileManager.playForSoundMode({
                          soundMode: 'custom_file',
                          customAudioPath: audio.internalFilePath,
                          customAudioFiles: state.customAudioFiles,
                          durationSeconds: cfg.soundDurationSeconds,
                          onCompletion: () => setPlayingAudioId(null),
                        });
                      }
                    }}
                    className="min-w-[36px] min-h-[36px] rounded-lg border border-[#D6C6A8] dark:border-[#3D5546] flex items-center justify-center cursor-pointer"
                    aria-label="تشغيل"
                  >
                    {playingAudioId === audio.id ? (
                      <Square className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCustomAudio(audio)}
                    className="min-w-[36px] min-h-[36px] rounded-lg text-[#B0413E] flex items-center justify-center cursor-pointer"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-3">
        <h2 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
          النسخ الاحتياطي والاستعادة (JSON)
        </h2>
        <p className="text-xs text-[#51665A] dark:text-[#B5C4BC]">
          احفظ نسخة احتياطية كاملة للإعدادات والمواعيد والأذكار والسبحة واسترجعها بأمان في أي وقت.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleBackupDownload}
            className="min-h-[42px] px-4 rounded-xl bg-[#527D68] hover:bg-[#426956] text-[#F5EBDD] text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة احتياطية</span>
          </button>

          <label className="min-h-[42px] px-4 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-bold inline-flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>استعادة من ملف JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (!f) return;
                const txt = await f.text();
                restoreFullBackup(txt);
              }}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl bg-[#34483D] dark:bg-[#2F4237] text-[#F5EBDD] p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">مَواقيت — الإصدار 3.0.4</h2>
            <p className="text-xs text-[#D6C6A8] mt-0.5">
              مواقيت كفر الشيخ · الهيئة المصرية العامة للمساحة · بدون أي إعلانات أو تتبع
            </p>
          </div>
          <a
            href="https://t.me/Mawaqeet1"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[42px] px-4 rounded-xl bg-[#D6C6A8] text-[#34483D] text-sm font-bold inline-flex items-center gap-2"
          >
            <span>«انضم إلينا»</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <p className="text-sm text-[#F5EBDD]/90 pt-2 border-t border-[#D6C6A8]/20">
          أشرف على تصميمه الفقير إلى عفو ربه سفيان بن أحمد
        </p>
      </section>
    </div>
  );
};
