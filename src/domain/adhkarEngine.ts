import type {
  AdhkarCollectionType,
  CustomDhikrReminderEntity,
  DhikrItemEntity,
} from '../types/models';
import {
  parseSubCounters,
  serializeSubCounters,
} from './adhkarData';

export function incrementDhikr(
  item: DhikrItemEntity,
  subKey?: string | null
): DhikrItemEntity {
  if (item.isCompleted) return item;

  const subs = parseSubCounters(item.subCountersJson);
  if (subs.length > 0) {
    const targetSub = subKey
      ? subs.find((s) => s.key === subKey && s.current < s.target)
      : subs.find((s) => s.current < s.target);
    if (!targetSub) return item;

    const updatedSubs = subs.map((sub) =>
      sub.key === targetSub.key
        ? { ...sub, current: Math.min(sub.target, sub.current + 1) }
        : sub
    );
    const sumCurrent = updatedSubs.reduce((acc, s) => acc + s.current, 0);
    const sumTarget = Math.max(
      1,
      updatedSubs.reduce((acc, s) => acc + s.target, 0)
    );
    const allDone = updatedSubs.every((s) => s.current >= s.target);
    return {
      ...item,
      currentCount: sumCurrent,
      targetCount: sumTarget,
      isCompleted: allDone,
      subCountersJson: serializeSubCounters(updatedSubs),
    };
  }

  const safeTarget = Math.max(1, item.targetCount);
  const nextCount = Math.min(safeTarget, item.currentCount + 1);
  return {
    ...item,
    currentCount: nextCount,
    isCompleted: nextCount >= safeTarget,
  };
}

export function resetItemProgress(item: DhikrItemEntity): DhikrItemEntity {
  const subs = parseSubCounters(item.subCountersJson);
  const resetSubsJson =
    subs.length > 0
      ? serializeSubCounters(subs.map((s) => ({ ...s, current: 0 })))
      : item.subCountersJson;
  return {
    ...item,
    currentCount: 0,
    isCompleted: false,
    subCountersJson: resetSubsJson,
  };
}

export function switchAlternativeCount(item: DhikrItemEntity): DhikrItemEntity {
  if (item.alternativeCount === null || item.alternativeCount === undefined) {
    return item;
  }
  const nextTarget = Math.max(1, item.alternativeCount);
  const nextAlt = Math.max(1, item.targetCount);
  const nextCurrent = Math.min(nextTarget, item.currentCount);
  return {
    ...item,
    targetCount: nextTarget,
    alternativeCount: nextAlt,
    currentCount: nextCurrent,
    isCompleted: nextCurrent >= nextTarget,
  };
}

export function activeVisibleCards(
  items: DhikrItemEntity[],
  collectionType: AdhkarCollectionType
): DhikrItemEntity[] {
  return items
    .filter((i) => i.collectionType === collectionType && !i.isCompleted && !i.isHidden)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function nextSequentialReminder(
  reminders: CustomDhikrReminderEntity[],
  currentIndex: number
): { chosen: CustomDhikrReminderEntity | null; nextIndex: number } {
  const enabled = reminders
    .filter((r) => r.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (enabled.length === 0) return { chosen: null, nextIndex: 0 };
  const safeIdx = ((currentIndex % enabled.length) + enabled.length) % enabled.length;
  return {
    chosen: enabled[safeIdx],
    nextIndex: (safeIdx + 1) % enabled.length,
  };
}
