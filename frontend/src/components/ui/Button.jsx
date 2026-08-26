const VARIANTS = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300",
  soft: "bg-brand-300 text-white hover:bg-brand-400 disabled:bg-brand-200",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  loading,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`w-full rounded-xl px-4 py-3 font-medium transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
