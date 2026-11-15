import type {
  NextPrayerSummary,
  PrayerKey,
  PrayerTimesOutput,
} from '../types/models';

export const KAFR_EL_SHEIKH_LATITUDE = 31.1107;
export const KAFR_EL_SHEIKH_LONGITUDE = 30.9398;
export const FAJR_ANGLE = 19.5;
export const ISHA_ANGLE = 17.5;
export const ASR_SHADOW_FACTOR = 1.0;

export const PRAYER_NAMES_AR: Record<PrayerKey, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

const PRAYER_SEQUENCE: PrayerKey[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

function d2r(d: number): number {
  return (d * Math.PI) / 180.0;
}

function r2d(r: number): number {
  return (r * 180.0) / Math.PI;
}

function sinD(d: number): number {
  return Math.sin(d2r(d));
}

function cosD(d: number): number {
  return Math.cos(d2r(d));
}

function tanD(d: number): number {
  return Math.tan(d2r(d));
}

function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}

function arccosD(x: number): number {
  return r2d(Math.acos(clamp(x, -1.0, 1.0)));
}

function arcsinD(x: number): number {
  return r2d(Math.asin(clamp(x, -1.0, 1.0)));
}

function fixHour(h: number): number {
  let a = h % 24.0;
  if (a < 0) a += 24.0;
  return a;
}

function getJulianDay(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100.0);
  const b = 2 - a + Math.floor(a / 4.0);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5
  );
}

function sunPosition(julianDay: number): { declination: number; eqt: number } {
  const d = julianDay - 2451545.0;
  const g = (357.529 + 0.98560028 * d) % 360.0;
  const q = (280.459 + 0.98564736 * d) % 360.0;
  const l = (q + 1.915 * sinD(g) + 0.02 * sinD(2 * g)) % 360.0;
  const e = 23.439 - 0.00000036 * d;

  const declination = arcsinD(sinD(e) * sinD(l));
  const ra = r2d(Math.atan2(cosD(e) * sinD(l), cosD(l))) / 15.0;
  const eqt = (q / 15.0 - fixHour(ra)) * 60.0;
  return { declination, eqt };
}

function hourAngle(lat: number, decl: number, angle: number): number {
  const cosHa = (-sinD(angle) - sinD(lat) * sinD(decl)) / (cosD(lat) * cosD(decl));
  if (cosHa > 1.0) return 0.0;
  if (cosHa < -1.0) return 180.0;
  return arccosD(cosHa);
}

function asrHourAngle(lat: number, decl: number, shadowFactor = 1.0): number {
  const d = Math.abs(lat - decl);
  const acot = (x: number) => Math.PI / 2 - Math.atan(x);
  const alt = r2d(acot(shadowFactor + tanD(d)));
  const cosHa = (sinD(alt) - sinD(lat) * sinD(decl)) / (cosD(lat) * cosD(decl));
  return arccosD(cosHa);
}

