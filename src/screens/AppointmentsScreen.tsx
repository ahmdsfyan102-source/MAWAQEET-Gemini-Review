import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardList,
  Edit3,
  History,
  Layers,
  MapPin,
  Play,
  Plus,
  Repeat,
  Search,
  Square,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { AudioFileManager } from '../audio/audioManager';
import {
  CATEGORY_LABELS_AR,
  detectConflict,
  parseCustomDays,
  toCustomDaysJson,
} from '../domain/recurrenceEngine';
import { formatOffsetLabelAr } from '../domain/schedulePlanner';
import { useMawaqeet } from '../state/MawaqeetContext';
import type {
  AppointmentCategory,
  AppointmentEntity,
  AppointmentTemplateEntity,
  RecurrenceType,
  SoundMode,
  TaskPriority,
} from '../types/models';

type SubTab = 'appointments' | 'tasks' | 'templates' | 'history';

interface DraftAlertItem {
  id?: number;
  triggerType: 'offset' | 'custom_time';
  minutesOffset: number;
  customTimeHHmm: string;
  soundMode: SoundMode;
  customAudioPath?: string | null;
  isVibrationEnabled: boolean;
  isEnabled: boolean;
}

const WEEKDAY_OPTIONS = [
  { day: 6, label: 'السبت' },
  { day: 0, label: 'الأحد' },
  { day: 1, label: 'الاثنين' },
  { day: 2, label: 'الثلاثاء' },
  { day: 3, label: 'الأربعاء' },
  { day: 4, label: 'الخميس' },
  { day: 5, label: 'الجمعة' },
];

const OFFSET_PRESETS = [0, -5, -10, -15, -30, -60, -120, -1440];

