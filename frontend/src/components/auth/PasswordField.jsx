import { useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";

export default function PasswordField({ error, hint, className = "", ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-white px-3.5 py-3 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 ${
          error ? "border-red-400" : "border-gray-200"
        }`}
      >
        <KeyRound size={18} className="shrink-0 text-gray-400" />
        <input
          type={visible ? "text" : "password"}
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-gray-400"
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="shrink-0 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}
