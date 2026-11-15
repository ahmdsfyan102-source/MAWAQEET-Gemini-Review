import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AudioFileManager } from '../audio/audioManager';
import {
  defaultCustomReminders,
  defaultDhikrItems,
} from '../domain/adhkarData';
import {
  incrementDhikr,
  nextSequentialReminder,
  resetItemProgress,
  switchAlternativeCount,
} from '../domain/adhkarEngine';
import {
  exportFullBackupJson,
  restoreFullBackupJson,
  type BackupResult,
  type MawaqeetStateSnapshot,
} from '../domain/backupManager';
import { formatGregorianAr, toHijri } from '../domain/hijriCalendar';
import {
  calculateKafrElSheikh,
  formatLocalClock,
  getLocalDateTimeParts,
  getNextPrayer,
} from '../domain/prayerCalculator';
import {
  dateToDateString,
  getNextUpcomingLesson,
  getNextUpcomingOccurrence,
  parseJsonStringList,
  toDateString,
  toJsonStringList,
  type UpcomingOccurrence,
} from '../domain/recurrenceEngine';
import type {
  AdhkarCollectionType,
  AdhkarSettingsEntity,
  AppointmentAlertEntity,
  AppointmentEntity,
  AppointmentTemplateEntity,
  CustomAudioEntity,
  CustomDhikrReminderEntity,
  DashboardClockState,
  DhikrItemEntity,
  NoteEntity,
  PrayerAlertRuleEntity,
  PrayerConfigEntity,
  PrayerKey,
  ScreenRoute,
  SoundMode,
  TaskEntity,
  TimeMode,
} from '../types/models';

const STORAGE_KEY = 'mawaqeet_kafr_web_state_v1';

export interface ActiveAlarmState {
  id: number;
  title: string;
  subtitle?: string | null;
  eventType: 'prayer' | 'appointment' | 'adhkar' | 'task';
  soundMode: SoundMode;
  customAudioPath?: string | null;
  scheduledTime: string;
}

export interface ActivePeriodicBanner {
  id: number;
  textAr: string;
}

function createDefaultState(): MawaqeetStateSnapshot {
  const prayers: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const prayerRules: PrayerAlertRuleEntity[] = prayers.map((key, idx) => ({
    id: idx + 1,
    prayerKey: key,
    alertType: 'at_time',
    minutesOffset: 0,
    soundMode: key === 'sunrise' ? 'chime_gentle' : key === 'fajr' ? 'adhan_1' : 'adhan_2',
    isVibrationEnabled: true,
    isEnabled: key !== 'sunrise',
  }));

  const templates: AppointmentTemplateEntity[] = [
    {
      id: 1,
      title: 'حلقة تلاوة وتجويد قرآن كريم',
      category: 'lesson',
      location: 'المسجد الكبير / كفر الشيخ',
      durationMinutes: 90,
    },
    {
      id: 2,
      title: 'درس الفقه الشافعي وأصول الأحكام',
      category: 'lesson',
      location: 'مسجد سيدي طلحة / كفر الشيخ',
      durationMinutes: 60,
    },
  ];

  return {
    prayerConfig: {
      id: 1,
      timeMode: 'winter',
      fajrOffset: 0,
      sunriseOffset: 0,
      dhuhrOffset: 0,
      asrOffset: 0,
      maghribOffset: 0,
      ishaOffset: 0,
      hijriDayOffset: 0,
      defaultSnoozeMinutes: 10,
      soundDurationSeconds: 30,
      lastCalculatedAt: Date.now(),
      themeMode: 'auto',
      fontScale: 1.0,
      cardScale: 1.0,
    },
    prayerRules,
    appointments: [],
    appointmentAlerts: [],
    tasks: [],
    notes: [],
    templates,
    customAudioFiles: [],
    historyRecords: [],
    notificationLogs: [],
    dhikrItems: defaultDhikrItems(),
    tasbeehState: {
      id: 1,
      selectedPhrase: 'سبحان الله وبحمده',
      currentCount: 0,
      totalLifetimeCount: 0,
      targetGoal: 33,
      updatedAt: Date.now(),
    },
    customReminders: defaultCustomReminders(),
    adhkarSettings: {
      id: 1,
      customReminderEnabled: false,
      intervalMinutes: 30,
      currentSequenceIndex: 0,
      lastTriggeredAt: 0,
      overlayPreferred: true,
      morningNotificationEnabled: true,
      morningHour: 6,
      morningMinute: 0,
      morningSoundMode: 'chime_gentle',
      eveningNotificationEnabled: true,
      eveningHour: 17,
      eveningMinute: 0,
      eveningSoundMode: 'chime_gentle',
      periodicSoundMode: 'silent',
    },
  };
}

