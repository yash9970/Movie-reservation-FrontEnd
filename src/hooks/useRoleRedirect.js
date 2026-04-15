import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * Hook to redirect users to appropriate dashboard based on role
 * @returns {string} - Dashboard path for user's role
 */
export const useRoleRedirect = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && user) {
            const dashboardPath = getRoleDashboard(user.role);
            navigate(dashboardPath, { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    return user ? getRoleDashboard(user.role) : '/login';
};

/**
 * Get dashboard path based on user role
 * @param {string} role - User role
 * @returns {string} - Dashboard path
 */
export const getRoleDashboard = (role) => {
    switch (role) {
        case 'ADMIN':
            return '/admin/dashboard';
        case 'THEATER_OWNER':
            return '/owner/dashboard';
        case 'CUSTOMER':
        default:
            return '/movies';
    }
};
