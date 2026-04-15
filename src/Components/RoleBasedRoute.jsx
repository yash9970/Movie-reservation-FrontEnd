import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * Role-based route protection component
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string[]} props.allowedRoles - Array of allowed roles
 * @param {string} props.redirectTo - Path to redirect if access denied
 */
const RoleBasedRoute = ({ children, allowedRoles, redirectTo = '/' }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

export default RoleBasedRoute;
