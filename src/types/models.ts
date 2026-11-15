export type TimeMode = 'winter' | 'summer';
export type ThemeMode = 'auto' | 'light' | 'dark';
export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type SoundMode =
  | 'adhan_1'
  | 'adhan_2'
  | 'chime_gentle'
  | 'vibrate_only'
  | 'silent'
  | 'custom_file';

export type AppointmentCategory =
  | 'lesson'
  | 'lecture'
  | 'personal'
  | 'work'
  | 'family'
  | 'other';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'custom_days' | 'monthly';
export type TaskPriority = 'low' | 'medium' | 'high';
export type AdhkarCollectionType = 'morning' | 'evening' | 'sleep' | 'wakeup';

export interface PrayerConfigEntity {
  id: number;
  timeMode: TimeMode;
  fajrOffset: number;
  sunriseOffset: number;
  dhuhrOffset: number;
  asrOffset: number;
  maghribOffset: number;
  ishaOffset: number;
  hijriDayOffset: number;
  defaultSnoozeMinutes: number;
  soundDurationSeconds: number;
  lastCalculatedAt: number;
  themeMode: ThemeMode;
  fontScale: number;
  cardScale: number;
}

export interface PrayerAlertRuleEntity {
  id: number;
  prayerKey: PrayerKey;
  alertType: 'before' | 'at_time' | 'after';
  minutesOffset: number;
  soundUri?: string | null;
  customAudioPath?: string | null;
  soundMode: SoundMode;
  isVibrationEnabled: boolean;
  isEnabled: boolean;
}

export interface AppointmentEntity {
  id: number;
  title: string;
  description?: string | null;
  category: AppointmentCategory;
  location?: string | null;
  notes?: string | null;
  startDate: string;
  startTime: string;
  endTime: string;
  recurrenceType: RecurrenceType;
  customDaysJson?: string | null;
  recurrenceEndDate?: string | null;
  customAudioPath?: string | null;
  isCompleted: boolean;
  isCancelled: boolean;
  createdAt: number;
  cancelledDatesJson?: string | null;
  completedDatesJson?: string | null;
}

export interface AppointmentAlertEntity {
  id: number;
  appointmentId: number;
  minutesOffset: number;
  triggerType: 'offset' | 'custom_time';
  customTimeHHmm?: string | null;
  label?: string | null;
  soundUri?: string | null;
  customAudioPath?: string | null;
  soundMode: SoundMode;
  isVibrationEnabled: boolean;
  isEnabled: boolean;
  updatedAt: number;
}

export interface TaskEntity {
  id: number;
  title: string;
  description?: string | null;
  date: string;
  isCompleted: boolean;
  priority: TaskPriority;
  createdAt: number;
}

export interface NoteEntity {
  id: number;
  date: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppointmentTemplateEntity {
  id: number;
  title: string;
  description?: string | null;
  category: AppointmentCategory;
  location?: string | null;
  durationMinutes: number;
  notes?: string | null;
}

export interface CustomAudioEntity {
  id: number;
  name: string;
  internalFilePath: string;
  durationSeconds: number;
  addedAt: number;
  dataUrl?: string;
}

export interface HistoryRecordEntity {
  id: number;
  eventId?: number | null;
  eventTitle: string;
  category: string;
  actionType: 'completed' | 'cancelled' | 'attended' | 'dismissed';
  scheduledDate: string;
  scheduledTime: string;
  timestamp: number;
}

export interface NotificationLogEntity {
  id: number;
  title: string;
  eventType: 'prayer' | 'appointment' | 'task' | 'adhkar';
  action: 'triggered' | 'snoozed' | 'dismissed';
  soundMode: string;
  scheduledTime: string;
  timestamp: number;
  details?: string | null;
}

export interface DhikrItemEntity {
  id: number;
  stableKey: string;
  collectionType: AdhkarCollectionType;
  titleAr: string;
  textAr: string;
  referenceAr?: string | null;
  instructionsAr?: string | null;
  targetCount: number;
  countOrigin: 'explicit' | 'default_editable';
  alternativeCount?: number | null;
  currentCount: number;
  isCompleted: boolean;
  isHidden: boolean;
  sortOrder: number;
  variantGroup?: 'morning' | 'evening' | null;
  groupKey?: string | null;
  subCountersJson?: string | null;
  isQuranic: boolean;
  isUserCustom: boolean;
}

export interface TasbeehStateEntity {
  id: number;
  selectedPhrase: string;
  currentCount: number;
  totalLifetimeCount: number;
  targetGoal: number;
  updatedAt: number;
}

export interface CustomDhikrReminderEntity {
  id: number;
  textAr: string;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: number;
}

export interface AdhkarSettingsEntity {
  id: number;
  customReminderEnabled: boolean;
  intervalMinutes: number;
  currentSequenceIndex: number;
  lastTriggeredAt: number;
  overlayPreferred: boolean;
  morningNotificationEnabled: boolean;
  morningHour: number;
  morningMinute: number;
  morningSoundMode: SoundMode;
  morningCustomAudioPath?: string | null;
  eveningNotificationEnabled: boolean;
  eveningHour: number;
  eveningMinute: number;
  eveningSoundMode: SoundMode;
  eveningCustomAudioPath?: string | null;
  periodicSoundMode: SoundMode;
  periodicCustomAudioPath?: string | null;
}

export interface HijriDateInfo {
  day: number;
  monthIndex: number;
  monthNameAr: string;
  year: number;
  formatted: string;
}

export interface PrayerTimesOutput {
  utcEpochMs: Record<PrayerKey, number>;
  formattedTimes: Record<PrayerKey, string>;
}

export interface NextPrayerSummary {
  nextPrayerKey: PrayerKey;
  nextPrayerNameAr: string;
  nextPrayerFormatted: string;
  nextPrayerEpochMs: number;
  millisRemaining: number;
  progressPercent: number;
  currentPrayerKey: PrayerKey;
  currentPrayerNameAr: string;
}

export interface DashboardClockState {
  nowEpochMs: number;
  localClockText: string;
  gregorianDateAr: string;
  hijriDate: HijriDateInfo;
  todayDateStr: string;
  todayPrayers: PrayerTimesOutput;
  nextPrayer: NextPrayerSummary;
}

export type ScreenRoute =
  | 'home'
  | 'prayers'
  | 'appointments'
  | 'calendar'
  | 'adhkar'
  | 'settings';
