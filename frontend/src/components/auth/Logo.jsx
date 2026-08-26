import { Gem } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo({ float = false, center = false }) {
  return (
    <Link
      to="/register"
      className={`inline-flex items-center gap-2 ${center ? "justify-center" : ""}`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm ${
          float ? "animate-float-logo" : ""
        }`}
      >
        <Gem size={18} />
      </span>
      <span className="text-lg font-semibold text-ink">Trove</span>
    </Link>
  );
}
