import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { escalateCorrection } from "../student.api";

export default function EscalationModal({ isOpen, onClose, correction, onSuccess }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const resetState = () => {
      setReason("");
      setError("");
    };

    resetState();
  }, [isOpen]);

  if (!isOpen || !correction) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!reason.trim()) {
      setError("Please explain why you need this request escalated to admin.");
      return;
    }

    try {
      setSubmitting(true);
      await escalateCorrection(correction.id, reason);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to escalate this request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-950">Escalate to admin</h3>
            <p className="mt-1 text-sm text-slate-500">Your faculty rejected this request. Share why you want it reviewed by administration.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Subject</p>
            <p className="mt-1">{correction.attendanceRecord?.lectureSession?.sectionSubject?.subject?.name || "Attendance correction"}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Escalation reason</label>
            <textarea
              rows="4"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={submitting}
              placeholder="Explain the issue, supporting information, or why the faculty decision should be reviewed."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-[#002147] focus:bg-white focus:outline-none disabled:opacity-60"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#002147] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#002147]/95 disabled:pointer-events-none disabled:opacity-45"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send to admin"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
