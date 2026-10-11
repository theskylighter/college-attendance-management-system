import { useState, useEffect } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { getAttendanceBySubject, raiseCorrection } from "../student.api";

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

export default function CorrectionModal({ isOpen, onClose, context, subjects = [], corrections = [], onSuccess }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [reason, setReason] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isGeneral = context?.selectSubject;

  // Reset state when modal opens/closes or context changes
  useEffect(() => {
    if (isOpen) {
      // Defer state updates to avoid synchronous setState inside the effect body
      Promise.resolve().then(() => {
        setSelectedSubjectId("");
        setSessions([]);
        setSelectedSessionId("");
        setReason("");
        setError("");
      });
    }
  }, [isOpen, context]);

  // Fetch eligible absent sessions when subject changes in general mode
  useEffect(() => {
    if (!isOpen || !isGeneral || !selectedSubjectId) {
      return;
    }

    let active = true;
    const fetchHistory = async () => {
      try {
        const response = await getAttendanceBySubject(selectedSubjectId);
        if (!active) return;

        // Filter for sessions that:
        // 1. Are correction raisable (marked ABSENT)
        // 2. Do NOT already have a correction request submitted
        const eligible = (response.data?.history || []).filter((entry) => {
          const hasCorrection = corrections.some(
            (c) => c.attendanceRecordId === entry.attendanceRecordId
          );
          return entry.correctionRaisable && !hasCorrection;
        });

        setSessions(eligible);
        if (eligible.length > 0) {
          setSelectedSessionId(String(eligible[0].attendanceRecordId));
        } else {
          setSelectedSessionId("");
        }
      } catch {
        if (active) {
          setError("Failed to fetch subject lecture history.");
        }
      } finally {
        if (active) {
          setLoadingSessions(false);
        }
      }
    };

    // Defer loading state update to prevent synchronous effect execution
    Promise.resolve().then(() => {
      if (active) {
        setLoadingSessions(true);
        setError("");
      }
    });

    fetchHistory();

    return () => {
      active = false;
    };
  }, [selectedSubjectId, isGeneral, isOpen, corrections]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const targetRecordId = isGeneral ? selectedSessionId : context?.attendanceRecordId;
    if (!targetRecordId) {
      setError("Please select a lecture session.");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a reason for the correction request.");
      return;
    }

    try {
      setSubmitting(true);
      await raiseCorrection(parseInt(targetRecordId, 10), reason);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit correction request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubjectChange = (e) => {
    const val = e.target.value;
    setSelectedSubjectId(val);
    if (!val) {
      setSessions([]);
      setSelectedSessionId("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-950">
              {isGeneral ? "New Correction Request" : "Submit Correction Request"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Provide a valid explanation to notify your course faculty.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isGeneral ? (
            <>
              {/* Subject Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={handleSubjectChange}
                  disabled={submitting}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 focus:border-[#002147] focus:bg-white focus:outline-none transition-all disabled:opacity-60"
                >
                  <option value="">Select a subject...</option>
                  {subjects.map((sub) => (
                    <option key={sub.subjectId} value={sub.subjectId}>
                      {sub.subjectName} ({sub.subjectCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Selection */}
              {selectedSubjectId && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Absent Lecture Date</label>
                  {loadingSessions ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      <span>Loading eligible absent sessions...</span>
                    </div>
                  ) : sessions.length > 0 ? (
                    <select
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      disabled={submitting}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 focus:border-[#002147] focus:bg-white focus:outline-none transition-all disabled:opacity-60"
                    >
                      {sessions.map((sess) => (
                        <option key={sess.sessionId} value={sess.attendanceRecordId}>
                          {formatDate(sess.date)} ({formatTime(sess.startTime)} - {formatTime(sess.endTime)})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-800">
                      No eligible absent lectures found for this subject.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Contextual Info Display */
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Subject:</span>
                <span className="font-bold text-slate-900">
                  {context?.subjectName} ({context?.subjectCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Lecture:</span>
                <span className="font-semibold text-slate-900">
                  {formatDate(context?.date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Time:</span>
                <span className="font-semibold text-slate-900">
                  {formatTime(context?.startTime)} - {formatTime(context?.endTime)}
                </span>
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reason for absence</label>
            <textarea
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              placeholder="Explain why you were absent (e.g. sick leave, code error, family emergency)..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-[#002147] focus:bg-white focus:outline-none transition-all disabled:opacity-60 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (isGeneral && !selectedSessionId)}
              className="inline-flex items-center gap-2 rounded-full bg-[#002147] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#002147]/95 transition-all shadow-md active:scale-98 disabled:opacity-40 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
