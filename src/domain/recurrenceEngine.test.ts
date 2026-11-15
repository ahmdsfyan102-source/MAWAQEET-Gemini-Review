import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectConflict,
  getNextUpcomingLesson,
  isOccurrenceOnDate,
} from './recurrenceEngine';
import type { AppointmentEntity } from '../types/models';

const baseAppt: AppointmentEntity = {
  id: 1,
  title: 'درس التفسير',
  category: 'lesson',
  startDate: '2026-04-03',
  startTime: '17:00',
  endTime: '18:00',
  recurrenceType: 'weekly',
  isCompleted: false,
  isCancelled: false,
  createdAt: 1,
  cancelledDatesJson: JSON.stringify(['2026-04-10']),
};

test('Weekly recurrence skips cancelled single occurrence date', () => {
  assert.equal(isOccurrenceOnDate(baseAppt, '2026-04-03'), true);
  assert.equal(isOccurrenceOnDate(baseAppt, '2026-04-10'), false);
  assert.equal(isOccurrenceOnDate(baseAppt, '2026-04-17'), true);
});

test('Conflict detection catches overlapping interval on active date', () => {
  const conflict = detectConflict([baseAppt], '2026-04-17', '17:30', '18:30');
  assert.equal(conflict?.id, 1);
  const noConflict = detectConflict([baseAppt], '2026-04-10', '17:30', '18:30');
  assert.equal(noConflict, null);
});

test('getNextUpcomingLesson filters category == lesson and skips past times', () => {
  const personal: AppointmentEntity = {
    ...baseAppt,
    id: 2,
    title: 'موعد شخصي',
    category: 'personal',
    startTime: '15:00',
    endTime: '15:30',
  };
  const now = new Date(2026, 3, 3, 14, 0, 0).getTime();
  const next = getNextUpcomingLesson([personal, baseAppt], now);
  assert.equal(next?.appointment.id, 1);
});
