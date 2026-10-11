import { Bell, LogOut, School, UserRound } from "lucide-react";
import { useState } from "react";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";

export default function DashboardShell({
  roleLabel = "Portal",
  user,
  onLogout,
  navItems = [],
  activeTab,
  onTabChange,
  children,
}) {
  const initials = getInitials(user?.name);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(0,33,71,0.09),transparent_34%),linear-gradient(180deg,#faf9fd_0%,#f6f8fc_100%)] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-8xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#002147] text-white shadow-sm">
              <School className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold tracking-tight text-[#002147] sm:text-base">AcademiaLink</p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{roleLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-colors hover:border-[#002147] hover:bg-white sm:flex"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#002147] text-xs font-bold text-white">{initials}</div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-900">{user?.name || "User"}</p>
                  <p className="text-[11px] text-slate-500">{user?.role || "Member"}</p>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#002147] text-sm font-bold text-white">{initials}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{user?.name || "User"}</p>
                      <p className="truncate text-xs text-slate-500">{user?.email || "user@campus.edu"}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => setProfileOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <UserRound className="h-4 w-4" />
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setProfileOpen(false);
                        await onLogout?.();
                      }}
                      className="flex w-full items-center gap-2 rounded-xl bg-[#002147] px-3 py-2 text-left text-sm font-medium text-white transition hover:bg-[#001b38]"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-8xl gap-6 px-4 py-5 pb-24 sm:px-6 lg:px-8 xl:pb-6">
        <aside className="sticky top-24 hidden h-[calc(100svh-7rem)] w-64 shrink-0 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_18px_40px_rgba(0,33,71,0.05)] backdrop-blur xl:flex">
          <div className="border-b border-slate-200 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#002147] text-white shadow-sm">
                <School className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#002147]">{roleLabel}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 py-3">
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onTabChange?.(id)}
                  className={`flex w-full items-center gap-3 border-l-4 px-5 py-3.5 text-left transition-colors ${
                    active
                      ? "border-[#002147] bg-[#e9eff8] text-[#002147]"
                      : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
              <School className="h-4 w-4 text-[#002147]" />
              AcademiaLink
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="rounded-3xl border border-slate-200/70 bg-white/60 shadow-[0_18px_40px_rgba(0,33,71,0.02)] xl:border-0 xl:bg-transparent xl:shadow-none">
            {children}
          </div>
        </div>
      </div>

      {navItems.length > 0 && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/92 px-3 py-2 backdrop-blur-xl xl:hidden">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onTabChange?.(id)}
                  className={`flex min-w-[76px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-colors ${
                    active ? "bg-[#002147] text-white shadow-[0_10px_24px_rgba(0,33,71,0.16)]" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
