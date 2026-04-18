import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Film, User, LogOut, Ticket, LayoutDashboard, Settings, ShoppingCart, Coffee, Shield, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Role-based navigation items
  const getNavigationItems = () => {
    if (user?.role === 'ADMIN') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Movies', path: '/admin/movies', icon: Film },
        { label: 'Privileged Users', path: '/admin/setup', icon: Shield },
      ];
    } else if (user?.role === 'THEATER_OWNER') {
      return [
        { label: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
        { label: 'My Theaters', path: '/admin/theaters', icon: Settings },
        { label: 'Showtimes', path: '/admin/showtimes', icon: Film },
        { label: 'Box Office (POS)', path: '/admin/box-office', icon: ShoppingCart },
        { label: 'My Bookings', path: '/my-bookings', icon: Ticket },
      ];
    } else if (user?.role === 'THEATER_MANAGER') {
      return [
        { label: 'Box Office (POS)', path: '/admin/box-office', icon: ShoppingCart },
      ];
    } else {
      return [
        { label: 'Movies', path: '/movies', icon: Film },
        { label: 'My Bookings (Order Food)', path: '/my-bookings', icon: Coffee },
      ];
    }
  };

  const navigationItems = getNavigationItems();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="glass-panel m-4 px-4 md:px-6 py-4 sticky top-4 z-[100] rounded-2xl shadow-xl"
      >
        <div className="flex justify-between items-center">
          <div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => navigate(navigationItems[0].path)}
          >
            <div className="relative">
                <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-gradient-to-br from-red-500 to-red-800 p-2.5 rounded-xl shadow-lg transform group-hover:rotate-6 transition-transform">
                    <Film className="h-6 w-6 text-white" />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black tracking-tighter text-white leading-none">
                    CINE<span className="text-red-500">MAX</span>
                </span>
                <span className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase mt-1">Enterprise</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm
                  ${window.location.pathname === item.path 
                    ? 'bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon className={`h-4.5 w-4.5 ${window.location.pathname === item.path ? 'text-red-500' : 'text-gray-500'}`} />
                {item.label}
              </button>
            ))}

            <div className="w-px h-8 bg-white/10 mx-2" />

            {/* User Profile */}
            <div
              className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5 text-red-500" />
              <div className="flex flex-col items-start max-w-[120px]">
                <span className="text-sm font-semibold truncate w-full">{user?.email || 'Profile'}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{user?.role}</span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2.5 hover:bg-red-500/10 rounded-xl transition-colors group"
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-gray-500 group-hover:text-red-500" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className="lg:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="lg:hidden mt-4 pt-4 border-t border-white/5 overflow-hidden"
                >
                    <div className="flex flex-col gap-2">
                        {navigationItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                    ${window.location.pathname === item.path ? 'bg-red-500/10 text-red-500' : 'text-gray-400'}`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </button>
                        ))}
                        <div className="h-px bg-white/5 my-2" />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold"
                        >
                            <LogOut className="h-5 w-5" />
                            Logout Session
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default Layout;