function loadPersistedState(): MawaqeetStateSnapshot {
  const defaults = createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<MawaqeetStateSnapshot>;
    return {
      ...defaults,
      ...parsed,
      prayerConfig: { ...defaults.prayerConfig, ...(parsed.prayerConfig ?? {}) },
      prayerRules:
        Array.isArray(parsed.prayerRules) && parsed.prayerRules.length > 0
          ? parsed.prayerRules
          : defaults.prayerRules,
      templates:
        Array.isArray(parsed.templates) && parsed.templates.length > 0
          ? parsed.templates
          : defaults.templates,
      dhikrItems:
        Array.isArray(parsed.dhikrItems) && parsed.dhikrItems.length > 0
          ? parsed.dhikrItems
          : defaults.dhikrItems,
      tasbeehState: { ...defaults.tasbeehState, ...(parsed.tasbeehState ?? {}) },
      customReminders:
        Array.isArray(parsed.customReminders) && parsed.customReminders.length > 0
          ? parsed.customReminders
          : defaults.customReminders,
      adhkarSettings: { ...defaults.adhkarSettings, ...(parsed.adhkarSettings ?? {}) },
    };
  } catch {
    return defaults;
  }
}

interface MawaqeetContextValue {
  state: MawaqeetStateSnapshot;
  clock: DashboardClockState;
  nextUpcomingEvent: UpcomingOccurrence | null;
  nextUpcomingLesson: UpcomingOccurrence | null;
  activeScreen: ScreenRoute;
  setActiveScreen: (screen: ScreenRoute) => void;
  adhkarDeepLinkSection: number | null;
  clearAdhkarDeepLink: () => void;
  statusMessage: string | null;
  clearStatusMessage: () => void;
  activeAlarm: ActiveAlarmState | null;
  periodicBanner: ActivePeriodicBanner | null;
  dismissPeriodicBanner: () => void;
  notificationPermission: NotificationPermission | 'unsupported';
  requestNotificationPermission: () => Promise<void>;
  resolvedDark: boolean;

  setTimeMode: (mode: TimeMode) => void;
  updatePrayerConfig: (updated: PrayerConfigEntity) => void;
  adjustPrayerOffset: (prayerKey: PrayerKey, deltaMinutes: number) => void;
  resetAllPrayerOffsets: () => void;
  updatePrayerRule: (rule: PrayerAlertRuleEntity) => void;

  saveAppointmentWithAlerts: (
    appt: Omit<AppointmentEntity, 'id' | 'createdAt'> & { id?: number; createdAt?: number },
    alerts: Array<Omit<AppointmentAlertEntity, 'id' | 'appointmentId' | 'updatedAt'> & { id?: number }>
  ) => void;
  deleteAppointmentSeries: (appointment: AppointmentEntity) => void;
  cancelSingleOccurrence: (appointment: AppointmentEntity, dateStr: string) => void;
  editSingleOccurrenceWithAlerts: (
    original: AppointmentEntity,
    dateStr: string,
    updatedOneTime: Omit<AppointmentEntity, 'id' | 'createdAt'>,
    alerts: Array<Omit<AppointmentAlertEntity, 'id' | 'appointmentId' | 'updatedAt'>>
  ) => void;
  markAppointmentCompleted: (appointment: AppointmentEntity, dateStr: string) => void;

  saveTask: (task: Omit<TaskEntity, 'id' | 'createdAt'> & { id?: number }) => void;
  toggleTask: (task: TaskEntity) => void;
  deleteTask: (task: TaskEntity) => void;
  saveNote: (note: Omit<NoteEntity, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }) => void;
  deleteNote: (note: NoteEntity) => void;
  saveTemplate: (tmpl: Omit<AppointmentTemplateEntity, 'id'> & { id?: number }) => void;
  deleteTemplate: (tmpl: AppointmentTemplateEntity) => void;
  clearHistory: () => void;
  clearNotificationLogs: () => void;

  tapDhikrCard: (item: DhikrItemEntity, subKey?: string) => void;
  switchDhikrAlternativeCount: (item: DhikrItemEntity) => void;
  resetAdhkarCollection: (collectionType: AdhkarCollectionType) => void;
  saveDhikrItem: (item: Omit<DhikrItemEntity, 'id'> & { id?: number }) => void;
  deleteDhikrItem: (item: DhikrItemEntity) => void;
  toggleHideDhikr: (item: DhikrItemEntity) => void;
  restoreHiddenInCollection: (collectionType: AdhkarCollectionType) => void;
  moveDhikrOrder: (collectionItems: DhikrItemEntity[], index: number, delta: number) => void;
  importAdhkarJson: (rawJson: string) => void;

  incrementTasbeeh: () => void;
  resetTasbeehCounter: () => void;
  setTasbeehPhrase: (phrase: string, targetGoal?: number) => void;

  saveCustomReminder: (rem: Omit<CustomDhikrReminderEntity, 'id' | 'createdAt'> & { id?: number }) => void;
  deleteCustomReminder: (rem: CustomDhikrReminderEntity) => void;
  updateAdhkarSettings: (updated: AdhkarSettingsEntity) => void;

  importCustomAudioFile: (file: File) => Promise<string | null>;
  deleteCustomAudio: (audio: CustomAudioEntity) => void;

  triggerAlarm: (alarm: Omit<ActiveAlarmState, 'id'>) => void;
  dismissActiveAlarm: () => void;
  snoozeActiveAlarm: (minutes: number) => void;
  triggerImmediateNotificationTest: () => void;

  exportFullBackup: () => string;
  restoreFullBackup: (rawJson: string) => BackupResult;
}

const MawaqeetContext = createContext<MawaqeetContextValue | null>(null);

