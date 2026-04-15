import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building2, Film, Users, Banknote, CalendarDays, Ticket, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiClient } from '../api/api';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../Components/LoadingSkeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

const ManagerDashboard = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ theaters: 0, showtimes: 0, revenue: 0, bookings: 0 });
    const [loading, setLoading] = useState(true);
    const [rawBookings, setRawBookings] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // As a Manager, getting my theaters fetches only assigned theaters.
            const theaters = await apiClient('/api/theaters/my-theaters', token);
            let totalRevenue = 0;
            let totalBookings = 0;

            if (theaters && theaters.length > 0) {
                // Fetch stats for each theater
                const statsPromises = theaters.map(t => 
                    apiClient(`/api/bookings/stats/theater/${t.id}`, token).catch(() => null)
                );
                
                const statsResults = await Promise.all(statsPromises);
                
                statsResults.forEach(res => {
                    if (res) {
                        totalRevenue += res.totalRevenue || 0;
                        totalBookings += res.totalBookings || 0;
                    }
                });

                // Fetch raw bookings for the time-series chart
                const bookingsPromises = theaters.map(t => 
                    apiClient(`/api/bookings/theater/${t.id}`, token).catch(() => [])
                );
                
                const bookingsResults = await Promise.all(bookingsPromises);
                const allBookings = bookingsResults.flat().filter(b => b && b.status === 'CONFIRMED');
                setRawBookings(allBookings);
            }

            setStats({
                theaters: theaters.length,
                showtimes: 0, // Could fetch actual showtimes like OwnerDashboard if needed
                revenue: totalRevenue,
                bookings: totalBookings
            });
            
        } catch (err) {
            toast.error('Failed to load manager dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate aggregated revenue for the last 30 days
    const chartData = useMemo(() => {
        if (!rawBookings || rawBookings.length === 0) return [];

        const dataMap = {};
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
         link.setAttribute("download", `Manager_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         
         toast.success("Financial report exported!");
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton variant="text" className="h-10 w-48 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LoadingSkeleton variant="card" className="h-32" />
                    <LoadingSkeleton variant="card" className="h-32" />
                </div>
            </div>
        );
    }

    const cards = [
        {
            title: 'My Theaters',
            value: stats.theaters,
            icon: Building2,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            desc: 'Theaters assigned to you',
            link: '/admin/theaters'
        },
        {
            title: 'Revenue',
            value: `₹${stats.revenue.toFixed(2)}`,
            icon: DollarSign,
            color: 'text-green-400',
            bg: 'bg-green-400/10',
            desc: 'Total gross revenue',
            link: '#'
        },
        {
            title: 'Box Office POS',
            value: 'Terminal',
            icon: Ticket,
            color: 'text-red-400',
            bg: 'bg-red-400/10',
            desc: 'Process physical tickets',
            link: '/admin/box-office'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        Manager Portal
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Welcome back, {user?.firstName} {user?.lastName}. Monitor your local operations.
                    </p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/20 transition-all rounded-lg text-sm font-semibold flex items-center gap-2 w-fit"
                >
                    <DollarSign size={16} /> Export Manager Report (CSV)
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 cursor-pointer hover:border-white/20 transition-all hover:scale-105"
                        onClick={() => card.link !== '#' && navigate(card.link)}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                                <h3 className="text-3xl font-bold text-white mt-2">{card.value}</h3>
                                <p className="text-xs text-gray-500 mt-2">{card.desc}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${card.bg}`}>
                                <card.icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Revenue Analytics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
            >
                <h2 className="text-xl font-bold mb-6">Revenue Analytics</h2>
                {chartData.length > 0 ? (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#818cf8' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#818cf8" fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[200px] flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                        <p className="text-gray-500">No recent transaction data available.</p>
                    </div>
                )}
            </motion.div>

            {/* Quick Box Office Access */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-4">Quick Box Office Access</h2>
                <div className="bg-black/40 rounded-lg p-6 text-center border text-sm text-gray-400 border-white/5">
                    Select the Box Office POS to ring up walk-in customers and check-in tickets instantly.
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
