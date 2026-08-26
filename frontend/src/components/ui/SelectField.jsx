export default function SelectField({ icon: Icon, error, className = "", children, ...selectProps }) {
  return (
    <div className={className}>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-white px-3.5 py-3 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 ${
          error ? "border-red-400" : "border-gray-200"
        }`}
      >
        {Icon && <Icon size={18} className="shrink-0 text-gray-400" />}
        <select
          className="w-full bg-transparent text-sm text-ink outline-none"
          {...selectProps}
        >
          {children}
        </select>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