function addMinutesToHHmm(timeHHmm: string, durationMinutes: number): string {
  const [hStr, mStr] = timeHHmm.split(':');
  const total = ((Number(hStr) || 0) * 60 + (Number(mStr) || 0) + durationMinutes) % (24 * 60);
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export const AppointmentsScreen: React.FC = () => {
  const {
    state,
    clock,
    saveAppointmentWithAlerts,
    deleteAppointmentSeries,
    cancelSingleOccurrence,
    editSingleOccurrenceWithAlerts,
    markAppointmentCompleted,
    saveTask,
    toggleTask,
    deleteTask,
    saveTemplate,
    deleteTemplate,
    clearHistory,
    clearNotificationLogs,
    importCustomAudioFile,
  } = useMawaqeet();

  const [subTab, setSubTab] = useState<SubTab>('appointments');
  const [searchQuery, setSearchQuery] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentEntity | null>(null);
  const [singleOccurrenceDate, setSingleOccurrenceDate] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AppointmentCategory>('lesson');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(clock.todayDateStr);
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:00');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [alerts, setAlerts] = useState<DraftAlertItem[]>([]);
  const [previewAlertIdx, setPreviewAlertIdx] = useState<number | null>(null);

  const [conflictAppt, setConflictAppt] = useState<AppointmentEntity | null>(null);
  const [scopeDialog, setScopeDialog] = useState<{
    mode: 'edit' | 'delete';
    appointment: AppointmentEntity;
  } | null>(null);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(clock.todayDateStr);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');

  const [tmplModalOpen, setTmplModalOpen] = useState(false);
  const [tmplTitle, setTmplTitle] = useState('');
  const [tmplCategory, setTmplCategory] = useState<AppointmentCategory>('lesson');
  const [tmplLocation, setTmplLocation] = useState('');
  const [tmplDuration, setTmplDuration] = useState(60);

  const openNewAppointment = (
    prefill?: Partial<{
      title: string;
      description: string;
      category: AppointmentCategory;
      location: string;
      durationMinutes: number;
    }>
  ) => {
    setEditingAppointment(null);
    setSingleOccurrenceDate(null);
    setTitle(prefill?.title ?? '');
    setDescription(prefill?.description ?? '');
    setCategory(prefill?.category ?? 'lesson');
    setLocation(prefill?.location ?? '');
    setStartDate(clock.todayDateStr);
    const defaultStart = '16:00';
    setStartTime(defaultStart);
    setEndTime(addMinutesToHHmm(defaultStart, prefill?.durationMinutes ?? 60));
    setRecurrenceType('none');
    setCustomDays([]);
    setRecurrenceEndDate('');
    setAlerts([
      {
        triggerType: 'offset',
        minutesOffset: -15,
        customTimeHHmm: '15:45',
        soundMode: 'chime_gentle',
        customAudioPath: null,
        isVibrationEnabled: true,
        isEnabled: true,
      },
    ]);
    setConflictAppt(null);
    setFormOpen(true);
  };

  const openEditAppointment = (appt: AppointmentEntity, singleDate: string | null = null) => {
    const existingAlerts = state.appointmentAlerts
      .filter((a) => a.appointmentId === appt.id)
      .map<DraftAlertItem>((a) => ({
        id: singleDate ? undefined : a.id,
        triggerType: a.triggerType,
        minutesOffset: a.minutesOffset,
        customTimeHHmm: a.customTimeHHmm || appt.startTime,
        soundMode: a.soundMode,
        customAudioPath: a.customAudioPath ?? null,
        isVibrationEnabled: a.isVibrationEnabled,
        isEnabled: a.isEnabled,
      }));

    setEditingAppointment(appt);
    setSingleOccurrenceDate(singleDate);
    setTitle(appt.title);
    setDescription(appt.description ?? '');
    setCategory(appt.category);
    setLocation(appt.location ?? '');
    setStartDate(singleDate ?? appt.startDate);
    setStartTime(appt.startTime);
    setEndTime(appt.endTime);
    setRecurrenceType(singleDate ? 'none' : appt.recurrenceType);
    setCustomDays(singleDate ? [] : parseCustomDays(appt.customDaysJson));
    setRecurrenceEndDate(singleDate ? '' : appt.recurrenceEndDate ?? '');
    setAlerts(existingAlerts);
    setConflictAppt(null);
    setFormOpen(true);
  };

  const commitSaveAppointment = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const payload = {
      id: singleOccurrenceDate ? undefined : editingAppointment?.id,
      title: cleanTitle,
      description: description.trim() || null,
      category,
      location: location.trim() || null,
      notes: editingAppointment?.notes ?? null,
      startDate,
      startTime,
      endTime: endTime > startTime ? endTime : addMinutesToHHmm(startTime, 60),
      recurrenceType: singleOccurrenceDate ? 'none' : recurrenceType,
      customDaysJson:
        !singleOccurrenceDate && recurrenceType === 'custom_days'
          ? toCustomDaysJson(customDays)
          : null,
      recurrenceEndDate:
        !singleOccurrenceDate && recurrenceType !== 'none' && recurrenceEndDate.trim()
          ? recurrenceEndDate.trim()
          : null,
      customAudioPath: null,
      isCompleted: editingAppointment?.isCompleted ?? false,
      isCancelled: false,
      cancelledDatesJson: singleOccurrenceDate ? null : editingAppointment?.cancelledDatesJson ?? null,
      completedDatesJson: singleOccurrenceDate ? null : editingAppointment?.completedDatesJson ?? null,
      createdAt: editingAppointment?.createdAt,
    };

    const mappedAlerts = alerts.map((al) => ({
      id: al.id,
      minutesOffset: al.minutesOffset,
      triggerType: al.triggerType,
      customTimeHHmm: al.triggerType === 'custom_time' ? al.customTimeHHmm : null,
      label:
        al.triggerType === 'custom_time'
          ? `وقت مخصص ${al.customTimeHHmm}`
          : formatOffsetLabelAr({
              triggerType: 'offset',
              minutesOffset: al.minutesOffset,
              customTimeHHmm: null,
              label: null,
            }),
      soundUri: null,
      customAudioPath: al.customAudioPath ?? null,
      soundMode: al.soundMode,
      isVibrationEnabled: al.isVibrationEnabled,
      isEnabled: al.isEnabled,
    }));

    if (singleOccurrenceDate && editingAppointment) {
      editSingleOccurrenceWithAlerts(
        editingAppointment,
        singleOccurrenceDate,
        payload,
        mappedAlerts
      );
    } else {
      saveAppointmentWithAlerts(payload, mappedAlerts);
    }

    AudioFileManager.stopAudio();
    setPreviewAlertIdx(null);
    setConflictAppt(null);
    setFormOpen(false);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const conflict = detectConflict(
      state.appointments,
      startDate,
      startTime,
      endTime > startTime ? endTime : addMinutesToHHmm(startTime, 60),
      singleOccurrenceDate ? null : editingAppointment?.id ?? null
    );
    if (conflict && !conflictAppt) {
      setConflictAppt(conflict);
      return;
    }
    commitSaveAppointment();
  };

  const filteredAppointments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.appointments
      .filter((a) => !a.isCancelled)
      .filter((a) => {
        if (!q) return true;
        return (
          a.title.toLowerCase().includes(q) ||
          (a.description ?? '').toLowerCase().includes(q) ||
          (a.location ?? '').toLowerCase().includes(q) ||
          CATEGORY_LABELS_AR[a.category].toLowerCase().includes(q)
        );
      })
      .sort((a, b) => `${a.startDate} ${a.startTime}`.localeCompare(`${b.startDate} ${b.startTime}`));
  }, [state.appointments, searchQuery]);

  const recurrenceLabel = (r: RecurrenceType): string => {
    switch (r) {
      case 'none':
        return 'مرة واحدة';
      case 'daily':
        return 'يومياً';
      case 'weekly':
        return 'أسبوعياً';
      case 'custom_days':
        return 'أيام محددة';
      case 'monthly':
        return 'شهرياً';
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="أقسام المواعيد"
          className="inline-flex flex-wrap gap-1.5 p-1 rounded-2xl bg-[#EADCC8]/70 dark:bg-[#2F4237] border border-[#D6C6A8] dark:border-[#3D5546]"
        >
          {(
            [
              { id: 'appointments', label: 'المواعيد والدروس', icon: CalendarClock },
              { id: 'tasks', label: 'المهام اليومية', icon: ClipboardList },
              { id: 'templates', label: 'النماذج', icon: Layers },
              { id: 'history', label: 'السجل والتوثيق', icon: History },
            ] as const
          ).map(({ id, label, icon: Icon }) => {
            const active = subTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSubTab(id)}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#527D68] text-[#F5EBDD]'
                    : 'text-[#34483D] dark:text-[#F5EBDD] hover:bg-[#FBF6EE]/60 dark:hover:bg-[#27382E]'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {subTab === 'appointments' && (
          <button
            type="button"
            onClick={() => openNewAppointment()}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#527D68] hover:bg-[#426956] text-[#F5EBDD] text-sm font-bold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>إضافة موعد / درس</span>
          </button>
        )}
      </div>

      {subTab === 'appointments' && (
        <div className="space-y-4">
          <div className="relative">
            <Search
              className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#51665A] dark:text-[#B5C4BC]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المواعيد أو الدروس أو الأماكن..."
              className="w-full min-h-[46px] pr-10 pl-4 rounded-xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] text-sm text-[#34483D] dark:text-[#F5EBDD] placeholder:text-[#51665A]/70 focus:outline-none focus:ring-2 focus:ring-[#527D68]"
            />
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-8 text-center space-y-2">
              <p className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
                لا توجد مواعيد أو دروس مسجلة حالياً
              </p>
              <p className="text-sm text-[#51665A] dark:text-[#B5C4BC]">
                أضف موعداً جديداً أو استخدم أحد النماذج الجاهزة مع تنبيهات متعددة مستقلة.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAppointments.map((appt) => {
                const apptAlerts = state.appointmentAlerts.filter(
                  (al) => al.appointmentId === appt.id && al.isEnabled
                );
                return (
                  <article
                    key={appt.id}
                    className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-[#527D68] dark:text-[#98C4AD]">
                            {CATEGORY_LABELS_AR[appt.category]}
                          </span>
                          <h2 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
                            {appt.title}
                          </h2>
                        </div>
                        <span className="font-clock text-sm font-bold text-[#34483D] dark:text-[#F5EBDD] whitespace-nowrap">
                          {appt.startTime} – {appt.endTime}
                        </span>
                      </div>

                      {appt.description && (
                        <p className="text-sm text-[#51665A] dark:text-[#B5C4BC]">
                          {appt.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#51665A] dark:text-[#B5C4BC]">
                        <span className="font-clock">التاريخ: {appt.startDate}</span>
                        <span className="inline-flex items-center gap-1">
                          <Repeat className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{recurrenceLabel(appt.recurrenceType)}</span>
                        </span>
                        {appt.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{appt.location}</span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 font-semibold text-[#527D68] dark:text-[#98C4AD]">
                          <Bell className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>
                            {apptAlerts.length === 0
                              ? 'دون تنبيهات'
                              : `${apptAlerts.length} تنبيهات مفعلة`}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D6C6A8]/60 dark:border-[#3D5546]">
                      <button
                        type="button"
                        onClick={() => markAppointmentCompleted(appt, clock.todayDateStr)}
                        className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#527D68]/15 text-[#34483D] dark:text-[#F5EBDD] hover:bg-[#527D68]/25 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>إنجاز</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (appt.recurrenceType !== 'none') {
                            setScopeDialog({ mode: 'edit', appointment: appt });
                          } else {
                            openEditAppointment(appt);
                          }
                        }}
                        className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-[#34483D] dark:text-[#F5EBDD] hover:bg-[#EADCC8]/50 dark:hover:bg-[#2F4237] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (appt.recurrenceType !== 'none') {
                            setScopeDialog({ mode: 'delete', appointment: appt });
                          } else {
                            deleteAppointmentSeries(appt);
                          }
                        }}
                        className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#B0413E]/30 text-[#B0413E] dark:text-[#E28A87] hover:bg-[#B0413E]/10 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {subTab === 'tasks' && (
        <div className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!taskTitle.trim()) return;
              saveTask({
                title: taskTitle.trim(),
                description: null,
                date: taskDate,
                isCompleted: false,
                priority: taskPriority,
              });
              setTaskTitle('');
            }}
            className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          >
            <div className="md:col-span-5 space-y-1">
              <label className="text-xs font-bold text-[#34483D] dark:text-[#F5EBDD]">
                عنوان المهمة اليومية
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="مثال: مراجعة ورد الحفظ اليومي"
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm text-[#34483D] dark:text-[#F5EBDD]"
              />
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-bold text-[#34483D] dark:text-[#F5EBDD]">
                التاريخ
              </label>
              <input
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-clock text-[#34483D] dark:text-[#F5EBDD]"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-[#34483D] dark:text-[#F5EBDD]">
                الأولوية
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm text-[#34483D] dark:text-[#F5EBDD]"
              >
                <option value="high">عالية</option>
                <option value="medium">متوسطة</option>
                <option value="low">عادية</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full min-h-[44px] px-4 rounded-xl bg-[#527D68] hover:bg-[#426956] text-[#F5EBDD] text-sm font-bold cursor-pointer"
              >
                إضافة مهمة
              </button>
            </div>
          </form>

          {state.tasks.length === 0 ? (
            <div className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-8 text-center text-sm text-[#51665A] dark:text-[#B5C4BC]">
              لا توجد مهام مسجلة حالياً.
            </div>
          ) : (
            <div className="space-y-2.5">
              {state.tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] px-4 py-3 flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task)}
                    className="flex items-center gap-3 text-right flex-1 min-h-[40px] cursor-pointer"
                  >
                    <span
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${
                        task.isCompleted
                          ? 'bg-[#527D68] border-[#527D68] text-[#F5EBDD]'
                          : 'border-[#527D68]'
                      }`}
                    >
                      {task.isCompleted && <Check className="w-4 h-4" aria-hidden="true" />}
                    </span>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          task.isCompleted
                            ? 'line-through text-[#51665A] dark:text-[#B5C4BC]'
                            : 'text-[#34483D] dark:text-[#F5EBDD]'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-[#51665A] dark:text-[#B5C4BC] font-clock">
                        {task.date} ·{' '}
                        {task.priority === 'high'
                          ? 'أولوية عالية'
                          : task.priority === 'medium'
                          ? 'متوسطة'
                          : 'عادية'}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTask(task)}
                    aria-label={`حذف ${task.title}`}
                    className="min-w-[40px] min-h-[40px] rounded-xl text-[#B0413E] dark:text-[#E28A87] hover:bg-[#B0413E]/10 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setTmplTitle('');
                setTmplCategory('lesson');
                setTmplLocation('');
                setTmplDuration(60);
                setTmplModalOpen(true);
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#527D68] hover:bg-[#426956] text-[#F5EBDD] text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>نموذج جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.templates.map((tmpl: AppointmentTemplateEntity) => (
              <div
                key={tmpl.id}
                className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#527D68] dark:text-[#98C4AD]">
                    {CATEGORY_LABELS_AR[tmpl.category]} · {tmpl.durationMinutes} دقيقة
                  </span>
                  <h3 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
                    {tmpl.title}
                  </h3>
                  {tmpl.location && (
                    <p className="text-xs text-[#51665A] dark:text-[#B5C4BC]">{tmpl.location}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#D6C6A8]/60 dark:border-[#3D5546]">
                  <button
                    type="button"
                    onClick={() => {
                      setSubTab('appointments');
                      openNewAppointment({
                        title: tmpl.title,
                        description: tmpl.description ?? '',
                        category: tmpl.category,
                        location: tmpl.location ?? '',
                        durationMinutes: tmpl.durationMinutes,
                      });
                    }}
                    className="min-h-[40px] px-4 py-1.5 rounded-xl bg-[#527D68] hover:bg-[#426956] text-[#F5EBDD] text-xs font-bold cursor-pointer"
                  >
                    استخدام النموذج
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTemplate(tmpl)}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-[#B0413E] dark:text-[#E28A87] text-xs font-semibold cursor-pointer"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
                سجل الإنجاز والإلغاء ({state.historyRecords.length})
              </h2>
              {state.historyRecords.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs font-semibold text-[#B0413E] dark:text-[#E28A87] hover:underline cursor-pointer"
                >
                  مسح السجل
                </button>
              )}
            </div>
            {state.historyRecords.length === 0 ? (
              <p className="text-sm text-[#51665A] dark:text-[#B5C4BC]">لا توجد سجلات بعد.</p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto">
                {state.historyRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-xl bg-[#F5EBDD]/70 dark:bg-[#1E2B24] p-3 text-sm flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-[#34483D] dark:text-[#F5EBDD]">
                        {rec.eventTitle}
                      </p>
                      <p className="text-xs text-[#51665A] dark:text-[#B5C4BC]">
                        {rec.actionType === 'completed'
                          ? 'تم الإنجاز'
                          : rec.actionType === 'cancelled'
                          ? 'ملغى'
                          : 'تم إغلاق التنبيه'}{' '}
                        · {rec.scheduledDate} {rec.scheduledTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
                توثيق التنبيهات ({state.notificationLogs.length})
              </h2>
              {state.notificationLogs.length > 0 && (
                <button
                  type="button"
                  onClick={clearNotificationLogs}
                  className="text-xs font-semibold text-[#B0413E] dark:text-[#E28A87] hover:underline cursor-pointer"
                >
                  مسح التوثيق
                </button>
              )}
            </div>
            {state.notificationLogs.length === 0 ? (
              <p className="text-sm text-[#51665A] dark:text-[#B5C4BC]">لا توجد إشعارات موثقة بعد.</p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto">
                {state.notificationLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl bg-[#F5EBDD]/70 dark:bg-[#1E2B24] p-3 text-sm space-y-0.5"
                  >
                    <p className="font-semibold text-[#34483D] dark:text-[#F5EBDD]">
                      {log.title}
                    </p>
                    <p className="text-xs text-[#51665A] dark:text-[#B5C4BC]">
                      الحالة:{' '}
                      {log.action === 'snoozed'
                        ? 'غفوة'
                        : log.action === 'dismissed'
                        ? 'تم الإيقاف'
                        : 'تم الإطلاق'}{' '}
                      · الوقت: {log.scheduledTime}
                      {log.details ? ` · ${log.details}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {formOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="appt-form-title"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
        >
          <form
            onSubmit={handleSaveSubmit}
            className="w-full max-w-2xl rounded-3xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-6 space-y-5 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 id="appt-form-title" className="text-lg font-bold text-[#34483D] dark:text-[#F5EBDD]">
                {singleOccurrenceDate
                  ? `تعديل موعد يوم ${singleOccurrenceDate} فقط`
                  : editingAppointment
                  ? 'تعديل الموعد'
                  : 'إضافة موعد أو درس جديد'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  AudioFileManager.stopAudio();
                  setFormOpen(false);
                }}
                className="min-w-[40px] min-h-[40px] rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] flex items-center justify-center cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-[#34483D] dark:text-[#F5EBDD]">
                  العنوان *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: درس الفقه الأسبوعي"
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#34483D] dark:text-[#F5EBDD]">
                  التصنيف
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AppointmentCategory)}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
                >
                  {(Object.keys(CATEGORY_LABELS_AR) as AppointmentCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS_AR[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#34483D] dark:text-[#F5EBDD]">
                  المكان
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="المسجد / العنوان"
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#34483D] dark:text-[#F5EBDD]">
                  تاريخ البداية
                </label>
                <input
                  type="date"
                  value={startDate}
                  disabled={Boolean(singleOccurrenceDate)}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-clock"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#34483D] dark:text-[#F5EBDD]">
                    من الساعة
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full min-h-[44px] px-2 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-clock"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#34483D] dark:text-[#F5EBDD]">
                    إلى الساعة
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full min-h-[44px] px-2 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-clock"
                  />
                </div>
              </div>

              {!singleOccurrenceDate && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#34483D] dark:text-[#F5EBDD]">
                      التكرار
                    </label>
                    <select
                      value={recurrenceType}
                      onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                      className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
                    >
                      <option value="none">مرة واحدة</option>
                      <option value="daily">يومياً</option>
                      <option value="weekly">أسبوعياً</option>
                      <option value="custom_days">أيام محددة من الأسبوع</option>
                      <option value="monthly">شهرياً</option>
                    </select>
                  </div>

                  {recurrenceType !== 'none' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#34483D] dark:text-[#F5EBDD]">
                        نهاية التكرار (اختياري)
                      </label>
                      <input
                        type="date"
                        value={recurrenceEndDate}
                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                        className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-clock"
                      />
                    </div>
                  )}

                  {recurrenceType === 'custom_days' && (
                    <div className="sm:col-span-2 flex flex-wrap gap-2">
                      {WEEKDAY_OPTIONS.map((w) => {
                        const checked = customDays.includes(w.day);
                        return (
                          <button
                            key={w.day}
                            type="button"
                            onClick={() =>
                              setCustomDays((prev) =>
                                checked ? prev.filter((d) => d !== w.day) : [...prev, w.day]
                              )
                            }
                            className={`min-h-[38px] px-3 rounded-xl text-xs font-bold border cursor-pointer ${
                              checked
                                ? 'bg-[#527D68] text-[#F5EBDD] border-[#527D68]'
                                : 'border-[#D6C6A8] dark:border-[#3D5546]'
                            }`}
                          >
                            {w.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-[#34483D] dark:text-[#F5EBDD]">
                  ملاحظات أو وصف
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-[#F5EBDD]/70 dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#34483D] dark:text-[#F5EBDD]">
                    التنبيهات المتعددة للموعد ({alerts.length})
                  </h3>
                  <p className="text-xs text-[#51665A] dark:text-[#B5C4BC]">
                    يمكنك إضافة عدة تنبيهات قبل الموعد أو بوقت مخصص ولكل تنبيه صوت مستقل.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAlerts((prev) => [
                      ...prev,
                      {
                        triggerType: 'offset',
                        minutesOffset: -30,
                        customTimeHHmm: startTime,
                        soundMode: 'chime_gentle',
                        customAudioPath: null,
                        isVibrationEnabled: true,
                        isEnabled: true,
                      },
                    ])
                  }
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#527D68] text-[#F5EBDD] text-xs font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة تنبيه</span>
                </button>
              </div>

              {alerts.length === 0 ? (
                <p className="text-xs text-[#51665A] dark:text-[#B5C4BC]">
                  لن يتم جدولة أي تنبيهات لهذا الموعد.
                </p>
              ) : (
                <div className="space-y-3">
                  {alerts.map((al, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-3 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={al.triggerType}
                            onChange={(e) =>
                              setAlerts((prev) =>
                                prev.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        triggerType: e.target.value as 'offset' | 'custom_time',
                                      }
                                    : item
                                )
                              )
                            }
                            className="min-h-[38px] px-2.5 rounded-lg bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-semibold"
                          >
                            <option value="offset">قبل الموعد بمدة</option>
                            <option value="custom_time">وقت مخصص (ساعة:دقيقة)</option>
                          </select>

                          {al.triggerType === 'offset' ? (
                            <select
                              value={al.minutesOffset}
                              onChange={(e) =>
                                setAlerts((prev) =>
                                  prev.map((item, i) =>
                                    i === idx
                                      ? { ...item, minutesOffset: Number(e.target.value) }
                                      : item
                                  )
                                )
                              }
                              className="min-h-[38px] px-2.5 rounded-lg bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-semibold"
                            >
                              {OFFSET_PRESETS.map((m) => (
                                <option key={m} value={m}>
                                  {formatOffsetLabelAr({
                                    triggerType: 'offset',
                                    minutesOffset: m,
                                    customTimeHHmm: null,
                                    label: null,
                                  })}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="time"
                              value={al.customTimeHHmm}
                              onChange={(e) =>
                                setAlerts((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, customTimeHHmm: e.target.value } : item
                                  )
                                )
                              }
                              className="min-h-[38px] px-2.5 rounded-lg bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-clock"
                            />
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setAlerts((prev) => prev.filter((_, i) => i !== idx))
                          }
                          aria-label="حذف هذا التنبيه"
                          className="min-w-[36px] min-h-[36px] rounded-lg text-[#B0413E] hover:bg-[#B0413E]/10 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={al.soundMode}
                          onChange={(e) =>
                            setAlerts((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, soundMode: e.target.value as SoundMode }
                                  : item
                              )
                            )
                          }
                          className="min-h-[38px] px-2.5 rounded-lg bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-semibold"
                        >
                          <option value="chime_gentle">نغمة هادئة</option>
                          <option value="adhan_1">أذان 1 (العفاسي)</option>
                          <option value="adhan_2">أذان 2</option>
                          <option value="vibrate_only">اهتزاز فقط</option>
                          <option value="silent">صامت</option>
                          <option value="custom_file">ملف صوتي مخصص</option>
                        </select>

                        {al.soundMode === 'custom_file' && (
                          <>
                            <select
                              value={al.customAudioPath ?? ''}
                              onChange={(e) =>
                                setAlerts((prev) =>
                                  prev.map((item, i) =>
                                    i === idx
                                      ? { ...item, customAudioPath: e.target.value || null }
                                      : item
                                  )
                                )
                              }
                              className="min-h-[38px] px-2.5 rounded-lg bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-xs"
                            >
                              <option value="">اختر صوتاً...</option>
                              {state.customAudioFiles.map((cf) => (
                                <option key={cf.id} value={cf.internalFilePath}>
                                  {cf.name}
                                </option>
                              ))}
                            </select>

                            <label className="min-h-[38px] px-2.5 rounded-lg border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer">
                              <Upload className="w-3.5 h-3.5" />
                              <span>استيراد صوت</span>
                              <input
                                type="file"
                                accept="audio/*"
                                className="sr-only"
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  e.target.value = '';
                                  if (!f) return;
                                  const path = await importCustomAudioFile(f);
                                  if (path) {
                                    setAlerts((prev) =>
                                      prev.map((item, i) =>
                                        i === idx
                                          ? { ...item, soundMode: 'custom_file', customAudioPath: path }
                                          : item
                                      )
                                    );
                                  }
                                }}
                              />
                            </label>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (previewAlertIdx === idx) {
                              AudioFileManager.stopAudio();
                              setPreviewAlertIdx(null);
                            } else {
                              setPreviewAlertIdx(idx);
                              AudioFileManager.playForSoundMode({
                                soundMode: al.soundMode,
                                customAudioPath: al.customAudioPath,
                                customAudioFiles: state.customAudioFiles,
                                durationSeconds: state.prayerConfig.soundDurationSeconds,
                                onCompletion: () => setPreviewAlertIdx(null),
                              });
                            }
                          }}
                          className="min-h-[38px] px-3 rounded-lg border border-[#D6C6A8] dark:border-[#3D5546] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          {previewAlertIdx === idx ? (
                            <>
                              <Square className="w-3 h-3" />
                              <span>إيقاف</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              <span>معاينة</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {conflictAppt && (
              <div className="rounded-2xl bg-[#B0413E]/12 border border-[#B0413E]/40 p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#B0413E] dark:text-[#E28A87] font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    تعارض زمني مع: «{conflictAppt.title}» ({conflictAppt.startTime} – {conflictAppt.endTime})
                  </span>
                </div>
                <p className="text-xs text-[#34483D] dark:text-[#F5EBDD]">
                  اضغط «حفظ رغم التعارض» للاستمرار أو عدل وقت الموعد.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  AudioFileManager.stopAudio();
                  setFormOpen(false);
                }}
                className="min-h-[44px] px-4 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-semibold cursor-pointer"
              >
                إلغاء
              </button>
              {conflictAppt ? (
                <button
                  type="button"
                  onClick={commitSaveAppointment}
                  className="min-h-[44px] px-5 rounded-xl bg-[#B0413E] text-[#F5EBDD] text-sm font-bold cursor-pointer"
                >
                  حفظ رغم التعارض
                </button>
              ) : (
                <button
                  type="submit"
                  className="min-h-[44px] px-5 rounded-xl bg-[#527D68] hover:bg-[#426956] text-[#F5EBDD] text-sm font-bold cursor-pointer"
                >
                  حفظ الموعد
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {scopeDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-3xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
              {scopeDialog.mode === 'edit' ? 'تعديل الموعد المتكرر' : 'حذف الموعد المتكرر'}
            </h3>
            <p className="text-sm text-[#51665A] dark:text-[#B5C4BC]">
              «{scopeDialog.appointment.title}» موعد متكرر. اختر نطاق التطبيق:
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  const appt = scopeDialog.appointment;
                  setScopeDialog(null);
                  if (scopeDialog.mode === 'edit') {
                    openEditAppointment(appt, clock.todayDateStr);
                  } else {
                    cancelSingleOccurrence(appt, clock.todayDateStr);
                  }
                }}
                className="w-full min-h-[44px] px-4 rounded-xl bg-[#527D68] text-[#F5EBDD] text-sm font-bold cursor-pointer"
              >
                {scopeDialog.mode === 'edit'
                  ? `تعديل موعد اليوم (${clock.todayDateStr}) فقط`
                  : `إلغاء موعد اليوم (${clock.todayDateStr}) فقط`}
              </button>
              <button
                type="button"
                onClick={() => {
                  const appt = scopeDialog.appointment;
                  setScopeDialog(null);
                  if (scopeDialog.mode === 'edit') {
                    openEditAppointment(appt, null);
                  } else {
                    deleteAppointmentSeries(appt);
                  }
                }}
                className="w-full min-h-[44px] px-4 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-[#34483D] dark:text-[#F5EBDD] text-sm font-bold cursor-pointer"
              >
                {scopeDialog.mode === 'edit' ? 'تعديل السلسلة بالكامل' : 'حذف السلسلة بالكامل'}
              </button>
              <button
                type="button"
                onClick={() => setScopeDialog(null)}
                className="w-full min-h-[40px] text-xs font-semibold text-[#51665A] dark:text-[#B5C4BC] cursor-pointer"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {tmplModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!tmplTitle.trim()) return;
              saveTemplate({
                title: tmplTitle.trim(),
                category: tmplCategory,
                location: tmplLocation.trim() || null,
                durationMinutes: Math.max(10, tmplDuration),
              });
              setTmplModalOpen(false);
            }}
            className="w-full max-w-md rounded-3xl bg-[#FBF6EE] dark:bg-[#27382E] border border-[#D6C6A8] dark:border-[#3D5546] p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-[#34483D] dark:text-[#F5EBDD]">
              إضافة نموذج موعد جاهز
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                required
                value={tmplTitle}
                onChange={(e) => setTmplTitle(e.target.value)}
                placeholder="عنوان النموذج"
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
              />
              <select
                value={tmplCategory}
                onChange={(e) => setTmplCategory(e.target.value as AppointmentCategory)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
              >
                {(Object.keys(CATEGORY_LABELS_AR) as AppointmentCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS_AR[cat]}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={tmplLocation}
                onChange={(e) => setTmplLocation(e.target.value)}
                placeholder="المكان الافتراضي (اختياري)"
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm"
              />
              <input
                type="number"
                min={10}
                max={480}
                value={tmplDuration}
                onChange={(e) => setTmplDuration(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5EBDD] dark:bg-[#1E2B24] border border-[#D6C6A8] dark:border-[#3D5546] text-sm font-clock"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTmplModalOpen(false)}
                className="min-h-[40px] px-4 rounded-xl border border-[#D6C6A8] dark:border-[#3D5546] text-sm cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="min-h-[40px] px-5 rounded-xl bg-[#527D68] text-[#F5EBDD] text-sm font-bold cursor-pointer"
              >
                حفظ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
