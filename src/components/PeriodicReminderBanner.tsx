import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { useMawaqeet } from '../state/MawaqeetContext';

export const PeriodicReminderBanner: React.FC = () => {
  const { periodicBanner, dismissPeriodicBanner } = useMawaqeet();
  if (!periodicBanner) return null;

  return (
    <div
      role="status"
      className="mb-4 rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#527D68] p-4 flex items-center justify-between gap-3"
    >
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-xl bg-[#527D68]/15 text-[#527D68] dark:text-[#98C4AD] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
        </span>
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-[#527D68] dark:text-[#98C4AD]">
            وَاذْكُرُوا اللَّهَ
          </p>
          <p className="text-sm font-semibold text-[#34483D] dark:text-[#F5EBDD]">
            {periodicBanner.textAr}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={dismissPeriodicBanner}
        aria-label="إغلاق التذكير"
        className="min-w-[38px] min-h-[38px] rounded-xl hover:bg-[#EADCC8]/50 dark:hover:bg-[#2F4237] flex items-center justify-center cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
