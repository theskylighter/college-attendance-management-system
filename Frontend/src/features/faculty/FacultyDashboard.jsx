import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock3, ClipboardCheck, LayoutDashboard, Loader2, MessageSquareText, ShieldAlert, UserRound } from "lucide-react";
import { useAuth } from "../auth/hooks/useAuth";
import DashboardShell from "../../components/DashboardShell";
import {
  bulkMarkAttendance,
  decideCorrection,
  getFacultySchedule,
  getPendingCorrections,
  getSessionStudents,
} from "./faculty.api";

const formatTime = (value) => {
  if (!value) return "--";
  const [hours, minutes] = String(value).split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
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

const StatusBadge = ({ tone = "slate", children }) => {
  const toneClasses = {
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    red: "bg-rose-100 text-rose-700 border-rose-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    blue: "bg-[#eaf1ff] text-[#1d4ed8] border-[#cfe0ff]",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${toneClasses[tone]}`}>
      {children}
    </span>
  );
};

const SummaryCard = ({ icon: Icon, label, value, tone = "slate" }) => {
  const toneClasses = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-[#eaf1ff] text-[#1d4ed8]",
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

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "corrections", label: "Corrections", icon: MessageSquareText },
];

export default function FacultyDashboard() {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const loadSchedule = useCallback(async () => {
    try {
      const response = await getFacultySchedule();
      setSchedule(response.data ?? []);
      if (response.data?.length && !selectedSessionId) {
        setSelectedSessionId(String(response.data[0].id));
      }
    } catch {
      setError("Unable to load this week’s schedule.");
    } finally {
      setLoading(false);
    }
  }, [selectedSessionId]);

  const loadCorrections = useCallback(async () => {
    try {
      const response = await getPendingCorrections();
      setCorrections(response.data ?? []);
    } catch {
      setError("Unable to load pending corrections.");
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      await loadSchedule();
      await loadCorrections();
    };

    void bootstrap();
  }, [loadSchedule, loadCorrections]);

  const selectedSession = useMemo(
    () => schedule.find((entry) => String(entry.id) === String(selectedSessionId)) ?? null,
    [schedule, selectedSessionId]
  );

  useEffect(() => {
    if (!selectedSessionId) return;

    const fetchSessionStudents = async () => {
      setLoadingSession(true);
      setError("");
      try {
        const response = await getSessionStudents(selectedSessionId);
        const students = response.data?.students ?? [];
        const map = {};

        students.forEach((student) => {
          map[student.userId] = student.attendanceStatus || "ABSENT";
        });

        setSessionData(response.data ?? null);
        setAttendanceMap(map);
      } catch (err) {
        setSessionData(null);
        setError(err.response?.data?.error || "Unable to load session roster.");
      } finally {
        setLoadingSession(false);
      }
    };

    fetchSessionStudents();
  }, [selectedSessionId]);

  const handleStatusChange = (studentId, value) => {
    setAttendanceMap((current) => ({ ...current, [studentId]: value }));
  };

  const handleAttendanceSubmit = async () => {
    if (!selectedSessionId || !sessionData?.students?.length) {
      setError("Select a session before submitting attendance.");
      return;
    }

    setSavingAttendance(true);
    setError("");
    setNotice("");

    const records = sessionData.students.map((student) => ({
      studentId: student.userId,
      status: attendanceMap[student.userId] || student.attendanceStatus || "ABSENT",
    }));

    try {
      await bulkMarkAttendance(Number(selectedSessionId), records);
      setNotice("Attendance marked successfully.");
      const response = await getSessionStudents(selectedSessionId);
      const students = response.data?.students ?? [];
      const map = {};
      students.forEach((student) => {
        map[student.userId] = student.attendanceStatus || "ABSENT";
      });
      setSessionData(response.data ?? null);
      setAttendanceMap(map);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to mark attendance. Please try again.");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleDecision = async (id, decision) => {
    setError("");
    setNotice("");
    try {
      await decideCorrection(id, decision);
      setNotice(`Correction ${decision.toLowerCase()} successfully.`);
      await loadCorrections();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update the correction decision.");
    }
  };

  const handleLogoutSubmit = async () => {
    await handleLogout();
    navigate("/login");
  };

  const totalSessionsToday = schedule.length;
  const markedSessions = schedule.filter((session) => session.status === "HELD").length;
  const pendingCorrections = corrections.length;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (activeTab === "overview") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    document.getElementById(`faculty-${activeTab}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [activeTab]);

  if (loading) {
    return (
      <DashboardShell
        roleLabel="Faculty Portal"
        user={user}
        onLogout={handleLogoutSubmit}
        navItems={navItems}
        activeTab="overview"
      >
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(0,33,71,0.06)] sm:p-8">
            <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
            <div className="h-10 w-80 max-w-full animate-pulse rounded-2xl bg-slate-200" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
              <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      roleLabel="Faculty Portal"
      user={user}
      onLogout={handleLogoutSubmit}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
        <div id="faculty-overview" className={`${activeTab !== "overview" ? "hidden " : ""}scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8`}>
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#002147]">Faculty</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Good morning, {user?.name || "Professor"}</h1>
              <p className="mt-2 text-sm text-slate-600">Manage today’s classes, mark attendance, and review correction requests.</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <CalendarDays className="h-4 w-4 text-[#002147]" />
              {new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <SummaryCard icon={CalendarDays} label="Sessions today" value={totalSessionsToday} tone="blue" />
            <SummaryCard icon={ClipboardCheck} label="Marked" value={markedSessions} tone="emerald" />
            <SummaryCard icon={MessageSquareText} label="Pending corrections" value={pendingCorrections} tone="amber" />
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        {notice && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
            {notice}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <section id="faculty-schedule" className={`${activeTab !== "overview" && activeTab !== "schedule" ? "hidden " : ""}scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(0,33,71,0.06)] sm:p-6`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Schedule</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Today&apos;s sessions</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {schedule.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No sessions scheduled for today.
                </div>
              ) : (
                schedule.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedSessionId(String(session.id))}
                    className={`w-full rounded-3xl border p-4 text-left transition-all ${String(session.id) === String(selectedSessionId)
                      ? "border-[#002147] bg-[#002147]/5 shadow-[0_10px_24px_rgba(0,33,71,0.05)]"
                      : "border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{session.sectionSubject?.subject?.name || "Subject"}</p>
                        <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-900">{session.sectionSubject?.section?.name || "Section"}</h3>
                      </div>
                      <StatusBadge tone={session.status === "HELD" ? "green" : "amber"}>{session.status || "SCHEDULED"}</StatusBadge>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> {formatTime(session.startTime)} - {formatTime(session.endTime)}</p>
                      <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {session.room?.name || "Room TBD"}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <section id="faculty-attendance" className={`${activeTab !== "overview" && activeTab !== "attendance" ? "hidden " : ""}scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(0,33,71,0.06)] sm:p-6`}>
            {selectedSession ? (
              <>
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Attendance</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{selectedSession.sectionSubject?.subject?.name}</h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedSession.sectionSubject?.section?.name} • {formatDate(selectedSession.date)} • {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAttendanceSubmit}
                    disabled={savingAttendance || loadingSession}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#002147] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#002147]/95 disabled:pointer-events-none disabled:opacity-40"
                  >
                    {savingAttendance ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {savingAttendance ? "Saving..." : "Save attendance"}
                  </button>
                </div>

                {loadingSession ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    Loading roster…
                  </div>
                ) : sessionData?.students?.length ? (
                  <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                    <div className="grid grid-cols-[1.3fr_1fr_1fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      <span>Student</span>
                      <span>Roll</span>
                      <span>Present</span>
                    </div>
                    <div className="divide-y divide-slate-200 bg-white">
                      {sessionData.students.map((student) => (
                        <div key={student.userId} className="grid grid-cols-[1.3fr_1fr_1fr] items-center gap-3 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                              <UserRound className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{student.name}</p>
                              <p className="text-xs text-slate-500">{student.email}</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-slate-700">{student.rollNumber || "--"}</span>
                          <select
                            value={attendanceMap[student.userId] || student.attendanceStatus || "ABSENT"}
                            onChange={(event) => handleStatusChange(student.userId, event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-[#002147] focus:bg-white"
                          >
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LATE">Late</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No students found for this session.
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full min-h-[260px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                Select a session to begin attendance marking.
              </div>
            )}
          </section>
        </div>

        <section id="faculty-corrections" className={`${activeTab !== "overview" && activeTab !== "corrections" ? "hidden " : ""}scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(0,33,71,0.06)] sm:p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Corrections</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Pending correction review</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#002147]/10 bg-[#002147]/5 px-3 py-2 text-sm font-semibold text-[#002147]">
              <MessageSquareText className="h-4 w-4" />
              {corrections.length} pending
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {corrections.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                No pending correction requests for your sessions.
              </div>
            ) : (
              corrections.map((correction) => {
                const subject = correction.attendanceRecord?.lectureSession?.sectionSubject?.subject;
                const section = correction.attendanceRecord?.lectureSession?.sectionSubject?.section;
                const session = correction.attendanceRecord?.lectureSession;

                return (
                  <div key={correction.id} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-lg font-bold tracking-tight text-slate-950">{subject?.name || "Attendance correction"}</p>
                          <StatusBadge tone="amber">Pending</StatusBadge>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600">
                          <p><span className="font-semibold text-slate-700">Student:</span> {correction.student?.name || "Student"}</p>
                          <p><span className="font-semibold text-slate-700">Section:</span> {section?.name || "--"}</p>
                          <p><span className="font-semibold text-slate-700">Session:</span> {session ? `${formatDate(session.date)} • ${formatTime(session.startTime)}` : "--"}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                          {correction.reason}
                        </div>
                        {correction.events?.length > 0 && (
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Audit history</p>
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

                      <div className="flex flex-col gap-3 lg:min-w-[220px]">
                        <button
                          type="button"
                          onClick={() => handleDecision(correction.id, "APPROVED")}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(correction.id, "REJECTED")}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          <ShieldAlert className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
