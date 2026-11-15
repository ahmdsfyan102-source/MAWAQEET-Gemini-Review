import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  formatGregorianAr,
  GREGORIAN_MONTHS_AR,
  toHijri,
  WEEKDAYS_AR,
} from '../domain/hijriCalendar';
import { calculateKafrElSheikh, PRAYER_NAMES_AR } from '../domain/prayerCalculator';
import {
  getEventsForDate,
  parseDateString,
  toDateString,
  CATEGORY_LABELS_AR,
} from '../domain/recurrenceEngine';
import { useMawaqeet } from '../state/MawaqeetContext';
import type { PrayerKey } from '../types/models';

type CalendarMode = 'monthly' | 'weekly' | 'daily';

export const CalendarScreen: React.FC = () => {
  const {
    state,
    clock,
    toggleTask,
    saveNote,
    deleteNote,
    setActiveScreen,
  } = useMawaqeet();

  const [mode, setMode] = useState<CalendarMode>('monthly');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(clock.todayDateStr);

  const selectedDate = useMemo(
    () => parseDateString(selectedDateStr) ?? new Date(),
    [selectedDateStr]
  );

  const selYear = selectedDate.getFullYear();
  const selMonth = selectedDate.getMonth() + 1;
  const selDay = selectedDate.getDate();

  const selectedHijri = useMemo(
    () => toHijri(selYear, selMonth, selDay, state.prayerConfig.hijriDayOffset),
    [selYear, selMonth, selDay, state.prayerConfig.hijriDayOffset]
  );

  const selectedPrayers = useMemo(() => {
    const cfg = state.prayerConfig;
    const utcOffset = cfg.timeMode === 'summer' ? 3 : 2;
    return calculateKafrElSheikh(selYear, selMonth, selDay, utcOffset, {
      fajr: cfg.fajrOffset,
      sunrise: cfg.sunriseOffset,
      dhuhr: cfg.dhuhrOffset,
      asr: cfg.asrOffset,
      maghrib: cfg.maghribOffset,
      isha: cfg.ishaOffset,
    });
  }, [selYear, selMonth, selDay, state.prayerConfig]);

  const monthCells = useMemo(() => {
    const firstOfMonth = new Date(selYear, selMonth - 1, 1);
    const startDow = firstOfMonth.getDay();
    const daysInMonth = new Date(selYear, selMonth, 0).getDate();
    const cells: Array<{ dateStr: string; dayNum: number; hijriDay: number } | null> = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = toDateString(selYear, selMonth, d);
      const h = toHijri(selYear, selMonth, d, state.prayerConfig.hijriDayOffset);
      cells.push({ dateStr: ds, dayNum: d, hijriDay: h.day });
    }
    return cells;
  }, [selYear, selMonth, state.prayerConfig.hijriDayOffset]);

  const weekCells = useMemo(() => {
    const dow = selectedDate.getDay();
    const start = new Date(selYear, selMonth - 1, selDay - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const ds = toDateString(d.getFullYear(), d.getMonth() + 1, d.getDate());
      const h = toHijri(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
        state.prayerConfig.hijriDayOffset
      );
      return {
        dateStr: ds,
        dayNum: d.getDate(),
        weekday: WEEKDAYS_AR[d.getDay()],
        hijriDay: h.day,
      };
    });
  }, [selectedDate, selYear, selMonth, selDay, state.prayerConfig.hijriDayOffset]);

  const navigateStep = (delta: number) => {
    if (mode === 'monthly') {
      const d = new Date(selYear, selMonth - 1 + delta, 1);
      setSelectedDateStr(toDateString(d.getFullYear(), d.getMonth() + 1, d.getDate()));
    } else if (mode === 'weekly') {
      const d = new Date(selYear, selMonth - 1, selDay + delta * 7);
      setSelectedDateStr(toDateString(d.getFullYear(), d.getMonth() + 1, d.getDate()));
    } else {
      const d = new Date(selYear, selMonth - 1, selDay + delta);
      setSelectedDateStr(toDateString(d.getFullYear(), d.getMonth() + 1, d.getDate()));
    }
  };

  const dayEvents = useMemo(
    () => getEventsForDate(state.appointments, selectedDateStr),
    [state.appointments, selectedDateStr]
  );
  const dayTasks = useMemo(
    () => state.tasks.filter((t) => t.date === selectedDateStr),
    [state.tasks, selectedDateStr]
  );
  const existingNote = useMemo(
    () => state.notes.find((n) => n.date === selectedDateStr) ?? null,
    [state.notes, selectedDateStr]
  );

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSyncedDate, setNoteSyncedDate] = useState('');

  if (noteSyncedDate !== selectedDateStr) {
    setNoteSyncedDate(selectedDateStr);
    setNoteTitle(existingNote?.title ?? '');
    setNoteContent(existingNote?.content ?? '');
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-xl bg-[#EADCC8]/70 dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546]">
          {(
            [
              { id: 'monthly', label: 'شهري' },
              { id: 'weekly', label: 'أسبوعي' },
              { id: 'daily', label: 'يومي' },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-bold cursor-pointer ${
                mode === id
                  ? 'bg-[#527D68] text-[#F5EBDD]'
                  : 'text-[#34483D] dark:text-[#F5EBDD]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateStep(-1)}
            aria-label="السابق"
            className="min-w-[40px] min-h-[40px] rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="text-center px-2">
            <p className="text-sm font-bold text-[#34483D] dark:text-[#F5EBDD]">
              {GREGORIAN_MONTHS_AR[selMonth - 1]} {selYear}
            </p>
            <p className="text-xs text-[#527D68] dark:text-[#98C4AD] font-semibold">
              {selectedHijri.monthNameAr} {selectedHijri.year} هـ
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateStep(1)}
            aria-label="التالي"
            className="min-w-[40px] min-h-[40px] rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedDateStr(clock.todayDateStr)}
            className="min-h-[40px] px-3 rounded-xl bg-[#527D68]/15 text-[#34483D] dark:text-[#F5EBDD] text-xs font-bold cursor-pointer"
          >
            اليوم
          </button>
        </div>
      </section>

      {mode === 'monthly' && (
        <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-4 space-y-2">
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-[#51665A] dark:text-[#B5C4BC] pb-1">
            {WEEKDAYS_AR.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {monthCells.map((cell, idx) => {
              if (!cell) return <div key={`empty_${idx}`} className="min-h-[60px]" />;
              const isSelected = cell.dateStr === selectedDateStr;
              const isToday = cell.dateStr === clock.todayDateStr;
              const hasEvent =
                getEventsForDate(state.appointments, cell.dateStr).length > 0 ||
                state.tasks.some((t) => t.date === cell.dateStr);
              const hasNote = state.notes.some((n) => n.date === cell.dateStr);

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[60px] rounded-xl p-1.5 flex flex-col items-center justify-between border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#527D68] text-[#F5EBDD] border-[#527D68]'
                      : isToday
                      ? 'bg-[#EADCC8]/70 dark:bg-[#2F4237] border-[#527D68] text-[#34483D] dark:text-[#F5EBDD]'
                      : 'bg-[#F5EBDD]/40 dark:bg-[#1E2B24]/60 border-[#D6C6A8]/50 dark:border-[#3D5546]/60 text-[#34483D] dark:text-[#F5EBDD] hover:border-[#527D68]'
                  }`}
                >
                  <span className="font-clock text-sm font-bold">{cell.dayNum}</span>
                  <span
                    className={`text-[11px] font-clock ${
                      isSelected ? 'text-[#F5EBDD]/85' : 'text-[#51665A] dark:text-[#B5C4BC]'
                    }`}
                  >
                    {cell.hijriDay} هـ
                  </span>
                  <span className="h-1.5 flex items-center gap-1">
                    {hasEvent && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-[#F5EBDD]' : 'bg-[#527D68]'
                        }`}
                      />
                    )}
                    {hasNote && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-[#D6C6A8]' : 'bg-[#9C7A3C]'
                        }`}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {mode === 'weekly' && (
        <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-4 grid grid-cols-2 sm:grid-cols-7 gap-2">
          {weekCells.map((cell) => {
            const isSelected = cell.dateStr === selectedDateStr;
            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`min-h-[76px] rounded-xl p-2 flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#527D68] text-[#F5EBDD] border-[#527D68]'
                    : 'bg-[#F5EBDD]/50 dark:bg-[#1E2B24] border-[#D6C6A8] dark:border-[#3D5546]'
                }`}
              >
                <span className="text-xs font-semibold">{cell.weekday}</span>
                <span className="font-clock text-lg font-bold">{cell.dayNum}</span>
                <span className="text-[11px] opacity-80">{cell.hijriDay} هـ</span>
              </button>
            );
          })}
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-4">
          <section className="rounded-2xl bg-[#34483D] dark:bg-[#2F4237] text-[#F5EBDD] p-5 space-y-3">
            <div>
              <p className="text-lg font-bold">{selectedHijri.formatted}</p>
              <p className="text-xs text-[#D6C6A8]">
                {formatGregorianAr(selYear, selMonth, selDay)} · مواقيت كفر الشيخ لهذا اليوم
              </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerKey[]).map((k) => (
                <div
                  key={k}
                  className="rounded-xl bg-[#F5EBDD]/10 p-2 text-center space-y-0.5"
                >
                  <p className="text-[11px] text-[#D6C6A8]">{PRAYER_NAMES_AR[k]}</p>
                  <p className="font-clock text-xs font-bold">
                    {selectedPrayers.formattedTimes[k]}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
                مواعيد اليوم ({dayEvents.length})
              </h2>
              <button
                type="button"
                onClick={() => setActiveScreen('appointments')}
                className="text-xs font-bold text-[#527D68] dark:text-[#98C4AD] inline-flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إدارة المواعيد</span>
              </button>
            </div>
            {dayEvents.length === 0 ? (
              <p className="text-sm text-[#51665A] dark:text-[#B5C4BC]">
                لا توجد مواعيد مسجلة في هذا اليوم.
              </p>
            ) : (
              <div className="space-y-2">
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl bg-[#F5EBDD]/60 dark:bg-[#1E2B24] px-3.5 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#34483D] dark:text-[#F5EBDD]">
                        {ev.title}
                      </p>
                      <p className="text-xs text-[#51665A] dark:text-[#B5C4BC]">
                        {CATEGORY_LABELS_AR[ev.category]}
                        {ev.location ? ` · ${ev.location}` : ''}
                      </p>
                    </div>
                    <span className="font-clock text-xs font-bold text-[#527D68] dark:text-[#98C4AD]">
                      {ev.startTime} – {ev.endTime}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {dayTasks.length > 0 && (
              <div className="pt-3 border-t border-[#D6C6A8]/60 dark:border-[#3D5546] space-y-2">
                <h3 className="text-sm font-bold text-[#34483D] dark:text-[#F5EBDD]">
                  مهام اليوم ({dayTasks.length})
                </h3>
                {dayTasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTask(t)}
                    className="w-full rounded-xl bg-[#F5EBDD]/60 dark:bg-[#1E2B24] px-3 py-2 flex items-center gap-2.5 text-right cursor-pointer"
                  >
                    <span
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        t.isCompleted
                          ? 'bg-[#527D68] border-[#527D68] text-[#F5EBDD]'
                          : 'border-[#527D68]'
                      }`}
                    >
                      {t.isCompleted && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <span className={`text-sm ${t.isCompleted ? 'line-through opacity-70' : ''}`}>
                      {t.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="lg:col-span-5 rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-3 h-fit">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
              <FileText className="w-4 h-4 text-[#527D68]" />
              <span>ملاحظات يوم {selectedDateStr}</span>
            </div>
            {existingNote && (
              <button
                type="button"
                onClick={() => {
                  deleteNote(existingNote);
                  setNoteTitle('');
                  setNoteContent('');
                }}
                aria-label="حذف الملاحظة"
                className="min-w-[36px] min-h-[36px] rounded-xl text-[#B0413E] hover:bg-[#B0413E]/10 flex items-center justify-center cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!noteTitle.trim() && !noteContent.trim()) return;
              saveNote({
                id: existingNote?.id,
                date: selectedDateStr,
                title: noteTitle.trim() || `ملاحظة ${selectedDateStr}`,
                content: noteContent.trim(),
              });
            }}
            className="space-y-3"
          >
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="عنوان الملاحظة..."
              className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
            />
            <textarea
              rows={5}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="دوّن خواطرك أو فوائد الدرس أو مهامك..."
              className="w-full p-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
            />
            <button
              type="submit"
              className="w-full min-h-[44px] rounded-xl bg-[#527D68] hover:bg-[#426956] text-[#F5EBDD] text-sm font-bold cursor-pointer"
            >
              حفظ الملاحظة
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