export const MawaqeetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MawaqeetStateSnapshot>(() => loadPersistedState());
  const [nowEpochMs, setNowEpochMs] = useState<number>(() => Date.now());
  const [activeScreen, setActiveScreen] = useState<ScreenRoute>('home');
  const [adhkarDeepLinkSection, setAdhkarDeepLinkSection] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarmState | null>(null);
  const [periodicBanner, setPeriodicBanner] = useState<ActivePeriodicBanner | null>(null);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const triggeredKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedDark =
    state.prayerConfig.themeMode === 'dark' ||
    (state.prayerConfig.themeMode === 'auto' && systemPrefersDark);

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedDark) root.classList.add('dark');
    else root.classList.remove('dark');

    root.style.setProperty(
      '--font-scale',
      String(Math.max(0.85, Math.min(1.3, state.prayerConfig.fontScale)))
    );
    root.style.setProperty(
      '--card-scale',
      String(Math.max(0.9, Math.min(1.2, state.prayerConfig.cardScale)))
    );
  }, [resolvedDark, state.prayerConfig.fontScale, state.prayerConfig.cardScale]);

  useEffect(() => {
    let timer: number | null = null;
    const start = () => {
      if (timer !== null) window.clearInterval(timer);
      setNowEpochMs(Date.now());
      timer = window.setInterval(() => {
        if (!document.hidden) setNowEpochMs(Date.now());
      }, 1000);
    };
    start();
    const onVis = () => {
      if (!document.hidden) setNowEpochMs(Date.now());
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      if (timer !== null) window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const clock: DashboardClockState = useMemo(() => {
    const cfg = state.prayerConfig;
    const utcOffset = cfg.timeMode === 'summer' ? 3 : 2;
    const { year, month, day } = getLocalDateTimeParts(nowEpochMs, utcOffset);
    const offsets: Partial<Record<PrayerKey, number>> = {
      fajr: cfg.fajrOffset,
      sunrise: cfg.sunriseOffset,
      dhuhr: cfg.dhuhrOffset,
      asr: cfg.asrOffset,
      maghrib: cfg.maghribOffset,
      isha: cfg.ishaOffset,
    };
    const todayPrayers = calculateKafrElSheikh(year, month, day, utcOffset, offsets);
    const tomDate = new Date(Date.UTC(year, month - 1, day + 1));
    const tomPrayers = calculateKafrElSheikh(
      tomDate.getUTCFullYear(),
      tomDate.getUTCMonth() + 1,
      tomDate.getUTCDate(),
      utcOffset,
      offsets
    );
    return {
      nowEpochMs,
      localClockText: formatLocalClock(nowEpochMs, utcOffset),
      gregorianDateAr: formatGregorianAr(year, month, day),
      hijriDate: toHijri(year, month, day, cfg.hijriDayOffset),
      todayDateStr: toDateString(year, month, day),
      todayPrayers,
      nextPrayer: getNextPrayer(nowEpochMs, todayPrayers, tomPrayers),
    };
  }, [nowEpochMs, state.prayerConfig]);

  const minuteBucket = Math.floor(nowEpochMs / 60_000);
  const nextUpcomingEvent = useMemo(
    () => getNextUpcomingOccurrence(state.appointments, minuteBucket * 60_000),
    [state.appointments, minuteBucket]
  );
  const nextUpcomingLesson = useMemo(
    () => getNextUpcomingLesson(state.appointments, minuteBucket * 60_000),
    [state.appointments, minuteBucket]
  );

  const showToast = useCallback((msg: string) => {
    setStatusMessage(msg);
  }, []);

  const clearStatusMessage = useCallback(() => setStatusMessage(null), []);
  const clearAdhkarDeepLink = useCallback(() => setAdhkarDeepLinkSection(null), []);
  const dismissPeriodicBanner = useCallback(() => setPeriodicBanner(null), []);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      setNotificationPermission('unsupported');
      showToast('متصفحك لا يدعم إشعارات النظام؛ ستظهر التنبيهات داخل التطبيق.');
      return;
    }
    try {
      const res = await Notification.requestPermission();
      setNotificationPermission(res);
      showToast(
        res === 'granted'
          ? 'تم تفعيل إذن الإشعارات بنجاح.'
          : 'لم يتم منح إذن إشعارات المتصفح؛ ستستمر التنبيهات الصوتية داخل التطبيق.'
      );
    } catch {
      showToast('تعذر طلب إذن الإشعارات.');
    }
  }, [showToast]);

  const triggerAlarm = useCallback(
    (alarm: Omit<ActiveAlarmState, 'id'>) => {
      const id = Date.now();
      setActiveAlarm({ ...alarm, id });
      AudioFileManager.playForSoundMode({
        soundMode: alarm.soundMode,
        customAudioPath: alarm.customAudioPath,
        customAudioFiles: state.customAudioFiles,
        durationSeconds: state.prayerConfig.soundDurationSeconds,
        vibrationEnabled: true,
      });

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification(`مَواقيت · ${alarm.title}`, {
            body: alarm.subtitle ?? `الموعد: ${alarm.scheduledTime}`,
            icon: '/icon.jpg',
          });
        } catch {
          // ignore
        }
      }
    },
    [state.customAudioFiles, state.prayerConfig.soundDurationSeconds]
  );

  useEffect(() => {
    const cfg = state.adhkarSettings;
    if (!cfg.customReminderEnabled) return;
    const intervalMs = Math.max(10, cfg.intervalMinutes) * 60_000;
    const elapsed = nowEpochMs - cfg.lastTriggeredAt;
    if (cfg.lastTriggeredAt === 0 || elapsed >= intervalMs) {
      const { chosen, nextIndex } = nextSequentialReminder(
        state.customReminders,
        cfg.currentSequenceIndex
      );
      if (chosen) {
        setState((prev) => ({
          ...prev,
          adhkarSettings: {
            ...prev.adhkarSettings,
            currentSequenceIndex: nextIndex,
            lastTriggeredAt: nowEpochMs,
          },
        }));
        setPeriodicBanner({ id: nowEpochMs, textAr: chosen.textAr });
        if (cfg.periodicSoundMode !== 'silent') {
          AudioFileManager.playForSoundMode({
            soundMode: cfg.periodicSoundMode,
            customAudioPath: cfg.periodicCustomAudioPath,
            customAudioFiles: state.customAudioFiles,
            durationSeconds: 10,
          });
        }
      }
    }
  }, [
    nowEpochMs,
    state.adhkarSettings,
    state.customReminders,
    state.customAudioFiles,
  ]);

  useEffect(() => {
    const todayStr = clock.todayDateStr;
    for (const rule of state.prayerRules) {
      if (!rule.isEnabled) continue;
      const baseEpoch = clock.todayPrayers.utcEpochMs[rule.prayerKey];
      if (!baseEpoch) continue;
      const triggerEpoch = baseEpoch + rule.minutesOffset * 60_000;
      const key = `prayer_${todayStr}_${rule.prayerKey}_${rule.minutesOffset}`;
      if (
        nowEpochMs >= triggerEpoch &&
        nowEpochMs - triggerEpoch < 55_000 &&
        !triggeredKeysRef.current.has(key)
      ) {
        triggeredKeysRef.current.add(key);
        const prayerName =
          rule.prayerKey === 'sunrise'
            ? 'شروق الشمس'
            : `صلاة ${
                {
                  fajr: 'الفجر',
                  dhuhr: 'الظهر',
                  asr: 'العصر',
                  maghrib: 'المغرب',
                  isha: 'العشاء',
                  sunrise: 'الشروق',
                }[rule.prayerKey]
              }`;
        triggerAlarm({
          title: `حان وقت ${prayerName}`,
          subtitle: 'كفر الشيخ · الهيئة المصرية العامة للمساحة',
          eventType: 'prayer',
          soundMode: rule.soundMode,
          customAudioPath: rule.customAudioPath,
          scheduledTime: clock.todayPrayers.formattedTimes[rule.prayerKey],
        });
      }
    }
  }, [nowEpochMs, clock, state.prayerRules, triggerAlarm]);

  const dismissActiveAlarm = useCallback(() => {
    AudioFileManager.stopAudio();
    if (!activeAlarm) return;
    const current = activeAlarm;
    setActiveAlarm(null);
    setState((prev) => ({
      ...prev,
      notificationLogs: [
        {
          id: Date.now(),
          title: current.title,
          eventType: current.eventType,
          action: 'dismissed',
          soundMode: 'stopped',
          scheduledTime: current.scheduledTime,
          timestamp: Date.now(),
        },
        ...prev.notificationLogs,
      ],
      historyRecords: [
        {
          id: Date.now() + 1,
          eventId: null,
          eventTitle: current.title,
          category: current.eventType,
          actionType: 'dismissed',
          scheduledDate: dateToDateString(new Date()),
          scheduledTime: current.scheduledTime,
          timestamp: Date.now(),
        },
        ...prev.historyRecords,
      ],
    }));
  }, [activeAlarm]);

  const snoozeActiveAlarm = useCallback(
    (minutes: number) => {
      AudioFileManager.stopAudio();
      if (!activeAlarm) return;
      const current = activeAlarm;
      setActiveAlarm(null);
      setState((prev) => ({
        ...prev,
        notificationLogs: [
          {
            id: Date.now(),
            title: current.title,
            eventType: current.eventType,
            action: 'snoozed',
            soundMode: current.soundMode,
            scheduledTime: current.scheduledTime,
            timestamp: Date.now(),
            details: `غفوة لمدة ${minutes} دقائق`,
          },
          ...prev.notificationLogs,
        ],
      }));
      showToast(`تم تأجيل التنبيه (${current.title}) لمدة ${minutes} دقائق.`);
      window.setTimeout(() => {
        triggerAlarm({ ...current });
      }, minutes * 60_000);
    },
    [activeAlarm, showToast, triggerAlarm]
  );

  const triggerImmediateNotificationTest = useCallback(() => {
    triggerAlarm({
      title: 'اختبار تنبيه مَواقيت – كفر الشيخ',
      subtitle: 'إشعار تجريبي فعلي مع معاينة الصوت والغفوة',
      eventType: 'appointment',
      soundMode: 'chime_gentle',
      scheduledTime: clock.localClockText,
    });
    showToast('تم إرسال إشعار الاختبار.');
  }, [clock.localClockText, showToast, triggerAlarm]);

  const setTimeMode = useCallback((mode: TimeMode) => {
    setState((prev) => ({
      ...prev,
      prayerConfig: {
        ...prev.prayerConfig,
        timeMode: mode,
        lastCalculatedAt: Date.now(),
      },
    }));
  }, []);

  const updatePrayerConfig = useCallback((updated: PrayerConfigEntity) => {
    setState((prev) => ({
      ...prev,
      prayerConfig: { ...updated, lastCalculatedAt: Date.now() },
    }));
  }, []);

  const adjustPrayerOffset = useCallback((prayerKey: PrayerKey, deltaMinutes: number) => {
    setState((prev) => {
      const c = prev.prayerConfig;
      const clampOff = (v: number) => Math.max(-60, Math.min(60, v + deltaMinutes));
      const next: PrayerConfigEntity = {
        ...c,
        fajrOffset: prayerKey === 'fajr' ? clampOff(c.fajrOffset) : c.fajrOffset,
        sunriseOffset: prayerKey === 'sunrise' ? clampOff(c.sunriseOffset) : c.sunriseOffset,
        dhuhrOffset: prayerKey === 'dhuhr' ? clampOff(c.dhuhrOffset) : c.dhuhrOffset,
        asrOffset: prayerKey === 'asr' ? clampOff(c.asrOffset) : c.asrOffset,
        maghribOffset: prayerKey === 'maghrib' ? clampOff(c.maghribOffset) : c.maghribOffset,
        ishaOffset: prayerKey === 'isha' ? clampOff(c.ishaOffset) : c.ishaOffset,
        lastCalculatedAt: Date.now(),
      };
      return { ...prev, prayerConfig: next };
    });
  }, []);

  const resetAllPrayerOffsets = useCallback(() => {
    setState((prev) => ({
      ...prev,
      prayerConfig: {
        ...prev.prayerConfig,
        fajrOffset: 0,
        sunriseOffset: 0,
        dhuhrOffset: 0,
        asrOffset: 0,
        maghribOffset: 0,
        ishaOffset: 0,
        lastCalculatedAt: Date.now(),
      },
    }));
    showToast('تمت إعادة جميع إزاحات المواقيت إلى الصفر.');
  }, [showToast]);

  const updatePrayerRule = useCallback((rule: PrayerAlertRuleEntity) => {
    setState((prev) => ({
      ...prev,
      prayerRules: prev.prayerRules.map((r) =>
        r.prayerKey === rule.prayerKey ? rule : r
      ),
    }));
  }, []);

  const saveAppointmentWithAlerts = useCallback(
    (
      appt: Omit<AppointmentEntity, 'id' | 'createdAt'> & { id?: number; createdAt?: number },
      alerts: Array<Omit<AppointmentAlertEntity, 'id' | 'appointmentId' | 'updatedAt'> & { id?: number }>
    ) => {
      setState((prev) => {
        const apptId =
          appt.id && appt.id > 0
            ? appt.id
            : prev.appointments.reduce((m, a) => Math.max(m, a.id), 0) + 1;

        const savedAppt: AppointmentEntity = {
          ...appt,
          id: apptId,
          createdAt: appt.createdAt ?? Date.now(),
        };

        const exists = prev.appointments.some((a) => a.id === apptId);
        const nextAppointments = exists
          ? prev.appointments.map((a) => (a.id === apptId ? savedAppt : a))
          : [savedAppt, ...prev.appointments];

        let maxAlertId = prev.appointmentAlerts.reduce((m, al) => Math.max(m, al.id), 0);
        const otherAlerts = prev.appointmentAlerts.filter((al) => al.appointmentId !== apptId);
        const mappedAlerts: AppointmentAlertEntity[] = alerts.map((al) => ({
          ...al,
          id: al.id && al.id > 0 ? al.id : ++maxAlertId,
          appointmentId: apptId,
          updatedAt: Date.now(),
        }));

        return {
          ...prev,
          appointments: nextAppointments,
          appointmentAlerts: [...otherAlerts, ...mappedAlerts],
        };
      });

      showToast(
        alerts.length === 0
          ? 'تم حفظ الموعد دون تنبيهات مجدولة.'
          : `تم حفظ الموعد مع ${alerts.length} تنبيه مستقل.`
      );
    },
    [showToast]
  );

  const deleteAppointmentSeries = useCallback((appointment: AppointmentEntity) => {
    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.filter((a) => a.id !== appointment.id),
      appointmentAlerts: prev.appointmentAlerts.filter(
        (al) => al.appointmentId !== appointment.id
      ),
    }));
  }, []);

  const cancelSingleOccurrence = useCallback(
    (appointment: AppointmentEntity, dateStr: string) => {
      setState((prev) => {
        const cancelled = [...parseJsonStringList(appointment.cancelledDatesJson), dateStr];
        return {
          ...prev,
          appointments: prev.appointments.map((a) =>
            a.id === appointment.id
              ? { ...a, cancelledDatesJson: toJsonStringList(cancelled) }
              : a
          ),
          historyRecords: [
            {
              id: Date.now(),
              eventId: appointment.id,
              eventTitle: appointment.title,
              category: appointment.category,
              actionType: 'cancelled',
              scheduledDate: dateStr,
              scheduledTime: appointment.startTime,
              timestamp: Date.now(),
            },
            ...prev.historyRecords,
          ],
        };
      });
    },
    []
  );

  const editSingleOccurrenceWithAlerts = useCallback(
    (
      original: AppointmentEntity,
      dateStr: string,
      updatedOneTime: Omit<AppointmentEntity, 'id' | 'createdAt'>,
      alerts: Array<Omit<AppointmentAlertEntity, 'id' | 'appointmentId' | 'updatedAt'>>
    ) => {
      setState((prev) => {
        const cancelled = [...parseJsonStringList(original.cancelledDatesJson), dateStr];
        const newApptId = prev.appointments.reduce((m, a) => Math.max(m, a.id), 0) + 1;
        const cleanOneTime: AppointmentEntity = {
          ...updatedOneTime,
          id: newApptId,
          startDate: dateStr,
          recurrenceType: 'none',
          customDaysJson: null,
          recurrenceEndDate: null,
          cancelledDatesJson: null,
          createdAt: Date.now(),
        };
        let maxAlertId = prev.appointmentAlerts.reduce((m, al) => Math.max(m, al.id), 0);
        const clonedAlerts: AppointmentAlertEntity[] = alerts.map((al) => ({
          ...al,
          id: ++maxAlertId,
          appointmentId: newApptId,
          updatedAt: Date.now(),
        }));
        return {
          ...prev,
          appointments: [
            cleanOneTime,
            ...prev.appointments.map((a) =>
              a.id === original.id
                ? { ...a, cancelledDatesJson: toJsonStringList(cancelled) }
                : a
            ),
          ],
          appointmentAlerts: [...prev.appointmentAlerts, ...clonedAlerts],
        };
      });
      showToast('تم تعديل هذا الموعد فقط بنجاح.');
    },
    [showToast]
  );

  const markAppointmentCompleted = useCallback(
    (appointment: AppointmentEntity, dateStr: string) => {
      setState((prev) => {
        const completed = [...parseJsonStringList(appointment.completedDatesJson), dateStr];
        return {
          ...prev,
          appointments: prev.appointments.map((a) =>
            a.id === appointment.id
              ? { ...a, completedDatesJson: toJsonStringList(completed) }
              : a
          ),
          historyRecords: [
            {
              id: Date.now(),
              eventId: appointment.id,
              eventTitle: appointment.title,
              category: appointment.category,
              actionType: 'completed',
              scheduledDate: dateStr,
              scheduledTime: appointment.startTime,
              timestamp: Date.now(),
            },
            ...prev.historyRecords,
          ],
        };
      });
      showToast('تم تسجيل الإنجاز في السجل.');
    },
    [showToast]
  );

  const saveTask = useCallback((task: Omit<TaskEntity, 'id' | 'createdAt'> & { id?: number }) => {
    setState((prev) => {
      const id =
        task.id && task.id > 0
          ? task.id
          : prev.tasks.reduce((m, t) => Math.max(m, t.id), 0) + 1;
      const saved: TaskEntity = { ...task, id, createdAt: Date.now() };
      const exists = prev.tasks.some((t) => t.id === id);
      return {
        ...prev,
        tasks: exists
          ? prev.tasks.map((t) => (t.id === id ? saved : t))
          : [saved, ...prev.tasks],
      };
    });
  }, []);

  const toggleTask = useCallback((task: TaskEntity) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    }));
  }, []);

  const deleteTask = useCallback((task: TaskEntity) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== task.id),
    }));
  }, []);

  const saveNote = useCallback(
    (note: Omit<NoteEntity, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }) => {
      setState((prev) => {
        const now = Date.now();
        const existingForDate = prev.notes.find(
          (n) => (note.id && n.id === note.id) || n.date === note.date
        );
        if (existingForDate) {
          return {
            ...prev,
            notes: prev.notes.map((n) =>
              n.id === existingForDate.id
                ? { ...n, title: note.title, content: note.content, updatedAt: now }
                : n
            ),
          };
        }
        const id = prev.notes.reduce((m, n) => Math.max(m, n.id), 0) + 1;
        return {
          ...prev,
          notes: [
            { id, date: note.date, title: note.title, content: note.content, createdAt: now, updatedAt: now },
            ...prev.notes,
          ],
        };
      });
      showToast('تم حفظ الملاحظة.');
    },
    [showToast]
  );

  const deleteNote = useCallback((note: NoteEntity) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== note.id),
    }));
  }, []);

  const saveTemplate = useCallback(
    (tmpl: Omit<AppointmentTemplateEntity, 'id'> & { id?: number }) => {
      setState((prev) => {
        const id =
          tmpl.id && tmpl.id > 0
            ? tmpl.id
            : prev.templates.reduce((m, t) => Math.max(m, t.id), 0) + 1;
        return {
          ...prev,
          templates: [...prev.templates, { ...tmpl, id }],
        };
      });
    },
    []
  );

  const deleteTemplate = useCallback((tmpl: AppointmentTemplateEntity) => {
    setState((prev) => ({
      ...prev,
      templates: prev.templates.filter((t) => t.id !== tmpl.id),
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, historyRecords: [] }));
  }, []);

  const clearNotificationLogs = useCallback(() => {
    setState((prev) => ({ ...prev, notificationLogs: [] }));
  }, []);

  const tapDhikrCard = useCallback((item: DhikrItemEntity, subKey?: string) => {
    setState((prev) => ({
      ...prev,
      dhikrItems: prev.dhikrItems.map((d) =>
        d.id === item.id ? incrementDhikr(d, subKey) : d
      ),
    }));
  }, []);

  const switchDhikrAlternativeCount = useCallback((item: DhikrItemEntity) => {
    setState((prev) => ({
      ...prev,
      dhikrItems: prev.dhikrItems.map((d) =>
        d.id === item.id ? switchAlternativeCount(d) : d
      ),
    }));
  }, []);

  const resetAdhkarCollection = useCallback(
    (collectionType: AdhkarCollectionType) => {
      setState((prev) => ({
        ...prev,
        dhikrItems: prev.dhikrItems.map((d) =>
          d.collectionType === collectionType ? resetItemProgress(d) : d
        ),
      }));
      showToast('تمت إعادة أذكار القسم بنجاح.');
    },
    [showToast]
  );

  const saveDhikrItem = useCallback((item: Omit<DhikrItemEntity, 'id'> & { id?: number }) => {
    setState((prev) => {
      if (item.id && item.id > 0) {
        return {
          ...prev,
          dhikrItems: prev.dhikrItems.map((d) =>
            d.id === item.id ? { ...item, id: item.id } : d
          ),
        };
      }
      const nextId = prev.dhikrItems.reduce((m, d) => Math.max(m, d.id), 0) + 1;
      return {
        ...prev,
        dhikrItems: [...prev.dhikrItems, { ...item, id: nextId }],
      };
    });
  }, []);

  const deleteDhikrItem = useCallback((item: DhikrItemEntity) => {
    setState((prev) => ({
      ...prev,
      dhikrItems: prev.dhikrItems.filter((d) => d.id !== item.id),
    }));
  }, []);

  const toggleHideDhikr = useCallback((item: DhikrItemEntity) => {
    setState((prev) => ({
      ...prev,
      dhikrItems: prev.dhikrItems.map((d) =>
        d.id === item.id ? { ...d, isHidden: !d.isHidden } : d
      ),
    }));
  }, []);

  const restoreHiddenInCollection = useCallback((collectionType: AdhkarCollectionType) => {
    setState((prev) => ({
      ...prev,
      dhikrItems: prev.dhikrItems.map((d) =>
        d.collectionType === collectionType ? { ...d, isHidden: false } : d
      ),
    }));
  }, []);

  const moveDhikrOrder = useCallback(
    (collectionItems: DhikrItemEntity[], index: number, delta: number) => {
      const target = index + delta;
      if (index < 0 || index >= collectionItems.length || target < 0 || target >= collectionItems.length) {
        return;
      }
      const reordered = [...collectionItems];
      const temp = reordered[index];
      reordered[index] = reordered[target];
      reordered[target] = temp;
      const orderById = new Map<number, number>();
      reordered.forEach((item, idx) => orderById.set(item.id, idx));

      setState((prev) => ({
        ...prev,
        dhikrItems: prev.dhikrItems.map((d) =>
          orderById.has(d.id) ? { ...d, sortOrder: orderById.get(d.id)! } : d
        ),
      }));
    },
    []
  );

  const importAdhkarJson = useCallback(
    (rawJson: string) => {
      try {
        const obj = JSON.parse(rawJson) as { items?: Array<Partial<DhikrItemEntity>> };
        if (!Array.isArray(obj.items)) {
          showToast('تعذر قراءة ملف الأذكار؛ تأكد من صحة الصيغة.');
          return;
        }
        setState((prev) => {
          let nextId = prev.dhikrItems.reduce((m, d) => Math.max(m, d.id), 0) + 1;
          const imported: DhikrItemEntity[] = obj.items!
            .filter((it) => it.textAr && it.collectionType)
            .map((it, idx) => ({
              id: nextId++,
              stableKey: it.stableKey || `imported_${Date.now()}_${idx}`,
              collectionType: it.collectionType as AdhkarCollectionType,
              titleAr: it.titleAr || 'ذكر مستورد',
              textAr: it.textAr!,
              referenceAr: it.referenceAr ?? null,
              instructionsAr: it.instructionsAr ?? null,
              targetCount: Math.max(1, it.targetCount ?? 1),
              countOrigin: it.countOrigin ?? 'default_editable',
              alternativeCount: it.alternativeCount ?? null,
              currentCount: 0,
              isCompleted: false,
              isHidden: false,
              sortOrder: it.sortOrder ?? prev.dhikrItems.length + idx,
              subCountersJson: it.subCountersJson ?? null,
              isQuranic: Boolean(it.isQuranic),
              isUserCustom: true,
            }));
          return {
            ...prev,
            dhikrItems: [...prev.dhikrItems, ...imported],
          };
        });
        showToast('تم استيراد الأذكار بنجاح.');
      } catch {
        showToast('تعذر قراءة ملف الأذكار؛ تأكد من صحة الصيغة.');
      }
    },
    [showToast]
  );

  const incrementTasbeeh = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tasbeehState: {
        ...prev.tasbeehState,
        currentCount: prev.tasbeehState.currentCount + 1,
        totalLifetimeCount: prev.tasbeehState.totalLifetimeCount + 1,
        updatedAt: Date.now(),
      },
    }));
  }, []);

  const resetTasbeehCounter = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tasbeehState: {
        ...prev.tasbeehState,
        currentCount: 0,
        updatedAt: Date.now(),
      },
    }));
  }, []);

  const setTasbeehPhrase = useCallback((phrase: string, targetGoal = 33) => {
    setState((prev) => ({
      ...prev,
      tasbeehState: {
        ...prev.tasbeehState,
        selectedPhrase: phrase,
        targetGoal: Math.max(1, targetGoal),
        updatedAt: Date.now(),
      },
    }));
  }, []);

  const saveCustomReminder = useCallback(
    (rem: Omit<CustomDhikrReminderEntity, 'id' | 'createdAt'> & { id?: number }) => {
      setState((prev) => {
        if (rem.id && rem.id > 0) {
          return {
            ...prev,
            customReminders: prev.customReminders.map((r) =>
              r.id === rem.id ? { ...r, ...rem, id: rem.id } : r
            ),
          };
        }
        const nextId = prev.customReminders.reduce((m, r) => Math.max(m, r.id), 0) + 1;
        return {
          ...prev,
          customReminders: [
            ...prev.customReminders,
            { ...rem, id: nextId, createdAt: Date.now() },
          ],
        };
      });
    },
    []
  );

  const deleteCustomReminder = useCallback((rem: CustomDhikrReminderEntity) => {
    setState((prev) => ({
      ...prev,
      customReminders: prev.customReminders.filter((r) => r.id !== rem.id),
    }));
  }, []);

  const updateAdhkarSettings = useCallback((updated: AdhkarSettingsEntity) => {
    setState((prev) => ({ ...prev, adhkarSettings: updated }));
  }, []);

  const importCustomAudioFile = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
        const path = `local://audio/${Date.now()}_${file.name}`;
        const cleanName = file.name.replace(/\.[^.]+$/, '') || file.name;
        setState((prev) => {
          const id = prev.customAudioFiles.reduce((m, a) => Math.max(m, a.id), 0) + 1;
          return {
            ...prev,
            customAudioFiles: [
              ...prev.customAudioFiles,
              {
                id,
                name: cleanName,
                internalFilePath: path,
                durationSeconds: prev.prayerConfig.soundDurationSeconds,
                addedAt: Date.now(),
                dataUrl,
              },
            ],
          };
        });
        showToast('تم استيراد الملف الصوتي وحفظه محلياً.');
        return path;
      } catch {
        showToast('تعذر قراءة الملف الصوتي المختار.');
        return null;
      }
    },
    [showToast]
  );

  const deleteCustomAudio = useCallback((audio: CustomAudioEntity) => {
    setState((prev) => ({
      ...prev,
      customAudioFiles: prev.customAudioFiles.filter((a) => a.id !== audio.id),
    }));
  }, []);

  const exportFullBackup = useCallback(() => {
    return exportFullBackupJson(state);
  }, [state]);

  const restoreFullBackup = useCallback(
    (rawJson: string): BackupResult => {
      const res = restoreFullBackupJson(state, rawJson);
      if (res.success && res.restored) {
        setState(res.restored);
      }
      showToast(res.messageAr);
      return res;
    },
    [state, showToast]
  );

  const value: MawaqeetContextValue = {
    state,
    clock,
    nextUpcomingEvent,
    nextUpcomingLesson,
    activeScreen,
    setActiveScreen,
    adhkarDeepLinkSection,
    clearAdhkarDeepLink,
    statusMessage,
    clearStatusMessage,
    activeAlarm,
    periodicBanner,
    dismissPeriodicBanner,
    notificationPermission,
    requestNotificationPermission,
    resolvedDark,
    setTimeMode,
    updatePrayerConfig,
    adjustPrayerOffset,
    resetAllPrayerOffsets,
    updatePrayerRule,
    saveAppointmentWithAlerts,
    deleteAppointmentSeries,
    cancelSingleOccurrence,
    editSingleOccurrenceWithAlerts,
    markAppointmentCompleted,
    saveTask,
    toggleTask,
    deleteTask,
    saveNote,
    deleteNote,
    saveTemplate,
    deleteTemplate,
    clearHistory,
    clearNotificationLogs,
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
    deleteCustomAudio,
    triggerAlarm,
    dismissActiveAlarm,
    snoozeActiveAlarm,
    triggerImmediateNotificationTest,
    exportFullBackup,
    restoreFullBackup,
  };

  return <MawaqeetContext.Provider value={value}>{children}</MawaqeetContext.Provider>;
};

export function useMawaqeet(): MawaqeetContextValue {
  const ctx = useContext(MawaqeetContext);
  if (!ctx) throw new Error('useMawaqeet must be used within MawaqeetProvider');
  return ctx;
}
