import { ROLES } from "../../constants/roles";

export default function RoleToggleGroup({ value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">Who are you signing up as?</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {ROLES.map((role) => {
          const selected = value === role.value;
          return (
            <button
              type="button"
              key={role.param}
              onClick={() => onChange(role.value)}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                selected
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <span
                className={`h-3.5 w-3.5 rounded-full border-2 ${
                  selected ? "border-brand-600 bg-brand-600" : "border-gray-300"
                }`}
              />
              {role.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
