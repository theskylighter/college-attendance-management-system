import { AlertTriangle, BookOpen, CalendarDays, CheckCircle2, ChevronRight, Clock3, FileClock, Mail, MapPin, MessageSquareText, School, ShieldAlert, UserRound } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

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

const StatusBadge = ({ tone = "slate", children }) => {
  const toneClasses = {
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    red: "bg-rose-100 text-rose-700 border-rose-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${toneClasses[tone]}`}>{children}</span>;
};

const CourseCard = ({ course }) => (
  <article className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_14px_34px_rgba(0,33,71,0.05)] transition-transform hover:-translate-y-0.5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold tracking-tight text-slate-950">{course.subjectName}</h3>
        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">{course.subjectCode}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#002147]/10 text-[#002147]">
        <BookOpen className="h-4 w-4" />
      </div>
    </div>

    <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 px-4 py-4">
      <div className="flex items-start gap-3">
        <UserRound className="mt-0.5 h-4 w-4 text-slate-400" />
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Faculty</p>
          <p className="text-sm font-semibold text-slate-900">{course.facultyName}</p>
        </div>
      </div>

      {course.facultyEmail && (
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Email</p>
            <p className="text-sm text-slate-600">{course.facultyEmail}</p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <School className="mt-0.5 h-4 w-4 text-slate-400" />
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Planned lectures</p>
          <p className="text-sm font-semibold text-slate-900">{course.totalPlannedLectures ?? "--"}</p>
        </div>
      </div>
    </div>
  </article>
);

const ScheduleItem = ({ slot, index }) => (
  <article className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_14px_34px_rgba(0,33,71,0.05)]">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#002147]/10 text-[#002147]">
          <Clock3 className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Session {index + 1}</p>
          <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-950">{slot.subjectName}</h3>
          <p className="mt-1 text-sm text-slate-500">{slot.subjectCode}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:text-right">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Time</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
        </p>
      </div>
    </div>

    <div className="mt-5 flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
        <School className="h-3.5 w-3.5" />
        {slot.facultyName}
      </div>
      <div className="inline-flex items-center gap-2 rounded-full bg-[#002147]/5 px-3 py-1.5 text-xs font-semibold text-[#002147]">
        <MapPin className="h-3.5 w-3.5" />
        Today&apos;s timetable slot
      </div>
    </div>
  </article>
);

const ProfileCard = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900">{value || "--"}</p>
  </div>
);

