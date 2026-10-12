import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, Building2, CalendarClock, GraduationCap, LayoutDashboard, MapPin, Pencil, PlusCircle, Trash2, Users, ShieldCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "../auth/hooks/useAuth";
import DashboardShell from "../../components/DashboardShell";
import { createRoom, decideEscalation, deleteRoom, getEscalatedCorrections, getRooms, updateRoom } from "./admin.api";
import AdminOperationsPanel from "./components/AdminOperationsPanel";

const navItems = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "academic", label: "Academic Setup", icon: GraduationCap },
  { id: "users", label: "Users", icon: Users },
  { id: "rooms", label: "Rooms", icon: Building2 },
  { id: "timetable", label: "Timetable", icon: CalendarClock },
  { id: "escalations", label: "Escalations", icon: ShieldAlert },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

const EMPTY_FORM = {
  name: "",
  building: "",
  capacity: "",
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

export default function AdminDashboard() {
  const { user, handleLogout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEscalations, setLoadingEscalations] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await getRooms();
      setRooms(data);
    } catch {
      setError("Could not load rooms.");
    } finally {
      setLoading(false);
    }
  };

  const loadEscalations = async () => {
    setLoadingEscalations(true);
    try {
      const data = await getEscalatedCorrections();
      setEscalations(data);
    } catch {
      setError("Could not load escalated requests.");
    } finally {
      setLoadingEscalations(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      await Promise.all([loadRooms(), loadEscalations()]);
    };

    void bootstrap();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const payload = {
      name: form.name.trim(),
      building: form.building.trim() || null,
      capacity: form.capacity === "" ? null : Number(form.capacity),
    };

    if (!payload.name) {
      setError("Room name is required.");
      return;
    }

    try {
      if (editingId) {
        await updateRoom(editingId, payload);
        setNotice("Room updated successfully.");
      } else {
        await createRoom(payload);
        setNotice("Room created successfully.");
      }
      resetForm();
      await loadRooms();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to save room.");
    }
  };

  const handleEdit = (room) => {
    setEditingId(room.id);
    setForm({
      name: room.name,
      building: room.building || "",
      capacity: room.capacity === null ? "" : String(room.capacity),
    });
    setError("");
    setNotice("");
  };

  const handleDelete = async (id) => {
    setError("");
    setNotice("");

    try {
      await deleteRoom(id);
      setNotice("Room deleted.");
      if (editingId === id) resetForm();
      await loadRooms();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to delete room.");
    }
  };

  const handleEscalationDecision = async (id, decision) => {
    setError("");
    setNotice("");

    try {
      await decideEscalation(id, decision);
      setNotice(decision === "APPROVED" ? "Escalation approved." : "Escalation rejected.");
      await loadEscalations();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update the escalation.");
    }
  };

  // DashboardShell calls onLogout with no event arg; context navigates to /login.
  const handleLogoutSubmit = async () => {
    await handleLogout();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
    setNotice("");
  };

  return (
    <DashboardShell
      roleLabel="Administrator Portal"
      user={user}
      onLogout={handleLogoutSubmit}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && (
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Administration</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Portal overview</h1>
            <p className="mt-2 text-sm text-slate-600">Monitor rooms and correction escalations from one place.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-5">
                <Building2 className="text-indigo-600" size={20} />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Configured rooms</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{rooms.length}</p>
              </div>
              <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5">
                <ShieldAlert className="text-amber-700" size={20} />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pending escalations</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{escalations.length}</p>
              </div>
            </div>
          </div>
        )}

        {["academic", "users", "timetable", "reports"].includes(activeTab) && <AdminOperationsPanel tab={activeTab} />}

        {activeTab === "rooms" && (
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Administration</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Room management</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                {user?.name || "Admin"}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <form onSubmit={handleSubmit} className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                {editingId ? <Pencil className="text-indigo-600" size={20} /> : <PlusCircle className="text-indigo-600" size={20} />}
                <h2 className="text-xl font-semibold text-slate-900">{editingId ? "Edit room" : "Add room"}</h2>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Room name
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="LAB-101"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Building
                  <input
                    name="building"
                    value={form.building}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="Main Building"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Capacity
                  <input
                    type="number"
                    min="1"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="60"
                  />
                </label>
              </div>

              {(error || notice) && (
                <div className={`mt-4 rounded-xl border px-3 py-2 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                  {error || notice}
                </div>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-500"
                >
                  {editingId ? "Save changes" : "Create room"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="text-indigo-600" size={20} />
                  <h2 className="text-xl font-semibold text-slate-900">All rooms</h2>
                </div>
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {rooms.length} total
                </span>
              </div>

              {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">Loading rooms…</div>
              ) : rooms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                  No rooms configured yet.
                </div>
              ) : (
                <div className="grid gap-3">
                  {rooms.map((room) => (
                    <div key={room.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-slate-900">{room.name}</span>
                            {room.capacity && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                <Users size={12} />
                                {room.capacity}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                            <MapPin size={14} />
                            {room.building || "No building specified"}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(room)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(room.id)}
                            className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {activeTab === "escalations" && (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50/60 p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-700">Escalations</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Admin correction review</h2>
              </div>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800">
              {escalations.length} pending
            </span>
          </div>

          {loadingEscalations ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
              Loading escalated requests…
            </div>
          ) : escalations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
              No escalated correction requests pending review.
            </div>
          ) : (
            <div className="space-y-4">
              {escalations.map((correction) => {
                const subject = correction.attendanceRecord?.lectureSession?.sectionSubject?.subject;
                const section = correction.attendanceRecord?.lectureSession?.sectionSubject?.section;
                const session = correction.attendanceRecord?.lectureSession;

                return (
                  <article key={correction.id} className="rounded-3xl border border-amber-200 bg-white/90 p-5 shadow-[0_14px_34px_rgba(0,33,71,0.05)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-lg font-bold tracking-tight text-slate-950">{subject?.name || "Attendance correction"}</p>
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                            <AlertTriangle size={12} /> Escalated
                          </span>
                        </div>

                        <div className="space-y-1 text-sm text-slate-600">
                          <p><span className="font-semibold text-slate-700">Student:</span> {correction.student?.name || "Student"}</p>
                          <p><span className="font-semibold text-slate-700">Section:</span> {section?.name || "--"}</p>
                          <p><span className="font-semibold text-slate-700">Lecture:</span> {session ? new Date(session.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "--"}</p>
                          <p><span className="font-semibold text-slate-700">Escalated:</span> {formatDateTime(correction.escalatedAt)}</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                          <p className="font-semibold text-slate-800">Original request reason</p>
                          <p className="mt-1">{correction.reason}</p>
                        </div>

                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                          <p className="font-semibold">Escalation reason</p>
                          <p className="mt-1">{correction.escalationReason || "No additional reason provided."}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:min-w-[220px]">
                        <button
                          type="button"
                          onClick={() => handleEscalationDecision(correction.id, "APPROVED")}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                        >
                          <ShieldCheck size={16} /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEscalationDecision(correction.id, "REJECTED")}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          <ShieldAlert size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
        )}
      </div>
    </DashboardShell>
  );
}
