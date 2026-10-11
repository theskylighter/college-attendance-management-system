import { Activity, CalendarDays, CheckCircle2, Clock3, GraduationCap } from "lucide-react";

const formatTime = (value) => {
  if (!value) return "--";
  const [hours, minutes] = String(value).split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDayLabel = () =>
  new Date().toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

const StatCard = ({ icon: Icon, label, value, tone = "navy" }) => {
  const toneClasses = {
    navy: "bg-[#002147]/10 text-[#002147]",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-[0_10px_30px_rgba(0,33,71,0.04)]">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">{value}</p>
    </div>
  );
};

export default function DashboardOverview({ overallAttendance, safeCount, riskCount, totalCourses, pendingCorrections, nextSession }) {
  const progress = Math.max(0, Math.min(overallAttendance, 100));
  const progressStyle = {
    background: `conic-gradient(#002147 0deg ${progress * 3.6}deg, rgba(15, 23, 42, 0.08) ${progress * 3.6}deg 360deg)`,
  };

  return (
    <section className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.9fr)]">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(0,33,71,0.06)] sm:p-8">
          <div className="absolute right-0 top-0 h-44 w-44 translate-x-14 -translate-y-14 rounded-full bg-[#002147]/5" />
          <div className="absolute right-12 top-10 h-20 w-20 rounded-full bg-slate-100" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="max-w-xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#002147]/10 bg-[#002147]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#002147]">
                <Activity className="h-3.5 w-3.5" />
                Attendance overview
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Welcome back to your dashboard</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Track attendance health, review today&apos;s schedule, and keep correction requests in view from one academic command center.
                </p>
              </div>

              <div className="grid gap-3 sm:flex sm:flex-wrap">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {safeCount} subjects above threshold
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                  <Clock3 className="h-4 w-4" />
                  {riskCount} subjects need attention
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:p-5 lg:min-w-90">
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full" style={progressStyle}>
                <div className="flex h-33 w-33 flex-col items-center justify-center rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
                  <span className="text-3xl font-extrabold tracking-tight text-[#002147]">{progress}%</span>
                  <span className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-500">Overall</span>
                </div>
              </div>

              <div className="space-y-3 text-center sm:text-left">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Current status</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Safe</div>
                <p className="text-xl font-bold tracking-tight text-slate-900">{progress >= 75 ? "Excellent Performance" : "Attendance needs attention"}</p>
                <p className="text-sm text-slate-600">
                  Minimum threshold: <span className="font-semibold text-slate-900">75%</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-[#002147] bg-[#002147] p-6 text-white shadow-[0_18px_40px_rgba(0,33,71,0.16)] sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">Today</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Next session</h2>
            </div>
            <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">{formatDayLabel()}</div>
          </div>

          <div className="mt-8 space-y-6">
            {nextSession ? (
              <>
                <div>
                  <p className="text-sm font-semibold text-white/65">{nextSession.subjectCode}</p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight">{nextSession.subjectName}</h3>
                  <p className="mt-2 text-sm text-white/70">{nextSession.facultyName}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Time</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {formatTime(nextSession.startTime)} - {formatTime(nextSession.endTime)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Slot</p>
                    <p className="mt-1 text-sm font-semibold text-white">Upcoming today</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5">
                <p className="text-sm text-white/75">No timetable slots are available for today.</p>
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <StatCard icon={GraduationCap} label="Courses" value={totalCourses} tone="navy" />
            <StatCard icon={CalendarDays} label="Schedule" value={nextSession ? 1 : 0} tone="green" />
            <StatCard icon={Clock3} label="Alerts" value={pendingCorrections} tone="amber" />
          </div>
        </div>
      </div>
    </section>
  );
}