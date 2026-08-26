import { useEffect, useState } from "react";
import { User, Mail, Phone, Briefcase, Shield, Calendar, Clock, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import { getMyProfileApi, updateMyProfileApi } from "../../api/profile.api";
import { changePasswordApi } from "../../api/auth.api";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

function initialsOf(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function ProfilePage() {
  const { user: cachedUser, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState("");
  const [infoSaved, setInfoSaved] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const refresh = () => {
    getMyProfileApi()
      .then((data) => {
        setProfile(data);
        setFullName(data.user.fullName || "");
        setPhone(data.user.phone || "");
        setDepartment(data.user.department || "");
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setInfoError("");
    setInfoSaved(false);
    setSavingInfo(true);
    try {
      await updateMyProfileApi({ fullName, phone, department });
      refresh();
      setInfoSaved(true);
      setTimeout(() => setInfoSaved(false), 3000);
    } catch (err) {
      setInfoError(err.message);
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      await changePasswordApi({ oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;
  }

  if (!profile) {
    return <p className="text-sm text-gray-400">Loading profile…</p>;
  }

  const { user } = profile;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-xl font-semibold text-white">
          {initialsOf(user.fullName)}
        </span>
        <div>
          <h1 className="text-xl font-semibold text-ink">{user.fullName || "—"}</h1>
          <p className="text-sm text-gray-500">
            {user.role} · {user.company?.name}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSaveInfo}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <h2 className="text-base font-semibold text-ink">Personal Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field icon={User} label="Full Name">
            <input
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>
          <Field icon={Mail} label="Email">
            <input
              className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-sm text-gray-500"
              value={user.email}
              disabled
            />
          </Field>
          <Field icon={Phone} label="Phone">
            <input
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field icon={Briefcase} label="Department">
            <input
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="Optional"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </Field>
        </div>

        {infoError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{infoError}</p>}
        {infoSaved && <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">Saved.</p>}

        <div className="mt-4 w-40">
          <Button type="submit" loading={savingInfo}>
            Save Changes
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Account Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field icon={Shield} label="Role">
            <p className="text-sm text-ink">{user.role}</p>
          </Field>
          <Field icon={Shield} label="Account Status">
            <p className="text-sm text-ink">Active</p>
          </Field>
          <Field icon={Clock} label="Last Login">
            <p className="text-sm text-ink">{formatDateTime(user.lastLogin)}</p>
          </Field>
          <Field icon={Calendar} label="Joined Date">
            <p className="text-sm text-ink">{formatDate(user.joinDate)}</p>
          </Field>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Your role is managed by your company's admin and can't be changed from this page.
        </p>
      </div>

      <form
        onSubmit={handleChangePassword}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-brand-600" />
          <h2 className="text-base font-semibold text-ink">Security</h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">Change your password.</p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Current Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">New Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Confirm New Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {passwordError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{passwordError}</p>}
        {passwordSaved && <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">Password updated.</p>}

        <div className="mt-4 w-40">
          <Button type="submit" variant="soft" loading={changingPassword}>
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <Icon size={13} /> {label}
      </label>
      {children}
    </div>
  );
}
