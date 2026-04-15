import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, User, Mail, Lock, Phone, CheckCircle, ArrowRight, Building2, Users,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../config/constants";

const ROLES = [
  {
    id: "THEATER_OWNER",
    label: "Theater Owner",
    desc: "Can manage their theaters, showtimes, and view revenue analytics",
    icon: Building2,
    color: "from-amber-500 to-orange-600",
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
  },
  {
    id: "THEATER_MANAGER",
    label: "Theater Manager",
    desc: "Manages a specific assigned theater — showtimes and bookings",
    icon: Users,
    color: "from-blue-500 to-indigo-600",
    border: "border-blue-500/40",
    bg: "bg-blue-500/10",
  },
  {
    id: "ADMIN",
    label: "System Admin",
    desc: "Full system access — movies, theaters, users, analytics",
    icon: Shield,
    color: "from-red-500 to-red-700",
    border: "border-red-500/40",
    bg: "bg-red-500/10",
  },
];

const AdminSetup = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [step, setStep] = useState(0); // 0=pick role, 1=fill form, 2=success
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.password) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to create user");
        return;
      }
      setCreatedUser(data);
      setStep(2);
    } catch {
      toast.error("Server error — try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-setup-page">
      <div className="admin-setup-bg" />

      <div className="admin-setup-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-setup-header"
        >
          <div className="admin-setup-badge">
            <Shield className="w-5 h-5 text-red-400" />
            Admin Panel
          </div>
          <h1 className="admin-setup-title">Create Privileged User</h1>
          <p className="admin-setup-subtitle">
            Create Theater Owners, Managers, or additional Admins for your platform
          </p>
        </motion.div>

        {/* Step progress */}
        <div className="admin-setup-progress">
          {["Pick Role", "Fill Details", "Done"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`admin-step-dot ${i < step ? "done" : i === step ? "active" : ""}`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : <span>{i + 1}</span>}
              </div>
              <span className={`admin-step-label ${i === step ? "text-white" : "text-gray-500"}`}>{label}</span>
              {i < 2 && <div className={`admin-step-connector ${i < step ? "done" : ""}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0 — Role selection */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="admin-role-grid"
            >
              {ROLES.map((role) => {
                const Icon = role.icon;
                const selected = selectedRole === role.id;
                return (
                  <motion.button
                    key={role.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole(role.id)}
                    className={`admin-role-card ${selected ? `selected ${role.border}` : ""} ${role.bg}`}
                  >
                    <div className={`admin-role-icon bg-gradient-to-br ${role.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="admin-role-info">
                      <h3 className="admin-role-name">{role.label}</h3>
                      <p className="admin-role-desc">{role.desc}</p>
                    </div>
                    {selected && (
                      <motion.div
                        layoutId="selected-indicator"
                        className="admin-role-check"
                      >
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}

              <button
                disabled={!selectedRole}
                onClick={() => setStep(1)}
                className="admin-next-btn"
              >
                Continue with {selectedRole ? ROLES.find((r) => r.id === selectedRole)?.label : "selected role"}{" "}
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Step 1 — Form */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="admin-form-wrap"
            >
              <div className="admin-form-card">
                <div className="admin-form-role-badge">
                  Creating:{" "}
                  <span className="text-red-400 font-bold">
                    {ROLES.find((r) => r.id === selectedRole)?.label}
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                  <div className="register-row">
                    <div className="login-field">
                      <label className="login-label">First Name *</label>
                      <div className={`login-input-wrap ${focusedField === "fn" ? "focused" : ""}`}>
                        <User className="login-input-icon" />
                        <input name="firstName" value={form.firstName} onChange={handleChange}
                          onFocus={() => setFocusedField("fn")} onBlur={() => setFocusedField(null)}
                          placeholder="John" className="login-input" required />
                      </div>
                    </div>
                    <div className="login-field">
                      <label className="login-label">Last Name</label>
                      <div className={`login-input-wrap ${focusedField === "ln" ? "focused" : ""}`}>
                        <User className="login-input-icon" />
                        <input name="lastName" value={form.lastName} onChange={handleChange}
                          onFocus={() => setFocusedField("ln")} onBlur={() => setFocusedField(null)}
                          placeholder="Doe" className="login-input" />
                      </div>
                    </div>
                  </div>

                  <div className="login-field">
                    <label className="login-label">Email *</label>
                    <div className={`login-input-wrap ${focusedField === "em" ? "focused" : ""}`}>
                      <Mail className="login-input-icon" />
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        onFocus={() => setFocusedField("em")} onBlur={() => setFocusedField(null)}
                        placeholder="owner@theater.com" className="login-input" required />
                    </div>
                  </div>

                  <div className="login-field">
                    <label className="login-label">Phone Number</label>
                    <div className={`login-input-wrap ${focusedField === "ph" ? "focused" : ""}`}>
                      <Phone className="login-input-icon" />
                      <input name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handleChange}
                        onFocus={() => setFocusedField("ph")} onBlur={() => setFocusedField(null)}
                        placeholder="9876543210" className="login-input" />
                    </div>
                  </div>

                  <div className="login-field">
                    <label className="login-label">Temporary Password *</label>
                    <div className={`login-input-wrap ${focusedField === "pw" ? "focused" : ""}`}>
                      <Lock className="login-input-icon" />
                      <input name="password" type="password" value={form.password} onChange={handleChange}
                        onFocus={() => setFocusedField("pw")} onBlur={() => setFocusedField(null)}
                        placeholder="Min. 6 characters" className="login-input" required />
                    </div>
                  </div>

                  <div className="register-btn-row">
                    <button type="button" onClick={() => setStep(0)} className="register-back-btn">
                      Back
                    </button>
                    <button type="submit" disabled={loading} className="login-btn register-submit-btn">
                      <AnimatePresence mode="wait">
                        {loading ? (
                          <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="login-btn-loading">
                            <span className="login-spinner" /> Creating...
                          </motion.span>
                        ) : (
                          <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="login-btn-idle">
                            Create User <ArrowRight className="w-5 h-5" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Success */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="admin-success"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="admin-success-icon"
              >
                <CheckCircle className="w-16 h-16 text-green-400" />
              </motion.div>
              <h2 className="admin-success-title">User Created!</h2>
              <p className="admin-success-info">
                <span className="text-white font-semibold">{createdUser?.email}</span> has been created as{" "}
                <span className="text-red-400 font-bold">
                  {ROLES.find((r) => r.id === selectedRole)?.label}
                </span>
              </p>
              <p className="admin-success-note">
                They can now log in with the credentials you set. Ask them to change their password on first login.
              </p>
              <div className="admin-success-actions">
                <button
                  onClick={() => { setStep(0); setSelectedRole(null); setForm({ firstName: "", lastName: "", email: "", phoneNumber: "", password: "" }); setCreatedUser(null); }}
                  className="register-back-btn"
                >
                  Create Another
                </button>
                <button onClick={() => navigate("/admin/dashboard")} className="login-btn" style={{ flex: 1 }}>
                  <span className="login-btn-idle">Back to Dashboard <ArrowRight className="w-5 h-5" /></span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminSetup;