export function getLocalDateTimeParts(
  nowEpochMs: number,
  utcOffsetHours: number
): { year: number; month: number; day: number } {
  const shifted = new Date(nowEpochMs + utcOffsetHours * 3600_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function formatTime12ArFromEpoch(
  epochMs: number,
  utcOffsetHours: number,
  withSeconds = false
): string {
  const shifted = new Date(epochMs + utcOffsetHours * 3600_000);
  const h24 = shifted.getUTCHours();
  const m = shifted.getUTCMinutes();
  const s = shifted.getUTCSeconds();
  const isPm = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const periodAr = isPm ? 'م' : 'ص';
  const mm = String(m).padStart(2, '0');
  if (withSeconds) {
    const ss = String(s).padStart(2, '0');
    return `${h12}:${mm}:${ss} ${periodAr}`;
  }
  return `${h12}:${mm} ${periodAr}`;
}

export function calculateKafrElSheikh(
  year: number,
  month: number,
  day: number,
  utcOffsetHours = 2,
  offsets: Partial<Record<PrayerKey, number>> = {}
): PrayerTimesOutput {
  const lat = KAFR_EL_SHEIKH_LATITUDE;
  const lng = KAFR_EL_SHEIKH_LONGITUDE;

  const jd = getJulianDay(year, month, day);
  const { declination, eqt } = sunPosition(jd);

  const solarNoon = fixHour(12.0 + utcOffsetHours - lng / 15.0 - eqt / 60.0);
  const dhuhrHours = solarNoon + 2.0 / 60.0;

  const sunRadiusAngle = 0.833;
  const haSun = hourAngle(lat, declination, sunRadiusAngle) / 15.0;
  const sunriseHours = solarNoon - haSun;
  const sunsetHours = solarNoon + haSun;

  const haFajr = hourAngle(lat, declination, FAJR_ANGLE) / 15.0;
  const fajrHours = solarNoon - haFajr;

  const haAsr = asrHourAngle(lat, declination, ASR_SHADOW_FACTOR) / 15.0;
  const asrHours = solarNoon + haAsr;

  const maghribHours = sunsetHours;

  const haIsha = hourAngle(lat, declination, ISHA_ANGLE) / 15.0;
  const ishaHours = solarNoon + haIsha;

  const utcEpochMs = {} as Record<PrayerKey, number>;
  const formattedTimes = {} as Record<PrayerKey, string>;

  const utcMidnight = Date.UTC(year, month - 1, day, 0, 0, 0, 0);

  const makeInstant = (prayerKey: PrayerKey, decimalHours: number) => {
    const offsetMinutes = offsets[prayerKey] ?? 0;
    const totalMinutes = Math.round(decimalHours * 60.0) + offsetMinutes;
    const totalUtcMinutes = totalMinutes - utcOffsetHours * 60;
    const epochMs = utcMidnight + totalUtcMinutes * 60_000;
    utcEpochMs[prayerKey] = epochMs;
    formattedTimes[prayerKey] = formatTime12ArFromEpoch(epochMs, utcOffsetHours, false);
  };

  makeInstant('fajr', fajrHours);
  makeInstant('sunrise', sunriseHours);
  makeInstant('dhuhr', dhuhrHours);
  makeInstant('asr', asrHours);
  makeInstant('maghrib', maghribHours);
  makeInstant('isha', ishaHours);

  return { utcEpochMs, formattedTimes };
}

export function getNextPrayer(
  nowEpochMs: number,
  todayPrayers: PrayerTimesOutput,
  tomorrowPrayers: PrayerTimesOutput
): NextPrayerSummary {
  for (let i = 0; i < PRAYER_SEQUENCE.length; i++) {
    const key = PRAYER_SEQUENCE[i];
    const epoch = todayPrayers.utcEpochMs[key];
    if (epoch !== undefined && nowEpochMs < epoch) {
      const prevKey: PrayerKey = i > 0 ? PRAYER_SEQUENCE[i - 1] : 'isha';
      const prevEpoch =
        i > 0
          ? todayPrayers.utcEpochMs[prevKey] ?? epoch - 6 * 3600_000
          : (todayPrayers.utcEpochMs.fajr ?? epoch) - 6 * 3600_000;
      const span = Math.max(1, epoch - prevEpoch);
      const elapsed = clamp(nowEpochMs - prevEpoch, 0, span);
      const pct = clamp(Math.floor((elapsed * 100) / span), 0, 100);
      return {
        nextPrayerKey: key,
        nextPrayerNameAr: PRAYER_NAMES_AR[key],
        nextPrayerFormatted: todayPrayers.formattedTimes[key] ?? '',
        nextPrayerEpochMs: epoch,
        millisRemaining: epoch - nowEpochMs,
        progressPercent: pct,
        currentPrayerKey: prevKey,
        currentPrayerNameAr: PRAYER_NAMES_AR[prevKey],
      };
    }
  }

  const ishaMs = todayPrayers.utcEpochMs.isha ?? nowEpochMs;
  const tomorrowFajrMs = tomorrowPrayers.utcEpochMs.fajr ?? nowEpochMs + 6 * 3600_000;
  const span = Math.max(1, tomorrowFajrMs - ishaMs);
  const elapsed = clamp(nowEpochMs - ishaMs, 0, span);
  const pct = clamp(Math.floor((elapsed * 100) / span), 0, 100);

  return {
    nextPrayerKey: 'fajr',
    nextPrayerNameAr: PRAYER_NAMES_AR.fajr,
    nextPrayerFormatted: tomorrowPrayers.formattedTimes.fajr ?? '',
    nextPrayerEpochMs: tomorrowFajrMs,
    millisRemaining: Math.max(0, tomorrowFajrMs - nowEpochMs),
    progressPercent: pct,
    currentPrayerKey: 'isha',
    currentPrayerNameAr: PRAYER_NAMES_AR.isha,
  };
}

export function calculateKafrElSheikhQibla(): number {
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;
  const phi1 = d2r(KAFR_EL_SHEIKH_LATITUDE);
  const phi2 = d2r(kaabaLat);
  const deltaLambda = d2r(kaabaLng - KAFR_EL_SHEIKH_LONGITUDE);

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);
  return (r2d(Math.atan2(y, x)) + 360.0) % 360.0;
}

export function formatLocalClock(nowEpochMs: number, utcOffsetHours: number): string {
  return formatTime12ArFromEpoch(nowEpochMs, utcOffsetHours, true);
}

export function formatCountdownDuration(millis: number): string {
  const totalSec = Math.max(0, Math.floor(millis / 1000));
  const days = Math.floor(totalSec / 86_400);
  const remDay = totalSec % 86_400;
  const h = Math.floor(remDay / 3600);
  const m = Math.floor((remDay % 3600) / 60);
  const s = remDay % 60;
  const hms = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return days > 0 ? `${days} يوم · ${hms}` : hms;
}