const AttendanceRing = ({ subject, isSelected, onSelect }) => {
  const progress = Math.max(0, Math.min(subject.percentage ?? 0, 100));
  const progressStyle = {
    background: `conic-gradient(${subject.safe ? "#16a34a" : "#dc2626"} 0deg ${progress * 3.6}deg, rgba(15, 23, 42, 0.08) ${progress * 3.6}deg 360deg)`,
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(subject.subjectId)}
      className={`group rounded-3xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,33,71,0.08)] ${
        isSelected
          ? "border-[#002147] bg-[#f0f4fb] shadow-[0_16px_32px_rgba(0,33,71,0.08)]"
          : "border-slate-200 bg-white/90"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-bold tracking-tight text-slate-950">{subject.subjectName}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">{subject.subjectCode}</p>
        </div>
        <StatusBadge tone={subject.safe ? "green" : "red"}>{subject.safe ? "Safe" : "Risk"}</StatusBadge>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full" style={progressStyle}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[#002147] shadow-sm">
            {progress}%
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Attendance</p>
          <p className="text-sm font-semibold text-slate-900">
            {subject.attended} attended of {subject.totalSessions} sessions
          </p>
          <p className="text-sm text-slate-600">{subject.safe ? "Maintaining the minimum threshold." : "Needs action to recover above 75%."}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Updated recently
        </span>
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
};

export const AttendancePanel = ({ summary, selectedSubjectId, onSelectSubject, selectedHistory, historyLoading, historyError, corrections = [], onOpenCorrectionModal }) => {
  const selectedSubject = summary.find((subject) => subject.subjectId === selectedSubjectId) || summary[0];
  const safeCount = summary.filter((subject) => subject.safe).length;
  const riskCount = summary.length - safeCount;
  const totalSessions = summary.reduce((accumulator, subject) => accumulator + (subject.totalSessions || 0), 0);
  const attendedSessions = summary.reduce((accumulator, subject) => accumulator + (subject.attended || 0), 0);
  const overallAttendance = totalSessions === 0 ? 0 : Math.round((attendedSessions / totalSessions) * 100);

  return (
    <section className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.8fr)]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(0,33,71,0.06)] sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Attendance breakdown</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Subject performance</h2>
              <p className="mt-2 text-sm text-slate-600">Select a subject to inspect its lecture history and correction eligibility.</p>
            </div>
            <div className="rounded-2xl border border-[#002147]/10 bg-[#002147]/5 px-4 py-3 text-right">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#002147]/60">Overall</p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#002147]">{overallAttendance}%</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Total subjects</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{summary.length}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-600">On track</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-700">{safeCount}</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-rose-600">Needs attention</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-rose-700">{riskCount}</p>
            </div>
          </div>

          {summary.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {summary.map((subject) => (
                <AttendanceRing
                  key={subject.subjectId}
                  subject={subject}
                  isSelected={subject.subjectId === selectedSubject?.subjectId}
                  onSelect={onSelectSubject}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <FileClock className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 text-lg font-semibold text-slate-900">No attendance summary available</p>
              <p className="mt-1 text-sm text-slate-500">Once lecture records are created, your subject-level progress will appear here.</p>
            </div>
          )}
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(0,33,71,0.06)] sm:p-7">
          {selectedSubject ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Selected subject</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{selectedSubject.subjectName}</h3>
                  <p className="mt-1 text-sm text-slate-500">{selectedSubject.subjectCode}</p>
                </div>
                <StatusBadge tone={selectedSubject.safe ? "green" : "red"}>{selectedSubject.safe ? "Safe" : "Below threshold"}</StatusBadge>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Attended</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{selectedSubject.attended}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Total sessions</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{selectedSubject.totalSessions}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Lecture history</p>
                  <span className="text-xs uppercase tracking-[0.22em] text-slate-400">{selectedHistory?.history?.length || 0} entries</span>
                </div>

                {historyLoading ? (
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Loading subject history...</div>
                ) : historyError ? (
                  <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">{historyError}</div>
                ) : selectedHistory?.history?.length ? (
                  <div className="space-y-3">
                    {selectedHistory.history.map((entry) => {
                      const statusTone = entry.status === "PRESENT" || entry.status === "LATE" ? "green" : entry.status === "ABSENT" ? "red" : "slate";
                      const statusText =
                        entry.status === "PRESENT"
                          ? "Present"
                          : entry.status === "LATE"
                            ? "Late"
                            : entry.status === "ABSENT"
                              ? "Absent"
                              : "Not marked";

                      const existingCorrection = corrections.find(
                        (c) => c.attendanceRecordId === entry.attendanceRecordId
                      );

                      return (
                        <div key={entry.sessionId} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{formatDate(entry.date)}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                              </p>
                            </div>
                            <StatusBadge tone={statusTone}>{statusText}</StatusBadge>
                          </div>

                          {existingCorrection ? (
                            <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-3">
                              <span className="text-xs font-semibold text-slate-500">Correction Request:</span>
                              <CorrectionStatus decision={existingCorrection.facultyDecision} />
                            </div>
                          ) : (
                            entry.correctionRaisable && (
                              <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/60 pt-3">
                                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 w-fit">
                                  <AlertTriangle className="h-3 w-3" />
                                  Eligible for correction
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onOpenCorrectionModal({
                                      attendanceRecordId: entry.attendanceRecordId,
                                      subjectName: selectedSubject.subjectName,
                                      subjectCode: selectedSubject.subjectCode,
                                      date: entry.date,
                                      startTime: entry.startTime,
                                      endTime: entry.endTime,
                                    })
                                  }
                                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#002147]/20 bg-[#002147]/5 px-3 py-2 text-xs font-bold text-[#002147] transition-all hover:bg-[#002147]/10 active:scale-98"
                                >
                                  Request Correction
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    No lecture history has been recorded for this subject yet.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <FileClock className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 text-lg font-semibold text-slate-900">Select a subject</p>
              <p className="mt-1 text-sm text-slate-500">Choose any subject card to inspect lecture-by-lecture attendance history.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const CorrectionStatus = ({ decision }) => {
  const toneMap = {
    PENDING: "amber",
    APPROVED: "green",
    REJECTED: "red",
  };

  const labelMap = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };

  return <StatusBadge tone={toneMap[decision] || "slate"}>{labelMap[decision] || decision || "Unknown"}</StatusBadge>;
};

const SummaryCard = ({ icon: Icon, label, value, tone = "slate" }) => {
  const toneClasses = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_14px_34px_rgba(0,33,71,0.05)]">
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{value}</p>
    </div>
  );
};

export const CorrectionsPanel = ({ corrections, onOpenCorrectionModal, onOpenEscalationModal }) => {
  const total = corrections.length;
  const pending = corrections.filter((item) => item.facultyDecision === "PENDING").length;
  const approved = corrections.filter((item) => item.facultyDecision === "APPROVED").length;
  const rejected = corrections.filter((item) => item.facultyDecision === "REJECTED").length;

  return (
    <section className="space-y-5">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(0,33,71,0.06)] sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Corrections</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Attendance correction requests</h2>
            <p className="mt-2 text-sm text-slate-600">Track requests you submitted for missed or mis-marked sessions.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenCorrectionModal({ selectSubject: true })}
              className="inline-flex items-center gap-2 rounded-full bg-[#002147] px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-[#002147]/95 active:scale-98"
            >
              <AlertTriangle className="h-4 w-4" />
              New Request
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#002147]/10 bg-[#002147]/5 px-3 py-2 text-sm font-semibold text-[#002147]">
              <MessageSquareText className="h-4 w-4" />
              {total} total requests
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <SummaryCard icon={CalendarDays} label="Total requests" value={total} tone="slate" />
          <SummaryCard icon={Clock3} label="Pending" value={pending} tone="amber" />
          <SummaryCard icon={CheckCircle2} label="Approved" value={approved} tone="emerald" />
          <SummaryCard icon={ShieldAlert} label="Rejected" value={rejected} tone="rose" />
        </div>
      </div>

      {corrections.length > 0 ? (
        <div className="grid gap-4">
          {corrections.map((correction) => {
            const subject = correction.attendanceRecord?.lectureSession?.sectionSubject?.subject;
            const session = correction.attendanceRecord?.lectureSession;
            const canEscalate = correction.facultyDecision === "REJECTED" && !correction.adminEscalated;
            const isEscalated = Boolean(correction.adminEscalated);

            return (
              <article key={correction.id} className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_14px_34px_rgba(0,33,71,0.05)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-bold tracking-tight text-slate-950">{subject?.name || "Attendance correction"}</p>
                      <CorrectionStatus decision={correction.facultyDecision} />
                      {isEscalated && <StatusBadge tone="amber">Escalated</StatusBadge>}
                    </div>
                    <p className="text-sm text-slate-600">Session on {session ? formatDate(session.date) : "--"}</p>
                    <p className="max-w-3xl rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{correction.reason}</p>
                    {correction.escalationReason && (
                      <div className="max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                        <span className="font-semibold">Escalation reason:</span> {correction.escalationReason}
                      </div>
                    )}
                    {correction.events?.length > 0 && (
                      <div className="max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          <FileClock className="h-3.5 w-3.5" />
                          Audit history
                        </div>
                        <div className="mt-3 space-y-2">
                          {correction.events.map((event) => (
                            <div key={event.id} className="flex flex-col gap-1 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                              <span className="font-semibold text-slate-800">{event.action.replaceAll("_", " ")}</span>
                              <span>{formatDateTime(event.createdAt)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:min-w-70 lg:grid-cols-1">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Requested</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(correction.requestedAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Status detail</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {isEscalated
                          ? "Pending admin review"
                          : correction.facultyDecision === "APPROVED"
                            ? "Faculty approved"
                            : correction.facultyDecision === "REJECTED"
                              ? "Faculty rejected"
                              : "Waiting for review"}
                      </p>
                    </div>
                    {canEscalate && (
                      <button
                        type="button"
                        onClick={() => onOpenEscalationModal(correction)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Escalate to admin
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center shadow-[0_14px_34px_rgba(0,33,71,0.04)]">
          <ShieldAlert className="mx-auto h-11 w-11 text-slate-400" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No correction requests yet</p>
          <p className="mt-1 text-sm text-slate-500">If an absence is marked in error, you can submit a correction request from the corrections workflow.</p>
        </div>
      )}
    </section>
  );
};

export const CoursesPanel = ({ courses }) => (
  <section className="space-y-5">
    <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(0,33,71,0.06)] sm:p-7">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Courses</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Your enrolled subjects</h2>
      <p className="mt-2 text-sm text-slate-600">Review the faculty and lecture plan associated with your current section.</p>
    </div>

    {courses.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.sectionSubjectId ?? course.subjectId} course={course} />
        ))}
      </div>
    ) : (
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center shadow-[0_14px_34px_rgba(0,33,71,0.04)]">
        <BookOpen className="mx-auto h-11 w-11 text-slate-400" />
        <p className="mt-4 text-lg font-semibold text-slate-900">No courses available</p>
        <p className="mt-1 text-sm text-slate-500">Courses will appear here once the section mapping is available.</p>
      </div>
    )}
  </section>
);

export const SchedulePanel = ({ schedule }) => (
  <section className="space-y-5">
    <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(0,33,71,0.06)] sm:p-7">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Schedule</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Today&apos;s classes</h2>
      <p className="mt-2 text-sm text-slate-600">Use the timetable view to see the current day&apos;s lecture slots in order.</p>
    </div>

    {schedule.length > 0 ? (
      <div className="grid gap-4">
        {schedule.map((slot, index) => (
          <ScheduleItem key={slot.slotId ?? `${slot.subjectCode}-${index}`} slot={slot} index={index} />
        ))}
      </div>
    ) : (
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center shadow-[0_14px_34px_rgba(0,33,71,0.04)]">
        <CalendarDays className="mx-auto h-11 w-11 text-slate-400" />
        <p className="mt-4 text-lg font-semibold text-slate-900">No classes scheduled for today</p>
        <p className="mt-1 text-sm text-slate-500">When timetable slots are configured for your section, they will appear here.</p>
      </div>
    )}
  </section>
);

export const ProfilePanel = ({ user, overallAttendance, totalCourses }) => (
  <section className="space-y-5">
    <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(0,33,71,0.06)] sm:p-7">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Profile</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Student account</h2>
      <p className="mt-2 text-sm text-slate-600">A compact overview of your logged-in identity and attendance status.</p>
    </div>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(0,33,71,0.06)]">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#002147] text-white">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-950">{user?.name}</p>
            <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <ProfileCard label="Role" value={user?.role || "Student"} />
          <ProfileCard label="Attendance" value={`${overallAttendance}%`} />
          <ProfileCard label="Courses" value={totalCourses} />
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-[#002147] bg-[#002147] p-6 text-white shadow-[0_18px_40px_rgba(0,33,71,0.16)]">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">Status</p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight">Account healthy</h3>
        <p className="mt-3 text-sm leading-6 text-white/75">
          Your attendance record is being tracked against the 75% minimum threshold, and the dashboard will surface any risks in real time.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <p className="text-sm font-semibold">Secure session in progress</p>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Mail className="h-4 w-4 text-white/50" />
            <p className="text-sm text-white/75">All dashboard data is scoped to your authenticated student profile.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);