import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Mail, Phone, Globe, MapPin, User, Zap, Layers, ShieldCheck } from "lucide-react";
import Logo from "../../components/auth/Logo";
import FloatingStatCards from "../../components/auth/FloatingStatCards";
import RoleToggleGroup from "../../components/auth/RoleToggleGroup";
import PasswordField from "../../components/auth/PasswordField";
import FormField from "../../components/ui/FormField";
import SelectField from "../../components/ui/SelectField";
import Button from "../../components/ui/Button";
import { INDIAN_STATES } from "../../data/indianStates";
import { ROLES } from "../../constants/roles";
import {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  PASSWORD_HINT,
  PHONE_HINT,
} from "../../utils/validators";
import { registerApi } from "../../api/auth.api";

const initialForm = {
  role: ROLES[0].value,
  fullName: "",
  companyName: "",
  email: "",
  phone: "",
  password: "",
  state: "",
  agreeTerms: false,
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (field) => (e) => {
    const value = field === "agreeTerms" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const setPhone = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, phone: digitsOnly }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.companyName.trim()) next.companyName = "Company name is required.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (!isValidPhone(form.phone)) next.phone = "Enter a valid 10-digit mobile number.";
    if (!isValidPassword(form.password)) next.password = PASSWORD_HINT;
    if (!form.state) next.state = "Select a state.";
    if (!form.agreeTerms) next.agreeTerms = "You must accept the Terms and Privacy Policy.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await registerApi({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone,
        password: form.password,
        role: form.role,
        country: "India",
        state: form.state,
        companyName: form.companyName.trim(),
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col px-6 py-8 sm:px-16 sm:py-12">
        <div className="flex items-center justify-between">
          <Logo float />
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-brand-600"
          >
            Log In <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="mx-auto mt-10 w-full max-w-md">
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
            Create your free account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Start managing billing, quotations, and your bank books in one place.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
            <RoleToggleGroup
              value={form.role}
              onChange={(role) => setForm((f) => ({ ...f, role }))}
            />

            {/*
              Not present in the approved screenshot, but the backend
              register API requires `fullName` (backend/src/controllers/
              auth.controller.js) — registration fails without it. Added as
              the minimal necessary deviation; flagged for your review.
            */}
            <FormField
              icon={User}
              placeholder="Full Name"
              value={form.fullName}
              onChange={setField("fullName")}
              error={errors.fullName}
            />

            <FormField
              icon={Building2}
              placeholder="Company Name"
              value={form.companyName}
              onChange={setField("companyName")}
              error={errors.companyName}
            />

            <FormField
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={setField("email")}
              error={errors.email}
            />

            <div>
              <div
                className={`flex items-center gap-2 rounded-xl border bg-white px-3.5 py-3 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 ${
                  errors.phone ? "border-red-400" : "border-gray-200"
                }`}
              >
                <Phone size={18} className="shrink-0 text-gray-400" />
                <span className="shrink-0 text-sm text-gray-500">+91</span>
                <span className="h-4 w-px bg-gray-200" />
                <input
                  inputMode="numeric"
                  placeholder="Mobile Number"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-gray-400"
                  value={form.phone}
                  onChange={setPhone}
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {errors.phone ?? PHONE_HINT}
              </p>
            </div>

            <PasswordField
              placeholder="Password"
              value={form.password}
              onChange={setField("password")}
              error={errors.password}
              hint={PASSWORD_HINT}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/*
                Only India is currently supported by the backend's phone
                validation, so Country is fixed rather than a live dropdown —
                a frontend-only simplification, not a functional selector.
              */}
              <SelectField icon={Globe} defaultValue="India" disabled>
                <option>India</option>
              </SelectField>

              <SelectField
                icon={MapPin}
                value={form.state}
                onChange={setField("state")}
                error={errors.state}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectField>
            </div>

            <p className="text-xs text-gray-400">
              Your data will be in <span className="font-medium text-ink">INDIA</span> data center.
            </p>

            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                checked={form.agreeTerms}
                onChange={setField("agreeTerms")}
              />
              <span>
                I agree to the{" "}
                <span className="font-medium text-brand-600">Terms of Service</span> and{" "}
                <span className="font-medium text-brand-600">Privacy Policy</span>.
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="-mt-2 text-xs text-red-500">{errors.agreeTerms}</p>
            )}

            {submitError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {submitError}
              </p>
            )}

            <Button type="submit" variant="soft" loading={loading}>
              Create my account
            </Button>
            <p className="text-center text-xs text-gray-400">*No credit card required</p>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-brand-600">
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Right: marketing panel */}
      <div className="relative hidden overflow-hidden border-l border-gray-100 bg-gradient-to-br from-brand-50 to-white lg:block">
        <FloatingStatCards />
        <div className="absolute bottom-16 left-12 right-12">
          <h2 className="text-2xl font-semibold text-ink">
            The financial workspace built for Indian businesses.
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <Zap size={16} className="text-brand-600" /> Bill a customer in under a minute
            </li>
            <li className="flex items-center gap-2">
              <Layers size={16} className="text-brand-600" /> One-click quotation to invoice
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-600" /> GST-ready, multi-bank reconciled
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
