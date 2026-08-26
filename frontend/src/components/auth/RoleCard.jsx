export default function RoleCard({ role, onClick }) {
  const Icon = role.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-64 rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={20} />
      </span>
      <p className="mt-4 text-base font-semibold text-ink">{role.label}</p>
      <p className="mt-1 text-sm text-gray-500">{role.description}</p>
    </button>
  );
}
