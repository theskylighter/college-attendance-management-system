import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Library,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  Users,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

const roles = [
  { id: "STUDENT", label: "Student", Icon: GraduationCap },
  { id: "FACULTY", label: "Faculty", Icon: Users },
  { id: "ADMIN", label: "Admin", Icon: ShieldCheck },
];

// Seeded demo accounts (Backend/prisma/seed.js, password "demo123").
// Shown on the login page so reviewers can try each role with one click.
const DEMO_ACCOUNTS = [
  {
    role: "ADMIN",
    label: "Admin",
    Icon: ShieldCheck,
    email: "admin@college.edu",
    password: "demo123",
  },
  {
    role: "FACULTY",
    label: "Faculty",
    Icon: Users,
    email: "priya.sharma@college.edu",
    password: "demo123",
  },
  {
    role: "STUDENT",
    label: "Student",
    Icon: GraduationCap,
    email: "aarav.singh@college.edu",
    password: "demo123",
  },
];

const Login = () => {
  const { handleLogin, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const passwordType = showPassword ? "text" : "password";
  const canSubmit = email.trim() && password.trim();

  const fillDemoAccount = (demo) => {
    setError("");
    setRole(demo.role);
    setEmail(demo.email);
    setPassword(demo.password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Complete all fields and accept the terms to continue.");
      return;
    }
    
    try {
      const role = await handleLogin({ email, password });

      // 2. Redirect based on role
      if (role === "STUDENT") navigate("/student/dashboard");
      else if (role === "FACULTY") navigate("/faculty/schedule");
      else navigate("/admin/dashboard");
    } catch (err) {
      // 3. The error successfully bubbles up from the API -> Context -> Here
      setError(
        err.response?.data?.error ||
          "Login failed. Please check your credentials.",
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f7f7fb] text-slate-900">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,42,78,0.09),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.08),transparent_36%)]" />

      {/* Header */}
      <header className="relative z-10 flex w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 py-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-left transition hover:opacity-80"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#0b2a55] shadow-[0_10px_30px_rgba(11,42,85,0.2)]">
            <Library aria-hidden="true" className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-[1.55rem] font-extrabold tracking-tight text-[#0a1430] sm:text-[1.9rem]">
              AcademiaLink
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Institutional Portal
            </p>
          </div>
        </button>

        <div className="hidden text-right md:block">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Secure Access
          </p>
          <p className="text-sm text-slate-600">
            Manage your academic journey.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] md:grid-cols-[0.92fr_1.08fr]">
          {/* Left Side: Hero Image & Branding */}
          <aside className="relative hidden min-h-full overflow-hidden bg-[#0b2a55] md:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_38%)]" />
            <div
              className="absolute inset-0 opacity-10 mix-blend-screen"
              style={{
                backgroundImage:
                  "url('https://www.mnit.ac.in/students/images/mnit_infrastructure_photos_5.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            <div className="relative flex min-h-full flex-col justify-end p-10 text-white">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100/80">
                Welcome Back
              </p>
              <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-white">
                Access your personalized academic dashboard.
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-blue-50/85">
                Review attendance, manage lecture sessions, and stay connected
                with the network of excellence.
              </p>

              <div className="mt-8 flex items-center gap-4 text-sm text-blue-100/80">
                <div className="h-px w-12 bg-blue-100/40" />
                <span className="font-semibold uppercase tracking-[0.22em]">
                  Restricted Access
                </span>
              </div>
            </div>
          </aside>

          {/* Right Side: Login Form */}
          <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-14">
            <div className="mb-8 space-y-3">
              <h2 className="text-[1.9rem] font-semibold tracking-tight text-slate-900 sm:text-[2.2rem]">
                Log In to Portal
              </h2>
              <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Please enter your institutional credentials to continue.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700">
                  <Users className="h-5 w-5 shrink-0" />
                  Select Your Role
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {roles.map((item) => {
                    const selected = role === item.id;
                    const RoleIcon = item.Icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRole(item.id)}
                        className={`flex min-h-12 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                          selected
                            ? "border-[#0b2a55] bg-[#d6e3ff] text-[#0b2a55] shadow-[0_8px_20px_rgba(11,42,85,0.08)]"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        <RoleIcon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extracted Reusable Input Field */}
              <Field
                id="email"
                label="Institutional Email"
                icon={Mail}
                value={email}
                onChange={setEmail}
                type="email"
                placeholder="id@university.ac.in"
                autoComplete="email"
              />

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700"
                  >
                    <Lock className="h-4 w-4 shrink-0" />
                    Password
                  </label>
                  <a
                    className="text-xs font-semibold text-[#0b2a55] hover:underline"
                    href="#"
                  >
                    Forgot Password?
                  </a>
                </div>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="h-5 w-5 shrink-0" />
                  </span>
                  <input
                    id="password"
                    type={passwordType}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition focus:border-[#0b2a55] focus:ring-4 focus:ring-[#0b2a55]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 transition hover:text-slate-800"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 shrink-0" />
                    ) : (
                      <Eye className="h-5 w-5 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Demo accounts for reviewers */}
              <div>
                <div className="mb-3 flex items-center gap-4 text-slate-400">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Try a demo account
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {DEMO_ACCOUNTS.map((demo) => {
                    const DemoIcon = demo.Icon;
                    return (
                      <button
                        key={demo.role}
                        type="button"
                        onClick={() => fillDemoAccount(demo)}
                        title={`Fill ${demo.email} / demo password`}
                        className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 transition-all hover:border-[#0b2a55] hover:bg-[#d6e3ff]/50"
                      >
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-[#0b2a55]">
                          <DemoIcon className="h-4 w-4 shrink-0" />
                          {demo.label}
                        </span>
                        <span className="max-w-full truncate text-xs text-slate-500">
                          {demo.email}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-center text-xs text-slate-500">
                  Fills the form with demo credentials — just press Log In.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="button flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#0b2a55] px-6 text-base font-semibold text-white shadow-[0_10px_24px_rgba(11,42,85,0.22)] transition hover:bg-[#13386b] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Authenticating..." : "Log In"}
                <ArrowRight className="h-5 w-5 shrink-0" />
              </button>

              <div className="flex items-center gap-4 pt-4 text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  New to Portal
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <UserPlus className="h-4 w-4 shrink-0" />
                Create an Account
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex w-full flex-col gap-4 border-t border-slate-200/80 bg-white/80 px-6 py-6 text-sm text-slate-600 backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div className="font-bold tracking-tight text-[#0a1430]">
          AcademiaLink
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-semibold">
          <a
            className="transition hover:text-[#0b2a55] hover:underline"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="transition hover:text-[#0b2a55] hover:underline"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="transition hover:text-[#0b2a55] hover:underline"
            href="#"
          >
            Support
          </a>
        </div>
        <div>
          © 2026 AcademiaLink Institutional Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

// Reusable Field Component (Clean Code pattern)
function Field({
  id,
  label,
  icon: IconComp,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}) {
  return (
    <div className="space-y-2">
      <label
        className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700"
        htmlFor={id}
      >
        {IconComp && <IconComp className="h-4 w-4 shrink-0" />}
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
          {IconComp && <IconComp className="h-5 w-5 shrink-0" />}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#0b2a55] focus:ring-4 focus:ring-[#0b2a55]/10"
        />
      </div>
    </div>
  );
}

export default Login;
