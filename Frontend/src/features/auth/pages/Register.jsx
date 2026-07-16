import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Library,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LogIn,
  GraduationCap,
  Users,
} from "lucide-react";

const roles = [
  { id: "STUDENT", label: "Student", Icon: GraduationCap },
  { id: "FACULTY", label: "Faculty", Icon: Users },
];

const Register = () => {
  const { handleRegister, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("STUDENT");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const passwordType = showPassword ? "text" : "password";

  const canSubmit =
    fullName.trim() &&
    email.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    agreed;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Complete all fields and accept the terms to continue.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    await handleRegister({ fullName, email, role, password });
    navigate("/login")
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f7f7fb] text-slate-900 overflow-x-hidden">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,42,78,0.09),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.08),transparent_36%)]" />

      {/* Header */}
      <header className="relative z-10 flex w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 py-3.5 backdrop-blur-md">
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
            Secure Onboarding
          </p>
          <p className="text-sm text-slate-600">
            Create your academic account in minutes.
          </p>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
        <section className="grid w-full max-w-6xl overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] md:grid-cols-[0.92fr_1.08fr]">
          {/* Left Side: Hero Banner */}
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
                Join the Network of Excellence
              </p>
              <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-white">
                Create a trusted account for students & faculty.
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-blue-50/85">
                Register once, then access attendance tools & lecture session
                updates from a unified portal.
              </p>

              <div className="mt-8 flex items-center gap-4 text-sm text-blue-100/80">
                <div className="h-px w-12 bg-blue-100/40" />
                <span className="font-semibold uppercase tracking-[0.22em]">
                  Verified Access
                </span>
              </div>
            </div>
          </aside>

          {/* Right Side: Registration Form */}
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <div className="mb-5 space-y-1.5">
              <h2 className="text-[1.9rem] font-semibold tracking-tight text-slate-900 sm:text-[2.2rem]">
                Create Your Account
              </h2>
              <p className="max-w-xl text-sm text-slate-600">
                Please enter your institutional credentials to begin.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Row 1: Full Name & Email side-by-side on desktop */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  id="full-name"
                  label="Full Name"
                  icon={User}
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Jane Doe"
                  autoComplete="name"
                />
                <Field
                  id="email"
                  label="Email Address"
                  icon={Mail}
                  value={email}
                  type="email"
                  onChange={setEmail}
                  placeholder="username@university.edu"
                  autoComplete="email"
                />
              </div>

              {/* Row 2: Role Selection */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700">
                  <Users className="h-4 w-4 shrink-0" />
                  Select Your Role
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {roles.map((item) => {
                    const selected = role === item.id;
                    const RoleIcon = item.Icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRole(item.id)}
                        className={`flex min-h-12 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
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

              {/* Row 3: Passwords side-by-side */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700"
                  >
                    <Lock className="h-4 w-4 shrink-0" />
                    Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Lock className="h-4 w-4 shrink-0" />
                    </span>
                    <input
                      id="password"
                      type={passwordType}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-[#0b2a55] focus:ring-4 focus:ring-[#0b2a55]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 transition hover:text-slate-800"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirm-password"
                    className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700"
                  >
                    <Lock className="h-4 w-4 shrink-0" />
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Lock className="h-4 w-4 shrink-0" />
                    </span>
                    <input
                      id="confirm-password"
                      type={passwordType}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-[#0b2a55] focus:ring-4 focus:ring-[#0b2a55]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 transition hover:text-slate-800"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-600">
                <input
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0b2a55] focus:ring-[#0b2a55]/20"
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                />
                <span className="leading-5">
                  I agree to the{" "}
                  <a
                    className="font-semibold text-[#0b2a55] hover:underline"
                    href="#"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    className="font-semibold text-[#0b2a55] hover:underline"
                    href="#"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={loading}
                className="button flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0b2a55] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(11,42,85,0.22)] transition hover:bg-[#13386b] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating Account..." : "Create Account"}
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>

              <div className="flex items-center gap-4 pt-1 text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Already have an account
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <LogIn className="h-4 w-4 shrink-0" />
                Log In
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex w-full flex-col gap-3 border-t border-slate-200/80 bg-white/80 px-6 py-4 text-xs text-slate-600 backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div className="font-bold tracking-tight text-[#0a1430] text-sm">
          AcademiaLink
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 font-semibold">
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

// Reusable Field Component passed with Lucide Icon Components
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
    <div className="space-y-1.5 w-full">
      <label
        className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700"
        htmlFor={id}
      >
        {IconComp && <IconComp className="h-4 w-4 shrink-0" />}
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
          {IconComp && <IconComp className="h-4 w-4 shrink-0" />}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#0b2a55] focus:ring-4 focus:ring-[#0b2a55]/10"
        />
      </div>
    </div>
  );
}

export default Register;
