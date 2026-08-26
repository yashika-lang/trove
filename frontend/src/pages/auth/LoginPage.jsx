import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Building2, Mail, ChevronLeft } from "lucide-react";
import Logo from "../../components/auth/Logo";
import PasswordField from "../../components/auth/PasswordField";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { getRoleByParam } from "../../constants/roles";
import { useAuth } from "../../context/AuthContext";
import { logoutApi } from "../../api/auth.api";

export default function LoginPage() {
  const { role: roleParam } = useParams();
  const role = getRoleByParam(roleParam);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [companyName, setCompanyName] = useState(""); // UI only, see note below
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!role) {
    return <NotFoundRole />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email: email.trim(), password, rememberMe });

      if (user.role?.toLowerCase() !== role.value.toLowerCase()) {
        // Backend authenticated successfully but under a different role than
        // the tab the user picked. Clear the session we just created instead
        // of leaving a mismatched cookie/session behind, and surface the
        // real role instead of silently redirecting.
        await logoutApi().catch(() => {});
        setError(
          `This account is registered as ${user.role}, not ${role.label}. Please choose the correct role.`
        );
        return;
      }

      navigate(`/${role.param}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Logo center float />

      <div className="mt-8 w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-ink"
        >
          <ChevronLeft size={16} /> Back to roles
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-ink sm:text-3xl">
          Sign in as {role.label}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your credentials to access the workspace.
        </p>

        {location.state?.registered && (
          <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
            Account created successfully. Please log in.
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          {/*
            Kept for design consistency per your decision, but NOT sent to
            the API — backend/src/controllers/auth.controller.js `loginUser`
            only accepts { email, password }. Role is verified after login by
            comparing the selected tab against the returned user.role.
          */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Company Name
            </label>
            <FormField
              icon={Building2}
              placeholder="Your company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Email Address
            </label>
            <FormField
              icon={Mail}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Password
            </label>
            <PasswordField
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            {/* Forgot password removed — no backend reset flow exists yet. */}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" loading={loading}>
            Sign In
          </Button>
        </form>

        {/* Social login removed — no OAuth support in the backend yet. */}

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-brand-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function NotFoundRole() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm text-gray-500">Unknown role.</p>
      <Link to="/login" className="mt-2 font-medium text-brand-600">
        Back to role selection
      </Link>
    </div>
  );
}
