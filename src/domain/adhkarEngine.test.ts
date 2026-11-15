import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultCustomReminders,
  defaultDhikrItems,
  parseSubCounters,
} from './adhkarData';
import {
  activeVisibleCards,
  incrementDhikr,
  nextSequentialReminder,
  switchAlternativeCount,
} from './adhkarEngine';

test('Approved Adhkar counts match specification (25/23/14/4) and full Surah texts', () => {
  const items = defaultDhikrItems();
  assert.equal(items.filter((i) => i.collectionType === 'morning').length, 25);
  assert.equal(items.filter((i) => i.collectionType === 'evening').length, 23);
  assert.equal(items.filter((i) => i.collectionType === 'sleep').length, 14);
  assert.equal(items.filter((i) => i.collectionType === 'wakeup').length, 4);

  const sajdah = items.find((i) => i.stableKey === 'sleep_12');
  const mulk = items.find((i) => i.stableKey === 'sleep_13');
  assert.ok(sajdah && sajdah.textAr.includes('(30)'));
  assert.ok(mulk && mulk.textAr.includes('(30)'));
});

test('Sleep #8 grouped tasbeeh requires all 3 independent sub-counters (33/33/34)', () => {
  const items = defaultDhikrItems();
  let tasbeeh = items.find((i) => i.stableKey === 'sleep_08')!;
  for (let i = 0; i < 33; i++) tasbeeh = incrementDhikr(tasbeeh, 'subhanallah');
  for (let i = 0; i < 33; i++) tasbeeh = incrementDhikr(tasbeeh, 'alhamdulillah');
  assert.equal(tasbeeh.isCompleted, false);
  for (let i = 0; i < 34; i++) tasbeeh = incrementDhikr(tasbeeh, 'allahuakbar');
  assert.equal(tasbeeh.isCompleted, true);
  const subs = parseSubCounters(tasbeeh.subCountersJson);
  assert.equal(subs.reduce((s, c) => s + c.current, 0), 100);
});

test('Dhikr #20 switches cleanly between 10 and 1 without altering collection', () => {
  const items = defaultDhikrItems();
  const d20 = items.find((i) => i.stableKey === 'morning_20')!;
  assert.equal(d20.targetCount, 10);
  const switched = switchAlternativeCount(d20);
  assert.equal(switched.targetCount, 1);
  assert.equal(switched.alternativeCount, 10);
});

test('Completed card disappears from activeVisibleCards', () => {
  const items = defaultDhikrItems();
  const m1 = items.find((i) => i.stableKey === 'morning_01')!;
  const updated = items.map((x) => (x.id === m1.id ? incrementDhikr(x) : x));
  const active = activeVisibleCards(updated, 'morning');
  assert.equal(active.length, 24);
});

test('Sequential reminders advance deterministically in order and wrap around', () => {
  const reminders = defaultCustomReminders();
  const r0 = nextSequentialReminder(reminders, 0);
  assert.equal(r0.chosen?.id, 1);
  assert.equal(r0.nextIndex, 1);
  const rWrap = nextSequentialReminder(reminders, reminders.length - 1);
  assert.equal(rWrap.chosen?.id, reminders[reminders.length - 1].id);
  assert.equal(rWrap.nextIndex, 0);
});
