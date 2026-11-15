import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BACKUP_SIGNATURE,
  exportFullBackupJson,
  restoreFullBackupJson,
  validateBackupJson,
  type MawaqeetStateSnapshot,
} from './backupManager';
import { defaultCustomReminders, defaultDhikrItems } from './adhkarData';

function sampleSnapshot(): MawaqeetStateSnapshot {
  return {
    prayerConfig: {
      id: 1,
      timeMode: 'summer',
      fajrOffset: 1,
      sunriseOffset: 0,
      dhuhrOffset: 0,
      asrOffset: 0,
      maghribOffset: -1,
      ishaOffset: 0,
      hijriDayOffset: 0,
      defaultSnoozeMinutes: 10,
      soundDurationSeconds: 30,
      lastCalculatedAt: 1000,
      themeMode: 'dark',
      fontScale: 1.1,
      cardScale: 1.0,
    },
    prayerRules: [],
    appointments: [],
    appointmentAlerts: [],
    tasks: [],
    notes: [],
    templates: [],
    customAudioFiles: [],
    historyRecords: [],
    notificationLogs: [],
    dhikrItems: defaultDhikrItems(),
    tasbeehState: {
      id: 1,
      selectedPhrase: 'سبحان الله',
      currentCount: 15,
      totalLifetimeCount: 120,
      targetGoal: 33,
      updatedAt: 1000,
    },
    customReminders: defaultCustomReminders(),
    adhkarSettings: {
      id: 1,
      customReminderEnabled: true,
      intervalMinutes: 20,
      currentSequenceIndex: 2,
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

test('Backup export, validate, and restore round-trip preserves user config and tasbeeh', () => {
  const snap = sampleSnapshot();
  const json = exportFullBackupJson(snap);
  const check = validateBackupJson(json);
  assert.equal(check.valid, true);
  assert.equal(check.payload?.app, BACKUP_SIGNATURE);

  const blank = sampleSnapshot();
  blank.prayerConfig.timeMode = 'winter';
  blank.tasbeehState.currentCount = 0;

  const restored = restoreFullBackupJson(blank, json);
  assert.equal(restored.success, true);
  assert.equal(restored.restored?.prayerConfig.timeMode, 'summer');
  assert.equal(restored.restored?.tasbeehState.currentCount, 15);
});

test('Backup validation rejects foreign signature', () => {
  const bad = JSON.stringify({ app: 'OTHER_APP', prayerConfig: {} });
  const check = validateBackupJson(bad);
  assert.equal(check.valid, false);
});
