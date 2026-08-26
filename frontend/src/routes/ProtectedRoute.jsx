import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleByValue } from "../constants/roles";

// Guards a route: requires an authenticated user whose backend `role`
// matches one of allowedRoles (mirrors the same route's authorizeRoles()
// list on the backend). Anyone else is redirected rather than shown a
// module their account can't call the API for.
export default function ProtectedRoute({ allowedRole, allowedRoles, children }) {
  const { user, isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const roles = (allowedRoles ?? [allowedRole]).map((r) => r.toLowerCase());

  if (!roles.includes(user.role?.toLowerCase())) {
    const ownRole = getRoleByValue(user.role);
    return <Navigate to={ownRole ? `/${ownRole.param}/dashboard` : "/login"} replace />;
  }

  return children;
}
