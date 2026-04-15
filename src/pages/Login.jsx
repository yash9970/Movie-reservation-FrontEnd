import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Mail, Lock, Eye, EyeOff, ArrowRight, Star } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/constants";

const floatingSeats = [
  { id: 1, x: "10%", y: "15%", delay: 0, size: 32 },
  { id: 2, x: "80%", y: "10%", delay: 0.5, size: 24 },
  { id: 3, x: "5%", y: "65%", delay: 1, size: 20 },
  { id: 4, x: "85%", y: "70%", delay: 1.5, size: 28 },
  { id: 5, x: "45%", y: "5%", delay: 0.8, size: 18 },
  { id: 6, x: "70%", y: "85%", delay: 0.3, size: 22 },
];

const FloatingStar = ({ x, y, delay, size }) => (
  <motion.div
    className="absolute opacity-20 pointer-events-none"
    style={{ left: x, top: y }}
    animate={{ y: ["0%", "-20%", "0%"], opacity: [0.15, 0.35, 0.15] }}
    transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  >
    <Star style={{ width: size, height: size }} className="text-red-400 fill-red-400" />
  </motion.div>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Invalid credentials");
        return;
      }
      login(data);
      toast.success(`Welcome back!`);
      if (data.role === "ADMIN") navigate("/admin/dashboard");
      else if (data.role === "THEATER_OWNER") navigate("/owner/dashboard");
      else if (data.role === "THEATER_MANAGER") navigate("/manager/dashboard");
      else navigate("/movies");
    } catch {
      toast.error("Cannot reach server — is Docker running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-gradient" />
        <div className="login-bg-grid" />
        {floatingSeats.map((s) => (
          <FloatingStar key={s.id} {...s} />
        ))}
      </div>

      <div className="login-container">
        {/* LEFT PANEL — cinematic branding */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="login-brand-panel"
        >
          {/* Logo */}
          <div className="login-logo">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="login-logo-icon"
            >
              <Film className="w-10 h-10 text-white" />
            </motion.div>
          </div>

          <div className="login-brand-content">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="login-brand-title"
            >
              CineMax
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="login-brand-tagline"
            >
              Your premium movie<br />reservation experience
            </motion.p>

            {/* Film strip decoration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="login-filmstrip"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="login-filmstrip-frame" />
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="login-stats"
            >
              {[
                { label: "Movies", value: "500+" },
                { label: "Theaters", value: "50+" },
                { label: "Happy Fans", value: "1M+" },
              ].map((stat) => (
                <div key={stat.label} className="login-stat">
                  <span className="login-stat-value">{stat.value}</span>
                  <span className="login-stat-label">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT PANEL — form */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="login-form-panel"
        >
          <div className="login-form-card">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="login-form-header"
            >
              <h2 className="login-form-title">Welcome Back</h2>
              <p className="login-form-subtitle">Sign in to book your next cinematic adventure</p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Email field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="login-field"
              >
                <label className="login-label">Email Address</label>
                <div className={`login-input-wrap ${focusedField === "email" ? "focused" : ""}`}>
                  <Mail className="login-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    className="login-input"
                    required
                  />
                </div>
              </motion.div>

              {/* Password field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="login-field"
              >
                <label className="login-label">Password</label>
                <div className={`login-input-wrap ${focusedField === "password" ? "focused" : ""}`}>
                  <Lock className="login-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="login-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-eye-btn"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading}
                  className="login-btn"
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="login-btn-loading"
                      >
                        <span className="login-spinner" />
                        Signing in...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="login-btn-idle"
                      >
                        Sign In
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>

              {/* Footer links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="login-footer"
              >
                <p className="login-footer-text">
                  Don&apos;t have an account?{" "}
                  <Link to="/register" className="login-footer-link">
                    Create one
                  </Link>
                </p>
                <div className="login-divider">
                  <span className="login-divider-text">Admin?</span>
                </div>
                <p className="login-admin-hint">
                  Default credentials:{" "}
                  <code className="login-code">admin@moviereserve.com</code>
                  {" / "}
                  <code className="login-code">Admin@1234</code>
                </p>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
