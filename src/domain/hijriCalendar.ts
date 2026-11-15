import type { HijriDateInfo } from '../types/models';

export const HIJRI_MONTHS_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

export const GREGORIAN_MONTHS_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export const WEEKDAYS_AR = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export function toHijri(
  year: number,
  month1Based: number,
  day: number,
  hijriDayOffset = 0
): HijriDateInfo {
  const greg = new Date(Date.UTC(year, month1Based - 1, day + hijriDayOffset, 12, 0, 0));

  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      timeZone: 'UTC',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).formatToParts(greg);

    const hDay = Number(parts.find((p) => p.type === 'day')?.value ?? 1);
    const hMonth1 = Number(parts.find((p) => p.type === 'month')?.value ?? 1);
    const hYear = Number(parts.find((p) => p.type === 'year')?.value ?? 1448);

    const monthIndex = Math.max(0, Math.min(11, hMonth1 - 1));
    const monthNameAr = HIJRI_MONTHS_AR[monthIndex] ?? HIJRI_MONTHS_AR[0];

    return {
      day: hDay,
      monthIndex,
      monthNameAr,
      year: hYear,
      formatted: `${hDay} ${monthNameAr} ${hYear} هـ`,
    };
  } catch {
    const jd = Math.floor(greg.getTime() / 86400000) + 2440588;
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j =
      Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
      Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 =
      l2 -
      Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
      Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
      29;
    const hMonth1 = Math.floor((24 * l3) / 709);
    const hDay = l3 - Math.floor((709 * hMonth1) / 24);
    const hYear = 30 * n + j - 30;
    const monthIndex = Math.max(0, Math.min(11, hMonth1 - 1));
    const monthNameAr = HIJRI_MONTHS_AR[monthIndex] ?? HIJRI_MONTHS_AR[0];

    return {
      day: hDay,
      monthIndex,
      monthNameAr,
      year: hYear,
      formatted: `${hDay} ${monthNameAr} ${hYear} هـ`,
    };
  }
}

export function formatGregorianAr(year: number, month1Based: number, day: number): string {
  const date = new Date(Date.UTC(year, month1Based - 1, day, 12, 0, 0));
  const dow = date.getUTCDay();
  const weekday = WEEKDAYS_AR[dow] ?? '';
  const monthName = GREGORIAN_MONTHS_AR[month1Based - 1] ?? '';
  return `${weekday}، ${day} ${monthName} ${year}`;
}
