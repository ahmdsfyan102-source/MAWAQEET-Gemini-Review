import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Download,
  Edit3,
  Eye,
  EyeOff,
  Moon,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Square,
  Sun,
  Sunrise,
  Trash2,
  Upload,
} from 'lucide-react';
import { AudioFileManager } from '../audio/audioManager';
import {
  APPROVED_INTERVAL_MINUTES,
  parseSubCounters,
  TASBEEH_PRESETS,
} from '../domain/adhkarData';
import { activeVisibleCards } from '../domain/adhkarEngine';
import { useMawaqeet } from '../state/MawaqeetContext';
import type {
  AdhkarCollectionType,
  CustomDhikrReminderEntity,
  DhikrItemEntity,
  SoundMode,
} from '../types/models';

const COLLECTION_TITLES: Record<AdhkarCollectionType, string> = {
  morning: 'أذكار الصباح',
  evening: 'أذكار المساء',
  sleep: 'أذكار النوم',
  wakeup: 'أذكار الاستيقاظ',
};

const SECTION_COLLECTIONS: AdhkarCollectionType[] = [
  'morning',
  'evening',
  'sleep',
  'wakeup',
];

export const AdhkarScreen: React.FC = () => {
  const {
    state,
    adhkarDeepLinkSection,
    clearAdhkarDeepLink,
    tapDhikrCard,
    switchDhikrAlternativeCount,
    resetAdhkarCollection,
    saveDhikrItem,
    deleteDhikrItem,
    toggleHideDhikr,
    restoreHiddenInCollection,
    moveDhikrOrder,
    importAdhkarJson,
    incrementTasbeeh,
    resetTasbeehCounter,
    setTasbeehPhrase,
    saveCustomReminder,
    deleteCustomReminder,
    updateAdhkarSettings,
    importCustomAudioFile,
  } = useMawaqeet();

  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [manageMode, setManageMode] = useState(false);
  const [confirmResetCollection, setConfirmResetCollection] =
    useState<AdhkarCollectionType | null>(null);
  const [confirmResetTasbeeh, setConfirmResetTasbeeh] = useState(false);
  const [expandedLongCards, setExpandedLongCards] = useState<Record<number, boolean>>({});
  const [customPhraseInput, setCustomPhraseInput] = useState('');
  const [customGoalInput, setCustomGoalInput] = useState(33);
  const [newReminderText, setNewReminderText] = useState('');
  const [editingReminder, setEditingReminder] = useState<CustomDhikrReminderEntity | null>(null);
  const [previewAudioSlot, setPreviewAudioSlot] = useState<string | null>(null);

  const [dhikrModalOpen, setDhikrModalOpen] = useState(false);
  const [editingDhikr, setEditingDhikr] = useState<DhikrItemEntity | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formText, setFormText] = useState('');
  const [formRef, setFormRef] = useState('');
  const [formInstr, setFormInstr] = useState('');
  const [formTarget, setFormTarget] = useState(1);
  const [formIsQuranic, setFormIsQuranic] = useState(false);

  useEffect(() => {
    if (adhkarDeepLinkSection !== null) {
      setSelectedSection(adhkarDeepLinkSection);
      clearAdhkarDeepLink();
    }
  }, [adhkarDeepLinkSection, clearAdhkarDeepLink]);

  const collectionStats = useMemo(() => {
    const map: Record<AdhkarCollectionType, { active: number; completed: number; total: number }> = {
      morning: { active: 0, completed: 0, total: 0 },
      evening: { active: 0, completed: 0, total: 0 },
      sleep: { active: 0, completed: 0, total: 0 },
      wakeup: { active: 0, completed: 0, total: 0 },
    };
    for (const item of state.dhikrItems) {
      if (item.isHidden) continue;
      const bucket = map[item.collectionType];
      bucket.total += 1;
      if (item.isCompleted) bucket.completed += 1;
      else bucket.active += 1;
    }
    return map;
  }, [state.dhikrItems]);

  const currentCollection: AdhkarCollectionType | null =
    selectedSection !== null && selectedSection >= 0 && selectedSection <= 3
      ? SECTION_COLLECTIONS[selectedSection]
      : null;

  const currentCollectionAllItems = useMemo(() => {
    if (!currentCollection) return [];
    return state.dhikrItems
      .filter((d) => d.collectionType === currentCollection)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [state.dhikrItems, currentCollection]);

  const currentActiveItems = useMemo(() => {
    if (!currentCollection) return [];
    return activeVisibleCards(state.dhikrItems, currentCollection);
  }, [state.dhikrItems, currentCollection]);

  const openDhikrForm = (item: DhikrItemEntity | null) => {
    setEditingDhikr(item);
    setFormTitle(item?.titleAr ?? '');
    setFormText(item?.textAr ?? '');
    setFormRef(item?.referenceAr ?? '');
    setFormInstr(item?.instructionsAr ?? '');
    setFormTarget(item?.targetCount ?? 1);
    setFormIsQuranic(item?.isQuranic ?? false);
    setDhikrModalOpen(true);
  };

  const toggleSoundPreview = (
    slot: string,
    mode: SoundMode,
    customPath?: string | null
  ) => {
    if (previewAudioSlot === slot) {
      AudioFileManager.stopAudio();
      setPreviewAudioSlot(null);
      return;
    }
    setPreviewAudioSlot(slot);
    AudioFileManager.playForSoundMode({
      soundMode: mode,
      customAudioPath: customPath,
      customAudioFiles: state.customAudioFiles,
      durationSeconds: state.prayerConfig.soundDurationSeconds,
      onCompletion: () => setPreviewAudioSlot(null),
    });
  };

  if (selectedSection === null) {
    const hubCards = [
      {
        index: 0,
        title: 'أذكار الصباح',
        subtitle: `${collectionStats.morning.completed} من ${collectionStats.morning.total} مكتمل`,
        icon: Sun,
      },
      {
        index: 1,
        title: 'أذكار المساء',
        subtitle: `${collectionStats.evening.completed} من ${collectionStats.evening.total} مكتمل`,
        icon: Moon,
      },
      {
        index: 2,
        title: 'أذكار النوم',
        subtitle: `${collectionStats.sleep.completed} من ${collectionStats.sleep.total} مكتمل`,
        icon: BookOpen,
      },
      {
        index: 3,
        title: 'أذكار الاستيقاظ',
        subtitle: `${collectionStats.wakeup.completed} من ${collectionStats.wakeup.total} مكتمل`,
        icon: Sunrise,
      },
      {
        index: 4,
        title: 'السبحة',
        subtitle: `${state.tasbeehState.selectedPhrase} · ${state.tasbeehState.currentCount}`,
        icon: Sparkles,
      },
      {
        index: 5,
        title: 'الأذكار والتذكيرات',
        subtitle: state.adhkarSettings.customReminderEnabled
          ? `التذكير المتتابع مفعل كل ${state.adhkarSettings.intervalMinutes} دقيقة`
          : 'وَاذْكُرُوا اللَّهَ والتنبيهات المجدولة',
        icon: Bell,
      },
    ];

    return (
      <div className="space-y-5">
        <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5">
          <h1 className="text-xl font-bold text-[#34483D] dark:text-[#F5EBDD]">
            الأذكار والتحصين اليومي
          </h1>
          <p className="text-sm text-[#51665A] dark:text-[#B5C4BC] mt-1">
            اختر القسم المطلوب؛ يختفي الذكر تلقائياً بعد إتمام عدده المحدد ويمكن إعادته في أي وقت.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hubCards.map(({ index, title, subtitle, icon: Icon }) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setManageMode(false);
                setSelectedSection(index);
              }}
              className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] hover:border-[#527D68] p-5 text-right flex items-start gap-4 transition cursor-pointer min-h-[120px]"
            >
              <span className="w-11 h-11 rounded-2xl bg-[#527D68]/15 text-[#527D68] dark:text-[#98C4AD] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
                  {title}
                </h2>
                <p className="text-xs text-[#51665A] dark:text-[#B5C4BC] leading-relaxed">
                  {subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            AudioFileManager.stopAudio();
            setPreviewAudioSlot(null);
            setManageMode(false);
            setSelectedSection(null);
          }}
          className="min-h-[44px] px-4 rounded-xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-bold text-[#34483D] dark:text-[#F5EBDD] inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
          <span>العودة لأقسام الأذكار</span>
        </button>

        {currentCollection && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setManageMode((m) => !m)}
              className={`min-h-[42px] px-3.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                manageMode
                  ? 'bg-[#527D68] text-[#F5EBDD] border-[#527D68]'
                  : 'border-[#D6C6A8] dark:border-[#3D5546] text-[#34483D] dark:text-[#F5EBDD]'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>{manageMode ? 'إنهاء الإدارة' : 'إدارة الأذكار'}</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmResetCollection(currentCollection)}
              className="min-h-[42px] px-3.5 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-bold text-[#34483D] dark:text-[#F5EBDD] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة الأذكار</span>
            </button>
          </div>
        )}
      </div>

      {currentCollection && (
        <div className="space-y-4">
          <section className="rounded-2xl bg-[#34483D] dark:bg-[#2F4237] text-[#F5EBDD] p-5 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-lg font-bold">{COLLECTION_TITLES[currentCollection]}</h1>
              <span className="font-clock text-sm font-bold text-[#D6C6A8]">
                {collectionStats[currentCollection].completed} /{' '}
                {collectionStats[currentCollection].total}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#F5EBDD]/20 overflow-hidden">
              <div
                className="h-full bg-[#D6C6A8] transition-all"
                style={{
                  width: `${
                    collectionStats[currentCollection].total > 0
                      ? Math.round(
                          (collectionStats[currentCollection].completed * 100) /
                            collectionStats[currentCollection].total
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </section>

          {manageMode && (
            <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openDhikrForm(null)}
                className="min-h-[40px] px-3.5 rounded-xl bg-[#527D68] text-[#F5EBDD] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة ذكر جديد</span>
              </button>
              <button
                type="button"
                onClick={() => restoreHiddenInCollection(currentCollection)}
                className="min-h-[40px] px-3.5 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-semibold cursor-pointer"
              >
                إظهار جميع الأذكار المخفية
              </button>
              <button
                type="button"
                onClick={() => {
                  const payload = JSON.stringify(
                    { collection: currentCollection, items: currentCollectionAllItems },
                    null,
                    2
                  );
                  const blob = new Blob([payload], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `mawaqeet-${currentCollection}-adhkar.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="min-h-[40px] px-3.5 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير JSON</span>
              </button>
              <label className="min-h-[40px] px-3.5 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>استيراد JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  className="sr-only"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (!f) return;
                    const txt = await f.text();
                    importAdhkarJson(txt);
                  }}
                />
              </label>
            </section>
          )}

          {manageMode ? (
            <div className="space-y-3">
              {currentCollectionAllItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm font-bold text-[#34483D] dark:text-[#F5EBDD]">
                      {item.titleAr} {item.isHidden ? '(مخفي)' : ''}
                    </p>
                    <p className="text-xs text-[#51665A] dark:text-[#B5C4BC] line-clamp-1">
                      {item.textAr}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveDhikrOrder(currentCollectionAllItems, idx, -1)}
                      aria-label="تحريك لأعلى"
                      className="min-w-[36px] min-h-[36px] rounded-lg border border-[#D6C6A8] dark:border-[#3D5546] flex items-center justify-center cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDhikrOrder(currentCollectionAllItems, idx, 1)}
                      aria-label="تحريك لأسفل"
                      className="min-w-[36px] min-h-[36px] rounded-lg border border-[#D6C6A8] dark:border-[#3D5546] flex items-center justify-center cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleHideDhikr(item)}
                      aria-label={item.isHidden ? 'إظهار' : 'إخفاء'}
                      className="min-w-[36px] min-h-[36px] rounded-lg border border-[#D6C6A8] dark:border-[#3D5546] flex items-center justify-center cursor-pointer"
                    >
                      {item.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => openDhikrForm(item)}
                      aria-label="تعديل"
                      className="min-w-[36px] min-h-[36px] rounded-lg border border-[#D6C6A8] dark:border-[#3D5546] flex items-center justify-center cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {item.isUserCustom && (
                      <button
                        type="button"
                        onClick={() => deleteDhikrItem(item)}
                        aria-label="حذف"
                        className="min-w-[36px] min-h-[36px] rounded-lg text-[#B0413E] border border-[#B0413E]/30 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : currentActiveItems.length === 0 ? (
            <div className="rounded-3xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-8 text-center space-y-3">
              <p className="text-lg font-bold text-[#34483D] dark:text-[#F5EBDD]">
                تقبل الله طاعتكم! تم إتمام جميع أذكار هذا القسم.
              </p>
              <button
                type="button"
                onClick={() => setConfirmResetCollection(currentCollection)}
                className="min-h-[44px] px-5 rounded-xl bg-[#527D68] text-[#F5EBDD] text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة أذكار القسم</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentActiveItems.map((item) => {
                const subCounters = parseSubCounters(item.subCountersJson);
                const isLong = item.textAr.length > 340;
                const isExpanded = Boolean(expandedLongCards[item.id]);

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-[#527D68] dark:text-[#98C4AD]">
                          {item.titleAr}
                        </h2>
                        {item.instructionsAr && (
                          <p className="text-xs text-[#51665A] dark:text-[#B5C4BC] mt-0.5">
                            {item.instructionsAr}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {item.alternativeCount !== null &&
                          item.alternativeCount !== undefined && (
                            <button
                              type="button"
                              onClick={() => switchDhikrAlternativeCount(item)}
                              className="min-h-[34px] px-2.5 rounded-lg border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-semibold cursor-pointer"
                            >
                              تبديل التكرار ({item.alternativeCount})
                            </button>
                          )}
                        <span className="font-clock text-sm font-bold px-3 py-1 rounded-xl bg-[#527D68]/15 text-[#34483D] dark:text-[#F5EBDD]">
                          {item.currentCount} / {item.targetCount}
                        </span>
                      </div>
                    </div>

                    <p
                      className={`text-base sm:text-lg leading-loose text-[#34483D] dark:text-[#F5EBDD] ${
                        item.isQuranic ? 'font-quran text-xl' : ''
                      } ${isLong && !isExpanded ? 'line-clamp-5' : ''}`}
                    >
                      {item.textAr}
                    </p>

                    {isLong && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedLongCards((prev) => ({
                            ...prev,
                            [item.id]: !isExpanded,
                          }))
                        }
                        className="text-xs font-bold text-[#527D68] dark:text-[#98C4AD] inline-flex items-center gap-1 cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            <span>طي النص</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            <span>قراءة السورة كاملة</span>
                          </>
                        )}
                      </button>
                    )}

                    {item.referenceAr && (
                      <p className="text-xs text-[#51665A] dark:text-[#B5C4BC]">
                        {item.referenceAr}
                      </p>
                    )}

                    {subCounters.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        {subCounters.map((sub) => {
                          const done = sub.current >= sub.target;
                          return (
                            <button
                              key={sub.key}
                              type="button"
                              disabled={done}
                              onClick={() => tapDhikrCard(item, sub.key)}
                              className={`min-h-[52px] px-3 py-2 rounded-xl border text-sm font-bold flex items-center justify-between cursor-pointer ${
                                done
                                  ? 'bg-[#527D68]/20 border-[#527D68] text-[#527D68] dark:text-[#98C4AD]'
                                  : 'bg-[#527D68] hover:bg-[#426956] text-[#F5EBDD] border-[#527D68]'
                              }`}
                            >
                              <span>{sub.labelAr.replace(/[().]/g, '')}</span>
                              <span className="font-clock">
                                {sub.current}/{sub.target}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => tapDhikrCard(item)}
                        className="w-full min-h-[48px] rounded-xl bg-[#527D68] hover:bg-[#426956] active:scale-[0.99] text-[#F5EBDD] font-bold text-sm flex items-center justify-between px-4 transition cursor-pointer"
                      >
                        <span>تسجيل قراءة ({item.targetCount - item.currentCount} متبقي)</span>
                        <span className="font-clock text-base">
                          {item.currentCount} / {item.targetCount}
                        </span>
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedSection === 4 && (
        <div className="space-y-5">
          <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-3">
            <h1 className="text-lg font-bold text-[#34483D] dark:text-[#F5EBDD]">
              السبحة الإلكترونية
            </h1>
            <div className="flex flex-wrap gap-2">
              {TASBEEH_PRESETS.map((phrase) => {
                const active = state.tasbeehState.selectedPhrase === phrase;
                return (
                  <button
                    key={phrase}
                    type="button"
                    onClick={() => setTasbeehPhrase(phrase, 33)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                      active
                        ? 'bg-[#527D68] text-[#F5EBDD] border-[#527D68]'
                        : 'border-[#D6C6A8] dark:border-[#3D5546]'
                    }`}
                  >
                    {phrase}
                  </button>
                );
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customPhraseInput.trim()) return;
                setTasbeehPhrase(customPhraseInput.trim(), customGoalInput);
                setCustomPhraseInput('');
              }}
              className="flex flex-wrap gap-2 pt-1"
            >
              <input
                type="text"
                value={customPhraseInput}
                onChange={(e) => setCustomPhraseInput(e.target.value)}
                placeholder="أو اكتب ذكراً مخصصاً..."
                className="flex-1 min-w-[180px] min-h-[42px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
              />
              <input
                type="number"
                min={1}
                max={10000}
                value={customGoalInput}
                onChange={(e) => setCustomGoalInput(Number(e.target.value))}
                className="w-24 min-h-[42px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-clock"
              />
              <button
                type="submit"
                className="min-h-[42px] px-4 rounded-xl bg-[#527D68] text-[#F5EBDD] text-xs font-bold cursor-pointer"
              >
                اعتماد
              </button>
            </form>
          </section>

          <button
            type="button"
            onClick={incrementTasbeeh}
            className="w-full min-h-[220px] rounded-3xl bg-[#34483D] dark:bg-[#2F4237] hover:bg-[#3d5447] active:scale-[0.99] text-[#F5EBDD] p-6 flex flex-col items-center justify-center gap-3 border border-[#D6C6A8]/30 transition cursor-pointer"
          >
            <p className="text-lg font-bold text-[#D6C6A8]">
              {state.tasbeehState.selectedPhrase}
            </p>
            <p className="font-clock text-6xl font-bold tabular-nums">
              {state.tasbeehState.currentCount}
            </p>
            <p className="text-xs text-[#F5EBDD]/80">
              اضغط للتسبيح · الهدف الحالي: {state.tasbeehState.targetGoal} · الإجمالي التراكمي:{' '}
              <span className="font-clock">{state.tasbeehState.totalLifetimeCount}</span>
            </p>
          </button>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setConfirmResetTasbeeh(true)}
              className="min-h-[44px] px-5 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>تصفير العداد الحالي</span>
            </button>
          </div>
        </div>
      )}

      {selectedSection === 5 && (
        <div className="space-y-5">
          <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-bold text-[#34483D] dark:text-[#F5EBDD]">
                  التذكير المتتابع «وَاذْكُرُوا اللَّهَ»
                </h1>
                <p className="text-xs text-[#51665A] dark:text-[#B5C4BC]">
                  يعرض أذكار القائمة المفعلة بالتتابع الدائري حسب الفاصل الزمني المحدد.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={state.adhkarSettings.customReminderEnabled}
                onClick={() =>
                  updateAdhkarSettings({
                    ...state.adhkarSettings,
                    customReminderEnabled: !state.adhkarSettings.customReminderEnabled,
                  })
                }
                className={`min-h-[40px] px-4 rounded-xl text-xs font-bold cursor-pointer ${
                  state.adhkarSettings.customReminderEnabled
                    ? 'bg-[#527D68] text-[#F5EBDD]'
                    : 'bg-[#EADCC8] dark:bg-[#1E2B24] text-[#34483D] dark:text-[#F5EBDD]'
                }`}
              >
                {state.adhkarSettings.customReminderEnabled ? 'مفعل' : 'متوقف'}
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-[#34483D] dark:text-[#F5EBDD]">
                الفاصل الزمني (بالدقائق):
              </p>
              <div className="flex flex-wrap gap-2">
                {APPROVED_INTERVAL_MINUTES.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() =>
                      updateAdhkarSettings({
                        ...state.adhkarSettings,
                        intervalMinutes: mins,
                      })
                    }
                    className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold border cursor-pointer ${
                      state.adhkarSettings.intervalMinutes === mins
                        ? 'bg-[#527D68] text-[#F5EBDD] border-[#527D68]'
                        : 'border-[#D6C6A8] dark:border-[#3D5546]'
                    }`}
                  >
                    كل {mins} د
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-[#D6C6A8]/60 dark:border-[#3D5546]">
              <div className="rounded-xl bg-[#F5EBDD]/60 dark:bg-[#1E2B24] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">تنبيه أذكار الصباح</span>
                  <input
                    type="checkbox"
                    checked={state.adhkarSettings.morningNotificationEnabled}
                    onChange={(e) =>
                      updateAdhkarSettings({
                        ...state.adhkarSettings,
                        morningNotificationEnabled: e.target.checked,
                      })
                    }
                  />
                </div>
                <input
                  type="time"
                  value={`${String(state.adhkarSettings.morningHour).padStart(2, '0')}:${String(
                    state.adhkarSettings.morningMinute
                  ).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    updateAdhkarSettings({
                      ...state.adhkarSettings,
                      morningHour: h || 6,
                      morningMinute: m || 0,
                    });
                  }}
                  className="w-full min-h-[36px] px-2 rounded-lg bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-clock"
                />
                <div className="flex gap-1.5">
                  <select
                    value={state.adhkarSettings.morningSoundMode}
                    onChange={(e) =>
                      updateAdhkarSettings({
                        ...state.adhkarSettings,
                        morningSoundMode: e.target.value as SoundMode,
                      })
                    }
                    className="flex-1 min-h-[36px] px-2 rounded-lg bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] text-xs"
                  >
                    <option value="chime_gentle">نغمة هادئة</option>
                    <option value="adhan_1">أذان 1</option>
                    <option value="adhan_2">أذان 2</option>
                    <option value="silent">صامت</option>
                    <option value="custom_file">صوت مخصص</option>
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      toggleSoundPreview(
                        'morning',
                        state.adhkarSettings.morningSoundMode,
                        state.adhkarSettings.morningCustomAudioPath
                      )
                    }
                    aria-label="معاينة صوت الصباح"
                    className="min-w-[36px] min-h-[36px] rounded-lg border border-[#D6C6A8] dark:border-[#3D5546] flex items-center justify-center cursor-pointer"
                  >
                    {previewAudioSlot === 'morning' ? (
                      <Square className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-[#F5EBDD]/60 dark:bg-[#1E2B24] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">تنبيه أذكار المساء</span>
                  <input
                    type="checkbox"
                    checked={state.adhkarSettings.eveningNotificationEnabled}
                    onChange={(e) =>
                      updateAdhkarSettings({
                        ...state.adhkarSettings,
                        eveningNotificationEnabled: e.target.checked,
                      })
                    }
                  />
                </div>
                <input
                  type="time"
                  value={`${String(state.adhkarSettings.eveningHour).padStart(2, '0')}:${String(
                    state.adhkarSettings.eveningMinute
                  ).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    updateAdhkarSettings({
                      ...state.adhkarSettings,
                      eveningHour: h || 17,
                      eveningMinute: m || 0,
                    });
                  }}
                  className="w-full min-h-[36px] px-2 rounded-lg bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-clock"
                />
                <div className="flex gap-1.5">
                  <select
                    value={state.adhkarSettings.eveningSoundMode}
                    onChange={(e) =>
                      updateAdhkarSettings({
                        ...state.adhkarSettings,
                        eveningSoundMode: e.target.value as SoundMode,
                      })
                    }
                    className="flex-1 min-h-[36px] px-2 rounded-lg bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] text-xs"
                  >
                    <option value="chime_gentle">نغمة هادئة</option>
                    <option value="adhan_1">أذان 1</option>
                    <option value="adhan_2">أذان 2</option>
                    <option value="silent">صامت</option>
                    <option value="custom_file">صوت مخصص</option>
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      toggleSoundPreview(
                        'evening',
                        state.adhkarSettings.eveningSoundMode,
                        state.adhkarSettings.eveningCustomAudioPath
                      )
                    }
                    aria-label="معاينة صوت المساء"
                    className="min-w-[36px] min-h-[36px] rounded-lg border border-[#D6C6A8] dark:border-[#3D5546] flex items-center justify-center cursor-pointer"
                  >
                    {previewAudioSlot === 'evening' ? (
                      <Square className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-[#F5EBDD]/60 dark:bg-[#1E2B24] p-3.5 space-y-2">
                <span className="text-xs font-bold block">صوت التذكير المتتابع</span>
                <div className="flex gap-1.5">
                  <select
                    value={state.adhkarSettings.periodicSoundMode}
                    onChange={(e) =>
                      updateAdhkarSettings({
                        ...state.adhkarSettings,
                        periodicSoundMode: e.target.value as SoundMode,
                      })
                    }
                    className="flex-1 min-h-[36px] px-2 rounded-lg bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] text-xs"
                  >
                    <option value="silent">صامت (بطاقة فقط)</option>
                    <option value="chime_gentle">نغمة هادئة</option>
                    <option value="custom_file">صوت مخصص</option>
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      toggleSoundPreview(
                        'periodic',
                        state.adhkarSettings.periodicSoundMode,
                        state.adhkarSettings.periodicCustomAudioPath
                      )
                    }
                    aria-label="معاينة صوت التذكير"
                    className="min-w-[36px] min-h-[36px] rounded-lg border border-[#D6C6A8] dark:border-[#3D5546] flex items-center justify-center cursor-pointer"
                  >
                    {previewAudioSlot === 'periodic' ? (
                      <Square className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <label className="min-h-[34px] px-2.5 rounded-lg border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صوت مخصص للتذكير</span>
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
                        updateAdhkarSettings({
                          ...state.adhkarSettings,
                          periodicSoundMode: 'custom_file',
                          periodicCustomAudioPath: path,
                        });
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-4">
            <h2 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
              قائمة أذكار التذكير المتتابع ({state.customReminders.length})
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newReminderText.trim()) return;
                saveCustomReminder({
                  id: editingReminder?.id,
                  textAr: newReminderText.trim(),
                  isEnabled: editingReminder?.isEnabled ?? true,
                  sortOrder:
                    editingReminder?.sortOrder ?? state.customReminders.length,
                });
                setNewReminderText('');
                setEditingReminder(null);
              }}
              className="flex flex-wrap gap-2"
            >
              <input
                type="text"
                value={newReminderText}
                onChange={(e) => setNewReminderText(e.target.value)}
                placeholder="أضف ذكراً للتتابع الدوري..."
                className="flex-1 min-w-[220px] min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
              />
              <button
                type="submit"
                className="min-h-[44px] px-5 rounded-xl bg-[#527D68] text-[#F5EBDD] text-sm font-bold cursor-pointer"
              >
                {editingReminder ? 'تحديث الذكر' : 'إضافة للقائمة'}
              </button>
            </form>

            <div className="space-y-2">
              {state.customReminders.map((rem) => (
                <div
                  key={rem.id}
                  className="rounded-xl bg-[#F5EBDD]/60 dark:bg-[#1E2B24] px-4 py-3 flex items-center justify-between gap-3"
                >
                  <label className="flex items-center gap-3 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rem.isEnabled}
                      onChange={(e) =>
                        saveCustomReminder({ ...rem, isEnabled: e.target.checked })
                      }
                    />
                    <span
                      className={`text-sm ${
                        rem.isEnabled ? 'font-semibold' : 'opacity-60'
                      }`}
                    >
                      {rem.textAr}
                    </span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReminder(rem);
                        setNewReminderText(rem.textAr);
                      }}
                      aria-label="تعديل الذكر"
                      className="min-w-[36px] min-h-[36px] rounded-lg border border-[#D6C6A8] dark:border-[#3D5546] flex items-center justify-center cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCustomReminder(rem)}
                      aria-label="حذف الذكر"
                      className="min-w-[36px] min-h-[36px] rounded-lg text-[#B0413E] flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {confirmResetCollection && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm rounded-3xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
              تأكيد إعادة الأذكار
            </h3>
            <p className="text-sm text-[#51665A] dark:text-[#B5C4BC]">
              سيتم تصفير عدادات قسم «{COLLECTION_TITLES[confirmResetCollection]}» وإعادة جميع أذكاره للعرض.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmResetCollection(null)}
                className="min-h-[40px] px-4 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-sm cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAdhkarCollection(confirmResetCollection);
                  setConfirmResetCollection(null);
                }}
                className="min-h-[40px] px-4 rounded-xl bg-[#527D68] text-[#F5EBDD] text-sm font-bold cursor-pointer"
              >
                تأكيد الإعادة
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmResetTasbeeh && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm rounded-3xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
              تأكيد تصفير السبحة
            </h3>
            <p className="text-sm text-[#51665A] dark:text-[#B5C4BC]">
              هل تريد تصفير العداد الحالي للسبحة؟ سيبقى الإجمالي التراكمي محفوظاً.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmResetTasbeeh(false)}
                className="min-h-[40px] px-4 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-sm cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  resetTasbeehCounter();
                  setConfirmResetTasbeeh(false);
                }}
                className="min-h-[40px] px-4 rounded-xl bg-[#527D68] text-[#F5EBDD] text-sm font-bold cursor-pointer"
              >
                تصفير العداد
              </button>
            </div>
          </div>
        </div>
      )}

      {dhikrModalOpen && currentCollection && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!formTitle.trim() || !formText.trim()) return;
              saveDhikrItem({
                id: editingDhikr?.id,
                stableKey:
                  editingDhikr?.stableKey ?? `custom_${Date.now()}`,
                collectionType: editingDhikr?.collectionType ?? currentCollection,
                titleAr: formTitle.trim(),
                textAr: formText.trim(),
                referenceAr: formRef.trim() || null,
                instructionsAr: formInstr.trim() || null,
                targetCount: Math.max(1, formTarget),
                countOrigin: editingDhikr?.countOrigin ?? 'default_editable',
                alternativeCount: editingDhikr?.alternativeCount ?? null,
                currentCount: editingDhikr ? Math.min(formTarget, editingDhikr.currentCount) : 0,
                isCompleted: false,
                isHidden: editingDhikr?.isHidden ?? false,
                sortOrder: editingDhikr?.sortOrder ?? currentCollectionAllItems.length,
                variantGroup: editingDhikr?.variantGroup ?? null,
                groupKey: editingDhikr?.groupKey ?? null,
                subCountersJson: editingDhikr?.subCountersJson ?? null,
                isQuranic: formIsQuranic,
                isUserCustom: editingDhikr ? editingDhikr.isUserCustom : true,
              });
              setDhikrModalOpen(false);
            }}
            className="w-full max-w-lg rounded-3xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-6 space-y-3"
          >
            <h3 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
              {editingDhikr ? 'تعديل الذكر' : 'إضافة ذكر جديد'}
            </h3>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="عنوان الذكر"
              className="w-full min-h-[42px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
            />
            <textarea
              rows={4}
              required
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder="نص الذكر أو الآية"
              className="w-full p-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={1}
                max={1000}
                value={formTarget}
                onChange={(e) => setFormTarget(Number(e.target.value))}
                placeholder="العدد"
                className="min-h-[42px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-clock"
              />
              <input
                type="text"
                value={formRef}
                onChange={(e) => setFormRef(e.target.value)}
                placeholder="المرجع (اختياري)"
                className="min-h-[42px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
              />
            </div>
            <input
              type="text"
              value={formInstr}
              onChange={(e) => setFormInstr(e.target.value)}
              placeholder="ملاحظة أو فضل الذكر (اختياري)"
              className="w-full min-h-[42px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
            />
            <label className="inline-flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={formIsQuranic}
                onChange={(e) => setFormIsQuranic(e.target.checked)}
              />
              <span>نص قرآني</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDhikrModalOpen(false)}
                className="min-h-[40px] px-4 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-sm cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="min-h-[40px] px-5 rounded-xl bg-[#527D68] text-[#F5EBDD] text-sm font-bold cursor-pointer"
              >
                حفظ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
