import React, { useMemo, useState } from 'react';
import {
  Compass,
  Minus,
  Music,
  Play,
  Plus,
  RotateCcw,
  Square,
  Upload,
} from 'lucide-react';
import { AudioFileManager } from '../audio/audioManager';
import {
  calculateKafrElSheikhQibla,
  PRAYER_NAMES_AR,
} from '../domain/prayerCalculator';
import { useMawaqeet } from '../state/MawaqeetContext';
import type { PrayerAlertRuleEntity, PrayerKey, SoundMode } from '../types/models';

export const PrayerScreen: React.FC = () => {
  const {
    state,
    clock,
    adjustPrayerOffset,
    resetAllPrayerOffsets,
    updatePrayerRule,
    importCustomAudioFile,
  } = useMawaqeet();

  const [editingPrayer, setEditingPrayer] = useState<PrayerKey | null>(null);
  const [previewingKey, setPreviewingKey] = useState<PrayerKey | null>(null);

  const qiblaBearing = useMemo(() => calculateKafrElSheikhQibla(), []);

  const formatSoundLabel = (mode: SoundMode, customPath?: string | null): string => {
    switch (mode) {
      case 'adhan_1':
        return 'أذان 1 (العفاسي)';
      case 'adhan_2':
        return 'أذان 2';
      case 'chime_gentle':
        return 'نغمة هادئة';
      case 'vibrate_only':
        return 'اهتزاز فقط';
      case 'silent':
        return 'صامت';
      case 'custom_file': {
        const matched = state.customAudioFiles.find(
          (a) => a.internalFilePath === customPath
        );
        return matched ? `مخصص: ${matched.name}` : 'صوت مخصص';
      }
      default:
        return mode;
    }
  };

  const prayers: Array<{ key: PrayerKey; name: string; offset: number }> = [
    { key: 'fajr', name: 'الفجر', offset: state.prayerConfig.fajrOffset },
    {
      key: 'sunrise',
      name: 'الشروق (منفصل عن الفروض)',
      offset: state.prayerConfig.sunriseOffset,
    },
    { key: 'dhuhr', name: 'الظهر', offset: state.prayerConfig.dhuhrOffset },
    { key: 'asr', name: 'العصر', offset: state.prayerConfig.asrOffset },
    { key: 'maghrib', name: 'المغرب', offset: state.prayerConfig.maghribOffset },
    { key: 'isha', name: 'العشاء', offset: state.prayerConfig.ishaOffset },
  ];

  const rulesByKey = new Map(state.prayerRules.map((r) => [r.prayerKey, r]));

  const togglePreview = (key: PrayerKey, rule: PrayerAlertRuleEntity) => {
    if (previewingKey === key) {
      AudioFileManager.stopAudio();
      setPreviewingKey(null);
      return;
    }
    setPreviewingKey(key);
    AudioFileManager.playForSoundMode({
      soundMode: rule.soundMode,
      customAudioPath: rule.customAudioPath,
      customAudioFiles: state.customAudioFiles,
      durationSeconds: state.prayerConfig.soundDurationSeconds,
      onCompletion: () => setPreviewingKey(null),
    });
  };

  const editingRule = editingPrayer ? rulesByKey.get(editingPrayer) : null;

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#34483D] dark:text-[#F5EBDD]">
              مواقيت كفر الشيخ
            </h1>
            <p className="text-xs text-[#51665A] dark:text-[#B5C4BC] mt-0.5">
              الهيئة المصرية العامة للمساحة (19.5° فجر · 17.5° عشاء · العصر: الجمهور)
            </p>
          </div>
          <button
            type="button"
            onClick={resetAllPrayerOffsets}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-semibold text-[#34483D] dark:text-[#F5EBDD] hover:bg-[#EADCC8]/50 dark:hover:bg-[#2F4237] inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>إعادة للأصل</span>
          </button>
        </div>
        <p className="text-xs font-semibold text-[#527D68] dark:text-[#98C4AD]">
          التوقيت المطبق حالياً:{' '}
          {state.prayerConfig.timeMode === 'summer'
            ? 'الصيفي (UTC+3)'
            : 'الشتوي (UTC+2)'}{' '}
          — كل صلاة تمتلك صوت أذان وإزاحة مستقلة.
        </p>
      </section>

      {/* Prayer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prayers.map(({ key, name, offset }) => {
          const timeStr = clock.todayPrayers.formattedTimes[key] ?? '--:--';
          const isNext = clock.nextPrayer.nextPrayerKey === key;
          const defaultMode: SoundMode =
            key === 'sunrise' ? 'chime_gentle' : key === 'fajr' ? 'adhan_1' : 'adhan_2';
          const rule: PrayerAlertRuleEntity = rulesByKey.get(key) ?? {
            id: 0,
            prayerKey: key,
            alertType: 'at_time',
            minutesOffset: 0,
            soundMode: defaultMode,
            isVibrationEnabled: true,
            isEnabled: key !== 'sunrise',
          };
          const isPreviewing = previewingKey === key;

          return (
            <article
              key={key}
              className={`rounded-2xl p-5 border space-y-4 ${
                isNext
                  ? 'bg-[#34483D] dark:bg-[#2F4237] text-[#F5EBDD] border-[#527D68]'
                  : 'bg-[#FBF6EE] dark:bg-[#27382E] border-[#D6C6A8] dark:border-[#3D5546]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold">{name}</h2>
                  <p
                    className={`font-clock text-2xl font-bold mt-1 ${
                      isNext ? 'text-[#D6C6A8]' : 'text-[#527D68] dark:text-[#98C4AD]'
                    }`}
                  >
                    {timeStr}
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <span>{rule.isEnabled ? 'التنبيه مفعل' : 'صامت'}</span>
                  <input
                    type="checkbox"
                    checked={rule.isEnabled}
                    onChange={(e) =>
                      updatePrayerRule({ ...rule, isEnabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#527D68]"
                  />
                </label>
              </div>

              {/* Offset Controls */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-current/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustPrayerOffset(key, -1)}
                    aria-label={`إنقاص دقيقة لـ ${name}`}
                    className="min-w-[38px] min-h-[38px] rounded-xl border border-current/25 flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-clock text-xs font-bold min-w-[64px] text-center">
                    {offset > 0 ? `+${offset}` : offset} د
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustPrayerOffset(key, 1)}
                    aria-label={`زيادة دقيقة لـ ${name}`}
                    className="min-w-[38px] min-h-[38px] rounded-xl border border-current/25 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => togglePreview(key, rule)}
                    className="min-h-[38px] px-3 rounded-xl border border-current/25 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    {isPreviewing ? (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>إيقاف</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>معاينة</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingPrayer(key)}
                    className="min-h-[38px] px-3 rounded-xl bg-[#527D68] text-[#F5EBDD] text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>{formatSoundLabel(rule.soundMode, rule.customAudioPath)}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Kafr El-Sheikh Qibla Card */}
      <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
            <Compass className="w-5 h-5 text-[#527D68]" aria-hidden="true" />
            <h2>اتجاه القبلة لمدينة كفر الشيخ</h2>
          </div>
          <p className="text-sm text-[#51665A] dark:text-[#B5C4BC]">
            الزاوية الفلكية نحو الكعبة المشرفة: الجنوب الشرقي
          </p>
        </div>
        <div className="font-clock text-2xl font-bold text-[#527D68] dark:text-[#98C4AD]">
          {qiblaBearing.toFixed(1)}°
        </div>
      </section>

      {/* Sound Customization Modal */}
      {editingPrayer && editingRule && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-3xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#34483D] dark:text-[#F5EBDD]">
              تخصيص صوت {PRAYER_NAMES_AR[editingPrayer]}
            </h3>

            <div className="space-y-2">
              {(
                [
                  { mode: 'adhan_1', label: 'أذان 1 (العفاسي)' },
                  { mode: 'adhan_2', label: 'أذان 2' },
                  { mode: 'chime_gentle', label: 'نغمة هادئة' },
                  { mode: 'vibrate_only', label: 'اهتزاز فقط' },
                  { mode: 'silent', label: 'صامت' },
                ] as Array<{ mode: SoundMode; label: string }>
              ).map(({ mode, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    updatePrayerRule({ ...editingRule, soundMode: mode });
                    setEditingPrayer(null);
                  }}
                  className={`w-full min-h-[44px] px-4 rounded-xl border text-right text-sm font-bold cursor-pointer ${
                    editingRule.soundMode === mode
                      ? 'bg-[#527D68] text-[#F5EBDD] border-[#527D68]'
                      : 'border-[#D6C6A8] dark:border-[#3D5546]'
                  }`}
                >
                  {label}
                </button>
              ))}

              <label className="w-full min-h-[44px] px-4 rounded-xl border border-dashed border-[#527D68] text-sm font-bold flex items-center justify-center gap-2 cursor-pointer text-[#527D68] dark:text-[#98C4AD]">
                <Upload className="w-4 h-4" />
                <span>اختيار ملف صوتي مخصص من جهازك</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="sr-only"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (!f) return;
                    const path = await importCustomAudioFile(f);
                    if (path) {
                      updatePrayerRule({
                        ...editingRule,
                        soundMode: 'custom_file',
                        customAudioPath: path,
                      });
                      setEditingPrayer(null);
                    }
                  }}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => setEditingPrayer(null)}
              className="w-full min-h-[42px] rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-semibold cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
