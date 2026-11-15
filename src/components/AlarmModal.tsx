import React from 'react';
import { AlarmClock, BellOff, Clock } from 'lucide-react';
import { useMawaqeet } from '../state/MawaqeetContext';

export const AlarmModal: React.FC = () => {
  const { activeAlarm, state, dismissActiveAlarm, snoozeActiveAlarm } = useMawaqeet();
  if (!activeAlarm) return null;

  const defaultSnooze = state.prayerConfig.defaultSnoozeMinutes;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alarm-modal-title"
      className="fixed inset-0 z-50 bg-[#1E2B24]/92 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md rounded-3xl bg-[#34483D] border border-[#D6C6A8]/40 text-[#F5EBDD] p-7 space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#D6C6A8]/20 text-[#D6C6A8] mx-auto flex items-center justify-center">
          <AlarmClock className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#D6C6A8]">
            مَواقيت · كفر الشيخ
          </p>
          <h2 id="alarm-modal-title" className="text-2xl font-bold leading-snug">
            {activeAlarm.title}
          </h2>
          {activeAlarm.subtitle && (
            <p className="text-sm text-[#F5EBDD]/85">{activeAlarm.subtitle}</p>
          )}
          <p className="font-clock text-sm text-[#D6C6A8] pt-1">
            {activeAlarm.scheduledTime}
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={dismissActiveAlarm}
            className="w-full min-h-[48px] rounded-2xl bg-[#D6C6A8] hover:bg-[#cbb894] text-[#34483D] font-bold text-base inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <BellOff className="w-5 h-5" aria-hidden="true" />
            <span>إيقاف المنبه</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            {[5, defaultSnooze, 15]
              .filter((v, idx, arr) => arr.indexOf(v) === idx)
              .map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => snoozeActiveAlarm(mins)}
                  className="min-h-[42px] rounded-xl border border-[#D6C6A8]/40 hover:bg-[#F5EBDD]/10 text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>غفوة {mins} د</span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
