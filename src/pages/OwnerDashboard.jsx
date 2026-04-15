import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Theater, Calendar, Ticket, Plus, DollarSign, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiClient } from '../api/api';
import toast from 'react-hot-toast';
import Card from '../Components/ui/Card';
import LoadingSkeleton from '../Components/LoadingSkeleton';
import { format, subDays } from 'date-fns';

const OwnerDashboard = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalTheaters: 0,
        totalShowtimes: 0,
        totalBookings: 0,
        totalRevenue: 0,
        totalSeatsBooked: 0
    });
    const [loading, setLoading] = useState(true);
    const [rawBookings, setRawBookings] = useState([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Load theaters for the current owner
            const theaters = await apiClient('/api/theaters/my-theaters', token);
            let totalBookings = 0;
            let totalRevenue = 0;
            let totalSeatsBooked = 0;

            // Fetch stats for each theater
            let totalTheatersShowtimes = 0;
            if (theaters && theaters.length > 0) {
                const statsPromises = theaters.map(t => 
                    apiClient(`/api/bookings/stats/theater/${t.id}`, token).catch(() => null)
                );
                
                const showtimesPromises = theaters.map(t =>
                    apiClient(`/api/showtimes/theater/${t.id}`, token).catch(() => [])
                );
                
                const statsResults = await Promise.all(statsPromises);
                const showtimesResults = await Promise.all(showtimesPromises);
                
                statsResults.forEach(res => {
                    if (res) {
                        totalBookings += res.totalBookings || 0;
                        totalRevenue += res.totalRevenue || 0;
                        totalSeatsBooked += res.totalSeatsBooked || 0;
                    }
                });

                showtimesResults.forEach(res => {
                    totalTheatersShowtimes += res.length || 0;
                });

                // Fetch raw bookings for the time-series chart and CSV
                const bookingsPromises = theaters.map(t => 
                    apiClient(`/api/bookings/theater/${t.id}`, token).catch(() => [])
                );
                
                const bookingsResults = await Promise.all(bookingsPromises);
                const allBookings = bookingsResults.flat().filter(b => b && b.status === 'CONFIRMED');
                setRawBookings(allBookings);
            }

            setStats({
                totalTheaters: theaters?.length || 0,
                totalShowtimes: totalTheatersShowtimes,
                totalBookings,
                totalRevenue,
                totalSeatsBooked
            });
        } catch (err) {
            console.error(err);
            toast.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    // Calculate aggregated revenue for the last 30 days
    const chartData = useMemo(() => {
        if (!rawBookings || rawBookings.length === 0) return [];

        const dataMap = {};
        // Initialize the last 30 days to 0
        for (let i = 29; i >= 0; i--) {
            const dateStr = format(subDays(new Date(), i), 'MMM dd');
            dataMap[dateStr] = 0;
        }

        rawBookings.forEach(b => {
             if (b.bookingDateTime) {
                 const dateStr = format(new Date(b.bookingDateTime), 'MMM dd');
                 if (dataMap[dateStr] !== undefined) {
                     dataMap[dateStr] += b.totalAmount || 0;
                 }
             }
        });

        return Object.keys(dataMap).map(key => ({
             date: key,
             revenue: dataMap[key]
        }));
    }, [rawBookings]);

    const handleExportCSV = () => {
         if (rawBookings.length === 0) {
             toast.error("No confirmed bookings to export.");
             return;
         }

         const headers = ["Reference,Date,Movie ID,Theater ID,Seats,Total Amount"];
         const rows = rawBookings.map(b => {
              const date = b.bookingDateTime ? new Date(b.bookingDateTime).toISOString().split('T')[0] : 'N/A';
              return `${b.bookingReference},${date},${b.movieId},${b.theaterId},${b.numberOfSeats},${b.totalAmount}`;
         });

         const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
         const encodedUri = encodeURI(csvContent);
         const link = document.createElement("a");
         link.setAttribute("href", encodedUri);
         link.setAttribute("download", `FinOps_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         
         toast.success("Financial report exported!");
    };

    const quickActions = [
        {
            title: 'Add Theater',
            icon: Plus,
            color: 'from-blue-500 to-blue-600',
            action: () => navigate('/admin/theaters/new'),
        },
        {
            title: 'Manage Theaters',
            icon: Theater,
            color: 'from-purple-500 to-purple-600',
            action: () => navigate('/admin/theaters'),
        },
        {
            title: 'Manage Showtimes',
            icon: Calendar,
            color: 'from-green-500 to-green-600',
            action: () => navigate('/admin/showtimes'),
        },
        {
            title: 'View Bookings',
            icon: Ticket,
            color: 'from-red-500 to-red-600',
            action: () => navigate('/my-bookings'),
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
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Theater Owner Dashboard'}
                </h1>
                <p className="text-gray-400 text-lg">
                    Real-time performance metrics and operations
                </p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="My Theaters"
                    value={stats.totalTheaters}
                    icon={Theater}
                    color="from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Revenue"
                    value={`$${stats.totalRevenue.toFixed(2)}`}
                    icon={DollarSign}
                    color="from-green-500 to-green-600"
                />
                <StatCard
                    title="Seats Sold"
                    value={stats.totalSeatsBooked}
                    icon={Users}
                    color="from-yellow-500 to-yellow-600"
                />
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings}
                    icon={Ticket}
                    color="from-purple-500 to-purple-600"
                />
            </div>

            {/* Financial Intelligence Dashboard (Revenue Time-Series) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 rounded-2xl relative overflow-hidden"
            >
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
                     <div>
                         <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">Financial Intelligence</h2>
                         <p className="text-gray-400 text-sm mt-1">30-Day Trailing Gross Revenue</p>
                     </div>
                     <button
                         onClick={handleExportCSV}
                         className="mt-4 sm:mt-0 px-4 py-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/20 transition-all rounded-lg text-sm font-semibold flex items-center gap-2"
                     >
                         <DollarSign size={16} /> Export Revenue Book (CSV)
                     </button>
                </div>

                {chartData.length > 0 ? (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#9ca3af" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    minTickGap={20}
                                />
                                <YAxis 
                                    stroke="#9ca3af" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#4ade80', fontWeight: 'bold' }}
                                    formatter={(value) => [`₹${value}`, 'Revenue']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#22c55e" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl">
                         <p className="text-gray-500 font-medium">Not enough transaction data to plot chart.</p>
                    </div>
                )}
            </motion.div>

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
                            className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center text-center"
                        >
                            <div
                                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
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
        <Card className="p-6 h-full flex flex-col justify-center">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <p className="text-gray-400 font-medium uppercase tracking-wider text-sm">{title}</p>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                </div>
                <p className="text-4xl font-bold tracking-tight">{value}</p>
            </div>
        </Card>
    </motion.div>
);

export default OwnerDashboard;
