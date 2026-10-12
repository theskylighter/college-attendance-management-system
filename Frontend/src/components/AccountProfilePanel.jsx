import { UserRound } from "lucide-react";

// Shared account profile card for faculty/admin dashboards.
// Rows: [{ label, value }]. Values render "--" when empty.
export default function AccountProfilePanel({ user, eyebrow, title, subtitle, rows = [] }) {
  const initials = (user?.name || "A")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.08)] sm:p-8">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
      {subtitle && <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>}

      <div className="mt-6 flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#002147] text-lg font-bold text-white">
          {initials || <UserRound className="h-6 w-6" />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold tracking-tight text-slate-950">{user?.name || "User"}</p>
          <p className="truncate text-sm text-slate-500">{user?.email || "--"}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {rows.map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <dt className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</dt>
            <dd className="mt-1 truncate text-sm font-semibold text-slate-900" title={value || "--"}>
              {value || "--"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
