/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/hooks/useAuth";
import {
  getAttendanceBySubject,
  getAttendanceSummary,
  getCourses,
  getMyCorrections,
  getSchedule,
} from "./student.api";
import StudentShell from "./components/StudentShell";
import DashboardOverview from "./components/DashboardOverview";
import {
  AttendancePanel,
  CorrectionsPanel,
  CoursesPanel,
  ProfilePanel,
  SchedulePanel,
} from "./components/StudentPanels";
import { CheckCircle2, X } from "lucide-react";
import CorrectionModal from "./components/CorrectionModal";
import EscalationModal from "./components/EscalationModal";

const tabs = ["dashboard", "attendance", "corrections", "courses", "schedule", "profile"];

const emptyDashboardData = {
  attendanceSummary: [],
  courses: [],
  schedule: [],
  corrections: [],
};

const toNumber = (value) => (Number.isFinite(value) ? value : 0);
const responseItems = (response) => response?.data?.data ?? response?.data ?? [];

export default function StudentDashboard() {
  const { user, handleLogout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(emptyDashboardData);
  const [loading, setLoading] = useState(true);
  const [sectionErrors, setSectionErrors] = useState({});
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Modal and Success Notification State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState(null);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // DashboardShell calls onLogout with no event arg; context navigates to /login.
  const handleLogoutSubmit = async () => {
    await handleLogout();
  };

  const loadDashboard = useCallback(async (silent = false) => {
    if (!silent) {
      Promise.resolve().then(() => {
        setLoading(true);
      });
    }

    try {
      const [attendanceResult, coursesResult, scheduleResult, correctionsResult] = await Promise.allSettled([
        getAttendanceSummary(),
        getCourses(),
        getSchedule(),
        getMyCorrections(),
      ]);

      setDashboardData({
        attendanceSummary: attendanceResult.status === "fulfilled" ? attendanceResult.value.data ?? [] : [],
        courses: coursesResult.status === "fulfilled" ? responseItems(coursesResult.value) : [],
        schedule: scheduleResult.status === "fulfilled" ? scheduleResult.value.data ?? [] : [],
        corrections: correctionsResult.status === "fulfilled" ? responseItems(correctionsResult.value) : [],
      });

      setSectionErrors({
        attendanceSummary: attendanceResult.status === "rejected" ? "Attendance data failed to load." : "",
        courses: coursesResult.status === "rejected" ? "Courses could not be loaded." : "",
        schedule: scheduleResult.status === "rejected" ? "Schedule could not be loaded." : "",
        corrections: correctionsResult.status === "rejected" ? "Correction requests could not be loaded." : "",
      });
    } catch {
      // Handled by individual settled states
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const attendanceSummary = dashboardData.attendanceSummary;
  const courses = dashboardData.courses;
  const schedule = dashboardData.schedule;
  const corrections = dashboardData.corrections;
  const activeSubjectId = selectedSubjectId ?? attendanceSummary[0]?.subjectId ?? null;

  const loadHistory = useCallback(async () => {
    if (!activeSubjectId) return;

    Promise.resolve().then(() => {
      setHistoryLoading(true);
      setHistoryError("");
    });

    try {
      const response = await getAttendanceBySubject(activeSubjectId);
      setSelectedHistory(response.data);
    } catch {
      setHistoryError("Failed to load subject history.");
      setSelectedHistory(null);
    } finally {
      setHistoryLoading(false);
    }
  }, [activeSubjectId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleCorrectionSuccess = async () => {
    setIsModalOpen(false);
    setModalContext(null);
    setToastMessage("Correction request submitted successfully!");

    const timer = setTimeout(() => setToastMessage(""), 5000);

    await Promise.all([
      loadDashboard(true),
      loadHistory(),
    ]);

    return () => clearTimeout(timer);
  };

  const handleEscalationSuccess = async () => {
    setIsEscalationModalOpen(false);
    setSelectedEscalation(null);
    setToastMessage("Correction request escalated to admin successfully!");

    const timer = setTimeout(() => setToastMessage(""), 5000);

    await Promise.all([
      loadDashboard(true),
      loadHistory(),
    ]);

    return () => clearTimeout(timer);
  };

  const totals = attendanceSummary.reduce(
    (accumulator, subject) => {
      accumulator.attended += toNumber(subject.attended);
      accumulator.total += toNumber(subject.totalSessions);
      return accumulator;
    },
    { attended: 0, total: 0 },
  );

  const overallAttendance = totals.total === 0 ? 0 : Math.round((totals.attended / totals.total) * 100);
  const safeCount = attendanceSummary.filter((subject) => subject.safe).length;
  const riskCount = attendanceSummary.length - safeCount;
  const pendingCorrections = corrections.filter((item) => item.facultyDecision === "PENDING").length;
  const nextSession = schedule[0] ?? null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#faf9fd_0%,#f6f8fc_100%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(0,33,71,0.06)] sm:p-8">
          <div className="space-y-4">
            <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
            <div className="h-10 w-80 max-w-full animate-pulse rounded-2xl bg-slate-200" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
              <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const content = (() => {
    switch (activeTab) {
      case "attendance":
        return (
          <AttendancePanel
            summary={attendanceSummary}
            selectedSubjectId={activeSubjectId}
            onSelectSubject={setSelectedSubjectId}
            selectedHistory={activeSubjectId ? selectedHistory : null}
            historyLoading={historyLoading}
            historyError={historyError || sectionErrors.attendanceSummary}
            corrections={corrections}
            onOpenCorrectionModal={(ctx) => {
              setModalContext(ctx);
              setIsModalOpen(true);
            }}
          />
        );
      case "corrections":
        return (
          <CorrectionsPanel
            corrections={corrections}
            onOpenCorrectionModal={(ctx) => {
              setModalContext(ctx);
              setIsModalOpen(true);
            }}
            onOpenEscalationModal={(correction) => {
              setSelectedEscalation(correction);
              setIsEscalationModalOpen(true);
            }}
          />
        );
      case "courses":
        return <CoursesPanel courses={courses} />;
      case "schedule":
        return <SchedulePanel schedule={schedule} />;
      case "profile":
        return <ProfilePanel user={user} overallAttendance={overallAttendance} totalCourses={courses.length} />;
      case "dashboard":
      default:
        return (
          <DashboardOverview
            overallAttendance={overallAttendance}
            safeCount={safeCount}
            riskCount={riskCount}
            totalCourses={courses.length}
            pendingCorrections={pendingCorrections}
            nextSession={nextSession}
          />
        );
    }
  })();

  return (
    <StudentShell
      activeTab={activeTab}
      onTabChange={(nextTab) => setActiveTab(tabs.includes(nextTab) ? nextTab : "dashboard")}
      user={user}
      onLogout={handleLogoutSubmit}
      onProfileShow={() => setActiveTab("profile")}
    >
      <div className="space-y-5">
        {toastMessage && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setToastMessage("")} 
              className="text-emerald-500 hover:text-emerald-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {(sectionErrors.attendanceSummary || sectionErrors.courses || sectionErrors.schedule || sectionErrors.corrections) && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
            Some dashboard sections could not be loaded. Available data is still shown below.
          </div>
        )}

        {content}
      </div>

      <CorrectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalContext(null);
        }}
        context={modalContext}
        subjects={attendanceSummary}
        corrections={corrections}
        onSuccess={handleCorrectionSuccess}
      />

      <EscalationModal
        isOpen={isEscalationModalOpen}
        onClose={() => {
          setIsEscalationModalOpen(false);
          setSelectedEscalation(null);
        }}
        correction={selectedEscalation}
        onSuccess={handleEscalationSuccess}
      />
    </StudentShell>
  );
}