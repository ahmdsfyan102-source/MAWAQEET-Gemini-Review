import type {
  AdhkarSettingsEntity,
  AppointmentAlertEntity,
  AppointmentEntity,
  AppointmentTemplateEntity,
  CustomAudioEntity,
  CustomDhikrReminderEntity,
  DhikrItemEntity,
  HistoryRecordEntity,
  NoteEntity,
  NotificationLogEntity,
  PrayerAlertRuleEntity,
  PrayerConfigEntity,
  TasbeehStateEntity,
  TaskEntity,
} from '../types/models';

export const BACKUP_SIGNATURE = 'MAWAQEET_KAFR_EL_SHEIKH';
export const BACKUP_SCHEMA_VERSION = 6;

export interface MawaqeetStateSnapshot {
  prayerConfig: PrayerConfigEntity;
  prayerRules: PrayerAlertRuleEntity[];
  appointments: AppointmentEntity[];
  appointmentAlerts: AppointmentAlertEntity[];
  tasks: TaskEntity[];
  notes: NoteEntity[];
  templates: AppointmentTemplateEntity[];
  customAudioFiles: CustomAudioEntity[];
  historyRecords: HistoryRecordEntity[];
  notificationLogs: NotificationLogEntity[];
  dhikrItems: DhikrItemEntity[];
  tasbeehState: TasbeehStateEntity;
  customReminders: CustomDhikrReminderEntity[];
  adhkarSettings: AdhkarSettingsEntity;
}

export interface BackupPayload extends MawaqeetStateSnapshot {
  app: string;
  schemaVersion: number;
  exportedAt: number;
}

export interface BackupResult {
  success: boolean;
  messageAr: string;
  restored?: MawaqeetStateSnapshot;
}

export function exportFullBackupJson(state: MawaqeetStateSnapshot): string {
  const payload: BackupPayload = {
    app: BACKUP_SIGNATURE,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: Date.now(),
    ...state,
  };
  return JSON.stringify(payload, null, 2);
}

export function validateBackupJson(rawJson: string): {
  valid: boolean;
  payload?: Partial<BackupPayload>;
  errorAr?: string;
} {
  try {
    const parsed = JSON.parse(rawJson) as Partial<BackupPayload>;
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, errorAr: 'ملف النسخة الاحتياطية غير صالح.' };
    }
    if (parsed.app !== BACKUP_SIGNATURE) {
      return { valid: false, errorAr: 'هذا الملف لا يخص تطبيق مواقيت (كفر الشيخ).' };
    }
    if (!parsed.prayerConfig) {
      return { valid: false, errorAr: 'ملف النسخة الاحتياطية يفتقد إعدادات المواقيت.' };
    }
    return { valid: true, payload: parsed };
  } catch {
    return { valid: false, errorAr: 'تعذر قراءة ملف JSON؛ تأكد من سلامة الملف.' };
  }
}

export function restoreFullBackupJson(
  currentState: MawaqeetStateSnapshot,
  rawJson: string
): BackupResult {
  const check = validateBackupJson(rawJson);
  if (!check.valid || !check.payload) {
    return {
      success: false,
      messageAr: check.errorAr ?? 'فشل التحقق من النسخة الاحتياطية.',
    };
  }
  const p = check.payload;
  const restored: MawaqeetStateSnapshot = {
    prayerConfig: { ...currentState.prayerConfig, ...p.prayerConfig },
    prayerRules: Array.isArray(p.prayerRules) ? p.prayerRules : currentState.prayerRules,
    appointments: Array.isArray(p.appointments) ? p.appointments : currentState.appointments,
    appointmentAlerts: Array.isArray(p.appointmentAlerts)
      ? p.appointmentAlerts
      : currentState.appointmentAlerts,
    tasks: Array.isArray(p.tasks) ? p.tasks : currentState.tasks,
    notes: Array.isArray(p.notes) ? p.notes : currentState.notes,
    templates: Array.isArray(p.templates) ? p.templates : currentState.templates,
    customAudioFiles: Array.isArray(p.customAudioFiles)
      ? p.customAudioFiles
      : currentState.customAudioFiles,
    historyRecords: Array.isArray(p.historyRecords)
      ? p.historyRecords
      : currentState.historyRecords,
    notificationLogs: Array.isArray(p.notificationLogs)
      ? p.notificationLogs
      : currentState.notificationLogs,
    dhikrItems:
      Array.isArray(p.dhikrItems) && p.dhikrItems.length > 0
        ? p.dhikrItems
        : currentState.dhikrItems,
    tasbeehState: p.tasbeehState ?? currentState.tasbeehState,
    customReminders: Array.isArray(p.customReminders)
      ? p.customReminders
      : currentState.customReminders,
    adhkarSettings: p.adhkarSettings
      ? { ...currentState.adhkarSettings, ...p.adhkarSettings }
      : currentState.adhkarSettings,
  };

  return {
    success: true,
    messageAr: 'تمت استعادة النسخة الاحتياطية بنجاح.',
    restored,
  };
}
