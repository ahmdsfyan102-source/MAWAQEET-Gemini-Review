import type { AppointmentAlertEntity, AppointmentEntity } from '../types/models';
import {
  computeStartEpochMs,
  dateToDateString,
  isOccurrenceOnDate,
} from './recurrenceEngine';

export interface ScheduledAlertSpec {
  alertId: number;
  appointmentId: number;
  occurrenceIndex: number;
  triggerEpochMs: number;
  occurrenceDateStr: string;
  title: string;
  subtitle: string;
  scheduledTimeText: string;
  soundMode: string;
  customAudioPath?: string | null;
  isVibrationEnabled: boolean;
}

export const MAX_OCCURRENCES_PER_APPOINTMENT = 3;

export function computeAlertTriggerEpoch(
  occurrenceDateStr: string,
  appointmentStartTime: string,
  alert: Pick<AppointmentAlertEntity, 'triggerType' | 'customTimeHHmm' | 'minutesOffset'>
): number | null {
  if (alert.triggerType === 'custom_time' && alert.customTimeHHmm?.trim()) {
    return computeStartEpochMs(occurrenceDateStr, alert.customTimeHHmm);
  }
  const startEpoch = computeStartEpochMs(occurrenceDateStr, appointmentStartTime);
  if (startEpoch === null) return null;
  return startEpoch + alert.minutesOffset * 60_000;
}

export function formatOffsetLabelAr(
  alert: Pick<AppointmentAlertEntity, 'label' | 'triggerType' | 'customTimeHHmm' | 'minutesOffset'>
): string {
  if (alert.label && alert.label.trim()) return alert.label;
  if (alert.triggerType === 'custom_time' && alert.customTimeHHmm?.trim()) {
    return `وقت مخصص (${alert.customTimeHHmm})`;
  }
  const mins = alert.minutesOffset;
  if (mins === 0) return 'عند بدء الموعد';
  if (mins < 0) {
    const abs = -mins;
    if (abs >= 1440 && abs % 1440 === 0) return `قبل ${abs / 1440} يوم`;
    if (abs >= 60 && abs % 60 === 0) return `قبل ${abs / 60} ساعة`;
    return `قبل ${abs} دقيقة`;
  }
  return `بعد ${mins} دقيقة`;
}

export function planUpcomingAppointmentAlerts(
  appointments: AppointmentEntity[],
  alerts: AppointmentAlertEntity[],
  nowEpochMs: number,
  lookAheadDays = 30
): ScheduledAlertSpec[] {
  const alertsByAppt = new Map<number, AppointmentAlertEntity[]>();
  for (const al of alerts) {
    const list = alertsByAppt.get(al.appointmentId) ?? [];
    list.push(al);
    alertsByAppt.set(al.appointmentId, list);
  }

  const result: ScheduledAlertSpec[] = [];
  const baseDate = new Date(nowEpochMs);

  for (const appt of appointments) {
    if (appt.isCancelled) continue;
    const apptAlerts = (alertsByAppt.get(appt.id) ?? []).filter((a) => a.isEnabled);
    if (apptAlerts.length === 0) continue;

    const upcomingDates: string[] = [];
    for (let dayOffset = 0; dayOffset <= lookAheadDays; dayOffset++) {
      const check = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate() + dayOffset
      );
      const dateStr = dateToDateString(check);
      if (isOccurrenceOnDate(appt, dateStr)) {
        upcomingDates.push(dateStr);
        if (upcomingDates.length >= MAX_OCCURRENCES_PER_APPOINTMENT) break;
      }
    }

    if (upcomingDates.length === 0) continue;

    for (const alert of apptAlerts) {
      let scheduledForThisAlert = 0;
      for (const dateStr of upcomingDates) {
        const triggerMs = computeAlertTriggerEpoch(dateStr, appt.startTime, alert);
        if (triggerMs === null || triggerMs <= nowEpochMs) continue;

        const resolvedPath =
          alert.customAudioPath?.trim() ||
          (alert.soundMode === 'custom_file' ? appt.customAudioPath?.trim() : null) ||
          null;

        result.push({
          alertId: alert.id,
          appointmentId: appt.id,
          occurrenceIndex: scheduledForThisAlert,
          triggerEpochMs: triggerMs,
          occurrenceDateStr: dateStr,
          title: appt.title,
          subtitle: formatOffsetLabelAr(alert),
          scheduledTimeText: `${appt.startTime} (${dateStr})`,
          soundMode: alert.soundMode,
          customAudioPath: resolvedPath,
          isVibrationEnabled: alert.isVibrationEnabled,
        });
        scheduledForThisAlert++;
        if (scheduledForThisAlert >= MAX_OCCURRENCES_PER_APPOINTMENT) break;
      }
    }
  }

  return result.sort((a, b) => a.triggerEpochMs - b.triggerEpochMs);
}
