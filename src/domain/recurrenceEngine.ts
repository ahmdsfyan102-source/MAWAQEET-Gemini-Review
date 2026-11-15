import type { AppointmentCategory, AppointmentEntity } from '../types/models';

export interface UpcomingOccurrence {
  appointment: AppointmentEntity;
  dateStr: string;
  startEpochMs: number;
}

export const CATEGORY_LABELS_AR: Record<AppointmentCategory, string> = {
  lesson: 'درس علم / تحفيظ',
  lecture: 'محاضرة',
  personal: 'موعد شخصي',
  work: 'عمل ومذاكرة',
  family: 'التزام عائلي',
  other: 'أخرى',
};

export function toDateString(year: number, month1Based: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month1Based).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function dateToDateString(d: Date): string {
  return toDateString(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function parseDateString(dateStr: string): Date | null {
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function parseJsonStringList(json?: string | null): string[] {
  if (!json || !json.trim()) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function toJsonStringList(items: string[]): string {
  return JSON.stringify(Array.from(new Set(items)));
}

export function parseCustomDays(json?: string | null): number[] {
  if (!json || !json.trim()) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed)
      ? parsed.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
      : [];
  } catch {
    return [];
  }
}

export function toCustomDaysJson(days: number[]): string {
  const uniqueSorted = Array.from(new Set(days)).sort((a, b) => a - b);
  return JSON.stringify(uniqueSorted);
}

export function isOccurrenceOnDate(
  appointment: AppointmentEntity,
  targetDateStr: string
): boolean {
  if (appointment.isCancelled) return false;
  const cancelledDates = parseJsonStringList(appointment.cancelledDatesJson);
  if (cancelledDates.includes(targetDateStr)) return false;

  if (targetDateStr < appointment.startDate) return false;
  const endDate = appointment.recurrenceEndDate;
  if (endDate && endDate.trim() && targetDateStr > endDate.trim()) return false;

  const startDate = parseDateString(appointment.startDate);
  const targetDate = parseDateString(targetDateStr);
  if (!startDate || !targetDate) return false;

  switch (appointment.recurrenceType) {
    case 'none':
      return appointment.startDate === targetDateStr;
    case 'daily':
      return true;
    case 'weekly':
      return targetDate.getDay() === startDate.getDay();
    case 'custom_days': {
      const allowedDays = parseCustomDays(appointment.customDaysJson);
      return allowedDays.includes(targetDate.getDay());
    }
    case 'monthly':
      return targetDate.getDate() === startDate.getDate();
    default:
      return false;
  }
}

export function getEventsForDate(
  appointments: AppointmentEntity[],
  targetDateStr: string
): AppointmentEntity[] {
  return appointments
    .filter((appt) => isOccurrenceOnDate(appt, targetDateStr))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function detectConflict(
  existingAppointments: AppointmentEntity[],
  candidateDate: string,
  candidateStartTime: string,
  candidateEndTime: string,
  excludeId?: number | null
): AppointmentEntity | null {
  return (
    existingAppointments.find((existing) => {
      if (excludeId !== undefined && excludeId !== null && existing.id === excludeId) {
        return false;
      }
      if (!isOccurrenceOnDate(existing, candidateDate)) return false;
      return candidateStartTime < existing.endTime && existing.startTime < candidateEndTime;
    }) ?? null
  );
}

export function computeStartEpochMs(dateStr: string, timeStr: string): number | null {
  const d = parseDateString(dateStr);
  if (!d) return null;
  const parts = timeStr.trim().split(':');
  if (parts.length !== 2) return null;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return null;
  }
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

export function getNextUpcomingOccurrence(
  appointments: AppointmentEntity[],
  nowEpochMs = Date.now(),
  lookAheadDays = 14
): UpcomingOccurrence | null {
  const base = new Date(nowEpochMs);
  for (let offset = 0; offset <= lookAheadDays; offset++) {
    const check = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
    const dateStr = dateToDateString(check);
    const dayEvents = getEventsForDate(appointments, dateStr);
    for (const appt of dayEvents) {
      const startMs = computeStartEpochMs(dateStr, appt.startTime);
      if (startMs !== null && startMs > nowEpochMs) {
        return { appointment: appt, dateStr, startEpochMs: startMs };
      }
    }
  }
  return null;
}

export function getNextUpcomingLesson(
  appointments: AppointmentEntity[],
  nowEpochMs = Date.now(),
  lookAheadDays = 30
): UpcomingOccurrence | null {
  const lessonsOnly = appointments.filter((a) => a.category === 'lesson' && !a.isCancelled);
  if (lessonsOnly.length === 0) return null;
  return getNextUpcomingOccurrence(lessonsOnly, nowEpochMs, lookAheadDays);
}
