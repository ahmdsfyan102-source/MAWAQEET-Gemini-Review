import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  MapPin,
} from 'lucide-react';
import { formatCountdownDuration } from '../domain/prayerCalculator';
import { CATEGORY_LABELS_AR } from '../domain/recurrenceEngine';
import { useMawaqeet } from '../state/MawaqeetContext';
import type { PrayerKey } from '../types/models';

export const HomeScreen: React.FC = () => {
  const {
    state,
    clock,
    nextUpcomingEvent,
    nextUpcomingLesson,
    setActiveScreen,
    toggleTask,
    markAppointmentCompleted,
  } = useMawaqeet();

  // Strictly starts on Card 1 (index 0) on every open
  const [heroPage, setHeroPage] = useState<number>(0);

  const enabledAlertCount = state.prayerRules.filter((r) => r.isEnabled).length;
  const adhkarDone = state.dhikrItems.filter((d) => d.isCompleted).length;
  const adhkarTotal = state.dhikrItems.length;
  const todayTasks = state.tasks.filter((t) => t.date === clock.todayDateStr);

  const prayerItems: Array<{ key: PrayerKey; label: string }> = [
    { key: 'fajr', label: 'الفجر' },
    { key: 'sunrise', label: 'الشروق (تنبيه مستقل)' },
    { key: 'dhuhr', label: 'الظهر' },
    { key: 'asr', label: 'العصر' },
    { key: 'maghrib', label: 'المغرب' },
    { key: 'isha', label: 'العشاء' },
  ];

  const remLessonMs = nextUpcomingLesson
    ? Math.max(0, nextUpcomingLesson.startEpochMs - clock.nowEpochMs)
    : 0;
  const nextPrayerCountdown = formatCountdownDuration(clock.nextPrayer.millisRemaining);

  return (
    <div className="space-y-5">
      {/* 1. Hero Area: Three-Card Carousel + 3 Position Indicator Dots */}
      <section aria-label="البطاقات الرئيسية" className="space-y-3">
        <div className="relative">
          {heroPage === 0 && (
            <div className="rounded-3xl bg-[#34483D] dark:bg-[#2F4237] text-[#F5EBDD] p-6 min-h-[192px] flex flex-col justify-between gap-3 border border-[#D6C6A8]/20">
              <div className="flex items-center justify-between gap-4 text-xs text-[#D6C6A8]">
                <span className="font-semibold">اليوم والوقت الحالي</span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>كفر الشيخ، مصر</span>
                </span>
              </div>

              <div className="font-clock text-4xl sm:text-5xl font-bold tracking-tight text-[#F5EBDD]">
                {clock.localClockText}
              </div>

              <div className="space-y-1">
                <p className="text-lg font-bold text-[#D6C6A8]">{clock.hijriDate.formatted}</p>
                <p className="text-xs sm:text-sm text-[#F5EBDD]/90">
                  {clock.gregorianDateAr} ·{' '}
                  {state.prayerConfig.timeMode === 'summer'
                    ? 'التوقيت الصيفي (UTC+3)'
                    : 'التوقيت الشتوي (UTC+2)'}
                </p>
              </div>
            </div>
          )}

          {heroPage === 1 && (
            <div className="rounded-3xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-6 min-h-[192px] flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 text-[#527D68] dark:text-[#98C4AD] font-bold text-sm">
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  <span>الدرس القادم</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveScreen('appointments')}
                  className="min-h-[36px] px-2 text-xs font-semibold text-[#527D68] dark:text-[#98C4AD] hover:underline cursor-pointer"
                >
                  عرض الدروس
                </button>
              </div>

              {nextUpcomingLesson ? (
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-[#34483D] dark:text-[#F5EBDD] line-clamp-2">
                    {nextUpcomingLesson.appointment.title}
                  </h2>
                  <p className="text-sm text-[#51665A] dark:text-[#B5C4BC]">
                    التاريخ: {nextUpcomingLesson.dateStr} · يبدأ الساعة:{' '}
                    <span className="font-clock">{nextUpcomingLesson.appointment.startTime}</span>
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-[#51665A] dark:text-[#B5C4BC]">
                      المتبقي على الدرس
                    </span>
                    <span className="font-clock text-lg font-bold text-[#527D68] dark:text-[#98C4AD]">
                      {formatCountdownDuration(remLessonMs)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 my-auto">
                  <h2 className="text-xl font-bold text-[#34483D] dark:text-[#F5EBDD]">
                    لا توجد دروس قادمة
                  </h2>
                  <p className="text-sm text-[#51665A] dark:text-[#B5C4BC]">
                    يمكنك إضافة الدروس العلمية من تبويب المواعيد.
                  </p>
                </div>
              )}
            </div>
          )}

          {heroPage === 2 && (
            <div className="rounded-3xl bg-[#34483D] dark:bg-[#2F4237] text-[#F5EBDD] p-6 min-h-[192px] flex flex-col justify-between gap-3 border border-[#D6C6A8]/20">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-[#D6C6A8]">
                  الصلاة القادمة بكفر الشيخ
                </span>
                <span className="text-xs text-[#D6C6A8]">
                  تنبيهات مفعلة: {enabledAlertCount} من 6
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#F5EBDD]">
                    {clock.nextPrayer.nextPrayerNameAr}
                  </h2>
                  <p className="font-clock text-sm text-[#D6C6A8] mt-0.5">
                    الأذان: {clock.nextPrayer.nextPrayerFormatted}
                  </p>
                </div>
                <div className="text-left">
                  <span className="text-xs text-[#D6C6A8] block">المتبقي</span>
                  <span className="font-clock text-2xl sm:text-3xl font-bold text-[#F5EBDD]">
                    {nextPrayerCountdown}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="w-full h-2 rounded-full bg-[#F5EBDD]/20 overflow-hidden">
                  <div
                    className="h-full bg-[#D6C6A8] transition-all"
                    style={{ width: `${clock.nextPrayer.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#D6C6A8]">
                  <span>الفترة الحالية: {clock.nextPrayer.currentPrayerNameAr}</span>
                  <span className="font-clock">{clock.nextPrayer.progressPercent}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Carousel Dots + Prev/Next Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setHeroPage((p) => (p === 0 ? 2 : p - 1))}
            aria-label="البطاقة السابقة"
            className="min-w-[36px] min-h-[36px] rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] bg-[#FBF6EE] dark:bg-[#27382E] flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label="ترتيب البطاقات">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={heroPage === idx}
                aria-label={`البطاقة ${idx + 1}`}
                onClick={() => setHeroPage(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  heroPage === idx
                    ? 'w-7 bg-[#527D68]'
                    : 'w-2.5 bg-[#D6C6A8] dark:bg-[#3D5546]'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setHeroPage((p) => (p + 1) % 3)}
            aria-label="البطاقة التالية"
            className="min-w-[36px] min-h-[36px] rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] bg-[#FBF6EE] dark:bg-[#27382E] flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 2. Today's 6 Prayer Times Grid */}
      <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
            مواقيت الصلاة اليوم — كفر الشيخ
          </h2>
          <button
            type="button"
            onClick={() => setActiveScreen('prayers')}
            className="text-xs font-bold text-[#527D68] dark:text-[#98C4AD] hover:underline cursor-pointer"
          >
            التفاصيل والأذان
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {prayerItems.map(({ key, label }) => {
            const isNext = clock.nextPrayer.nextPrayerKey === key;
            return (
              <div
                key={key}
                className={`rounded-xl p-3 border text-center space-y-1 ${
                  isNext
                    ? 'bg-[#527D68] text-[#F5EBDD] border-[#527D68]'
                    : 'bg-[#F5EBDD]/60 dark:bg-[#1E2B24] border-[#D6C6A8]/70 dark:border-[#3D5546]'
                }`}
              >
                <p className={`text-xs font-semibold ${isNext ? 'text-[#F5EBDD]' : 'text-[#51665A] dark:text-[#B5C4BC]'}`}>
                  {label}
                </p>
                <p className="font-clock text-sm font-bold">
                  {clock.todayPrayers.formattedTimes[key]}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Adhkar Summary + Next Appointment Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
              الأذكار والسبحة
            </h2>
            <p className="text-sm text-[#51665A] dark:text-[#B5C4BC]">
              المكتمل اليوم: <span className="font-clock font-bold">{adhkarDone}</span> من{' '}
              <span className="font-clock font-bold">{adhkarTotal}</span> ذكراً · السبحة:{' '}
              <span className="font-clock font-bold">{state.tasbeehState.currentCount}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveScreen('adhkar')}
            className="self-start min-h-[40px] px-4 rounded-xl bg-[#527D68] hover:bg-[#426956] text-[#F5EBDD] text-xs font-bold cursor-pointer"
          >
            فتح أقسام الأذكار
          </button>
        </section>

        <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
                الموعد القادم
              </h2>
              <Calendar className="w-4 h-4 text-[#527D68]" aria-hidden="true" />
            </div>
            {nextUpcomingEvent ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#34483D] dark:text-[#F5EBDD]">
                  {nextUpcomingEvent.appointment.title}
                </p>
                <p className="text-xs text-[#51665A] dark:text-[#B5C4BC]">
                  {CATEGORY_LABELS_AR[nextUpcomingEvent.appointment.category]} ·{' '}
                  <span className="font-clock">
                    {nextUpcomingEvent.dateStr} {nextUpcomingEvent.appointment.startTime}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#51665A] dark:text-[#B5C4BC]">
                لا توجد مواعيد قادمة مجدولة.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveScreen('appointments')}
              className="min-h-[40px] px-4 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-bold cursor-pointer"
            >
              إدارة المواعيد
            </button>
            {nextUpcomingEvent && (
              <button
                type="button"
                onClick={() =>
                  markAppointmentCompleted(
                    nextUpcomingEvent.appointment,
                    nextUpcomingEvent.dateStr
                  )
                }
                className="min-h-[40px] px-3 rounded-xl bg-[#527D68]/15 text-xs font-bold text-[#34483D] dark:text-[#F5EBDD] cursor-pointer"
              >
                تسجيل إنجاز
              </button>
            )}
          </div>
        </section>
      </div>

      {/* 4. Today's Tasks */}
      <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
            مهام اليوم ({todayTasks.length})
          </h2>
          <button
            type="button"
            onClick={() => setActiveScreen('appointments')}
            className="text-xs font-bold text-[#527D68] dark:text-[#98C4AD] hover:underline cursor-pointer"
          >
            إضافة مهمة
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <p className="text-sm text-[#51665A] dark:text-[#B5C4BC]">
            لا توجد مهام مسجلة لتاريخ اليوم ({clock.todayDateStr}).
          </p>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTask(t)}
                className="w-full rounded-xl bg-[#F5EBDD]/60 dark:bg-[#1E2B24] px-3.5 py-2.5 flex items-center gap-3 text-right cursor-pointer"
              >
                {t.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-[#527D68] shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-[#51665A] shrink-0" />
                )}
                <span className={`text-sm ${t.isCompleted ? 'line-through opacity-65' : 'font-semibold'}`}>
                  {t.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
