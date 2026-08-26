import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/auth/Logo";
import RoleCard from "../../components/auth/RoleCard";
import { ROLES } from "../../constants/roles";

export default function RoleSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Logo center float />

      <h1 className="mt-8 text-center text-2xl font-semibold text-ink sm:text-3xl">
        Select your role
      </h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        Log in to explore role-based features and permissions.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        {ROLES.map((role) => (
          <RoleCard
            key={role.param}
            role={role}
            onClick={() => navigate(`/login/${role.param}`)}
          />
        ))}
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-brand-600">
          Sign up here
        </Link>
      </p>
    </div>
  );
}
