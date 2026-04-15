import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Theater, Users, Ticket, Plus, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { apiClient } from '../../api/api';
import toast from 'react-hot-toast';
import Card from '../../Components/ui/Card';
import LoadingSkeleton from '../../Components/LoadingSkeleton';

const AdminDashboard = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalMovies: 0,
        totalTheaters: 0,
        totalUsers: 0,
        totalBookings: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Load statistics from various endpoints
            const [movies, theaters] = await Promise.all([
                apiClient('/api/movies', token),
                apiClient('/api/theaters', token),
            ]);

            setStats({
                totalMovies: movies?.length || 0,
                totalTheaters: theaters?.length || 0,
                totalUsers: 0, // Will need /api/users endpoint
                totalBookings: 0, // Will need /api/bookings endpoint
            });
        } catch (err) {
            toast.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Add Movie',
            icon: Film,
            color: 'from-red-500 to-red-600',
            action: () => navigate('/admin/movies/new'),
        },
        {
            title: 'Add Theater',
            icon: Theater,
            color: 'from-blue-500 to-blue-600',
            action: () => navigate('/admin/theaters/new'),
        },
        {
            title: 'Manage Movies',
            icon: Film,
            color: 'from-purple-500 to-purple-600',
            action: () => navigate('/admin/movies'),
        },
        {
            title: 'Manage Theaters',
            icon: Theater,
            color: 'from-green-500 to-green-600',
            action: () => navigate('/admin/theaters'),
        },
        {
            title: 'Create User Account',
            icon: Shield,
            color: 'from-red-600 to-red-800',
            action: () => navigate('/admin/setup'),
        },
    ];

    if (loading) {
        return (
            <div className="space-y-8">
                <LoadingSkeleton variant="text" className="h-12 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <LoadingSkeleton key={i} variant="card" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 py-8"
            >
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
                    Admin Dashboard
                </h1>
                <p className="text-gray-400 text-lg">
                    Manage your movie booking platform
                </p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Movies"
                    value={stats.totalMovies}
                    icon={Film}
                    color="from-red-500 to-red-600"
                />
                <StatCard
                    title="Total Theaters"
                    value={stats.totalTheaters}
                    icon={Theater}
                    color="from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="from-purple-500 to-purple-600"
                />
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings}
                    icon={Ticket}
                    color="from-green-500 to-green-600"
                />
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickActions.map((action, index) => (
                        <motion.button
                            key={action.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            onClick={action.action}
                            className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group"
                        >
                            <div
                                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                            >
                                <action.icon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold">{action.title}</h3>
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
    >
        <Card className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm mb-1">{title}</p>
                    <p className="text-4xl font-bold">{value}</p>
                </div>
                <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center`}
                >
                    <Icon className="h-8 w-8 text-white" />
                </div>
            </div>
        </Card>
    </motion.div>
);

export default AdminDashboard;
