import { Navigate, useLocation } from "react-router-dom";

export const ProtectedRoute = ({ children, roles = [], permissions = [] }) => {
  const { isAuthenticated, hasAnyRole, hasAnyPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !hasAnyRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (permissions.length > 0 && !hasAnyPermission(permissions)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};
