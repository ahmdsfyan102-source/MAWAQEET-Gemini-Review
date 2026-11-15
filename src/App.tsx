import React, { useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  CalendarClock,
  Clock,
  Home,
  Settings,
  X,
} from 'lucide-react';
import { AlarmModal } from './components/AlarmModal';
import { PeriodicReminderBanner } from './components/PeriodicReminderBanner';
import { AdhkarScreen } from './screens/AdhkarScreen';
import { AppointmentsScreen } from './screens/AppointmentsScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { HomeScreen } from './screens/HomeScreen';
import { PrayerScreen } from './screens/PrayerScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { MawaqeetProvider, useMawaqeet } from './state/MawaqeetContext';
import type { ScreenRoute } from './types/models';

const NAV_ITEMS: Array<{
  route: ScreenRoute;
  label: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { route: 'home', label: 'الرئيسية', icon: Home },
  { route: 'prayers', label: 'الصلاة', icon: Clock },
  { route: 'appointments', label: 'المواعيد', icon: CalendarClock },
  { route: 'calendar', label: 'التقويم', icon: Calendar },
  { route: 'adhkar', label: 'الأذكار', icon: BookOpen },
  { route: 'settings', label: 'الإعدادات', icon: Settings },
];

const MawaqeetShell: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    statusMessage,
    clearStatusMessage,
    clock,
    state,
  } = useMawaqeet();

  useEffect(() => {
    if (!statusMessage) return;
    const id = window.setTimeout(clearStatusMessage, 4500);
    return () => window.clearTimeout(id);
  }, [statusMessage, clearStatusMessage]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5EBDD] dark:bg-[#1E2B24] text-[#34483D] dark:text-[#F5EBDD]">
      <header className="sticky top-0 z-30 bg-[#FBF6EE]/95 dark:bg-[#27382E]/95 backdrop-blur border-b border-[#D6C6A8] dark:border-[#3D5546]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/icon.jpg"
              alt="شعار مَواقيت"
              className="w-9 h-9 rounded-xl object-cover border border-[#D6C6A8]"
            />
            <div>
              <span className="text-lg font-bold tracking-tight block leading-none">
                مَواقيت
              </span>
              <span className="text-[11px] text-[#51665A] dark:text-[#B5C4BC]">
                كفر الشيخ ·{' '}
                {state.prayerConfig.timeMode === 'summer' ? 'صيفي' : 'شتوي'}
              </span>
            </div>
          </div>

          <nav
            aria-label="التنقل الرئيسي"
            className="hidden md:flex items-center gap-1"
          >
            {NAV_ITEMS.map(({ route, label, icon: Icon }) => {
              const active = activeScreen === route;
              return (
                <button
                  key={route}
                  type="button"
                  onClick={() => setActiveScreen(route)}
                  aria-current={active ? 'page' : undefined}
                  className={`min-h-[40px] px-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#527D68] text-[#F5EBDD]'
                      : 'text-[#34483D] dark:text-[#F5EBDD] hover:bg-[#EADCC8]/60 dark:hover:bg-[#2F4237]'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="font-clock text-xs sm:text-sm font-bold text-[#527D68] dark:text-[#98C4AD] whitespace-nowrap">
            {clock.localClockText}
          </div>
        </div>
      </header>

      <main
        className="flex-1 max-w-6xl w-full mx-auto px-4 pt-5 pb-24 md:pb-10"
        style={{ zoom: 'var(--card-scale, 1)' }}
      >
        <PeriodicReminderBanner />

        {statusMessage && (
          <div
            role="status"
            className="mb-4 rounded-2xl bg-[#34483D] dark:bg-[#2F4237] text-[#F5EBDD] px-4 py-3 text-sm font-semibold flex items-center justify-between gap-3 border border-[#D6C6A8]/30"
          >
            <span>{statusMessage}</span>
            <button
              type="button"
              onClick={clearStatusMessage}
              aria-label="إغلاق الرسالة"
              className="p-1 rounded-lg hover:bg-[#F5EBDD]/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeScreen === 'home' && <HomeScreen />}
        {activeScreen === 'prayers' && <PrayerScreen />}
        {activeScreen === 'appointments' && <AppointmentsScreen />}
        {activeScreen === 'calendar' && <CalendarScreen />}
        {activeScreen === 'adhkar' && <AdhkarScreen />}
        {activeScreen === 'settings' && <SettingsScreen />}
      </main>

      <nav
        aria-label="التنقل السفلي"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FBF6EE]/95 dark:bg-[#27382E]/95 backdrop-blur border-t border-[#D6C6A8] dark:border-[#3D5546] grid grid-cols-6"
      >
        {NAV_ITEMS.map(({ route, label, icon: Icon }) => {
          const active = activeScreen === route;
          return (
            <button
              key={route}
              type="button"
              onClick={() => setActiveScreen(route)}
              aria-current={active ? 'page' : undefined}
              className={`min-h-[58px] py-1.5 flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition cursor-pointer ${
                active
                  ? 'text-[#527D68] dark:text-[#98C4AD] bg-[#527D68]/10'
                  : 'text-[#51665A] dark:text-[#B5C4BC]'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span className="truncate max-w-full px-0.5">{label}</span>
            </button>
          );
        })}
      </nav>

      <AlarmModal />
    </div>
  );
};

export function App() {
  return (
    <MawaqeetProvider>
      <MawaqeetShell />
    </MawaqeetProvider>
  );
}

export default App;
