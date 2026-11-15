import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateKafrElSheikh,
  calculateKafrElSheikhQibla,
  getNextPrayer,
} from './prayerCalculator';

test('Kafr El-Sheikh prayer times order and format in winter (UTC+2)', () => {
  const out = calculateKafrElSheikh(2026, 3, 21, 2);
  assert.ok(out.utcEpochMs.fajr < out.utcEpochMs.sunrise);
  assert.ok(out.utcEpochMs.sunrise < out.utcEpochMs.dhuhr);
  assert.ok(out.utcEpochMs.dhuhr < out.utcEpochMs.asr);
  assert.ok(out.utcEpochMs.asr < out.utcEpochMs.maghrib);
  assert.ok(out.utcEpochMs.maghrib < out.utcEpochMs.isha);
  assert.match(out.formattedTimes.fajr, /ص$/);
  assert.match(out.formattedTimes.maghrib, /م$/);
});

test('Summer mode (UTC+3) shifts all prayer timestamps by +60 minutes in formatted local clock', () => {
  const winter = calculateKafrElSheikh(2026, 5, 1, 2);
  const summer = calculateKafrElSheikh(2026, 5, 1, 3);
  assert.notEqual(winter.formattedTimes.dhuhr, summer.formattedTimes.dhuhr);
  assert.equal(summer.utcEpochMs.dhuhr, winter.utcEpochMs.dhuhr);
});

test('getNextPrayer rolls over to tomorrow Fajr after today Isha', () => {
  const today = calculateKafrElSheikh(2026, 3, 21, 2);
  const tomorrow = calculateKafrElSheikh(2026, 3, 22, 2);
  const afterIsha = today.utcEpochMs.isha + 10 * 60_000;
  const next = getNextPrayer(afterIsha, today, tomorrow);
  assert.equal(next.nextPrayerKey, 'fajr');
  assert.equal(next.nextPrayerEpochMs, tomorrow.utcEpochMs.fajr);
});

test('Qibla bearing from Kafr El-Sheikh is approx 138.5 degrees SE', () => {
  const bearing = calculateKafrElSheikhQibla();
  assert.ok(bearing > 136 && bearing < 141);
});
