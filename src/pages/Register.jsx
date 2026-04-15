import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, CheckCircle,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/constants";

const STEPS = ["Personal Info", "Account Details"];

const Register = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateStep0 = () => {
    if (!formData.firstName.trim()) { toast.error("First name is required"); return false; }
    if (!formData.lastName.trim()) { toast.error("Last name is required"); return false; }
    if (!formData.phoneNumber.match(/^\d{10}$/)) { toast.error("Enter a valid 10-digit phone number"); return false; }
    return true;
  };

  const validateStep1 = () => {
    if (!formData.email.includes("@")) { toast.error("Enter a valid email"); return false; }
    if (formData.password.length < 6) { toast.error("Password must be at least 6 characters"); return false; }
    if (formData.password !== formData.confirmPassword) { toast.error("Passwords do not match"); return false; }
    return true;
  };

  const nextStep = () => {
    if (step === 0 && validateStep0()) setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Registration failed");
        return;
      }
      login(data);
      toast.success("Account created successfully! 🎬");
      navigate("/movies");
    } catch {
      toast.error("Cannot reach server — is Docker running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Reuse login bg */}
      <div className="login-bg">
        <div className="login-bg-gradient" />
        <div className="login-bg-grid" />
      </div>

      <div className="register-container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="register-card"
        >
          {/* Header */}
          <div className="register-header">
            <div className="register-logo-wrap">
              <Film className="w-7 h-7 text-white" />
            </div>
            <h2 className="register-title">Join CineMax</h2>
            <p className="register-subtitle">Create your account in seconds</p>
          </div>

          {/* Step indicator */}
          <div className="register-steps">
            {STEPS.map((label, i) => (
              <div key={label} className="register-step-item">
                <div className={`register-step-dot ${i < step ? "done" : i === step ? "active" : ""}`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : <span>{i + 1}</span>}
                </div>
                <span className={`register-step-label ${i === step ? "active" : ""}`}>{label}</span>
                {i < STEPS.length - 1 && <div className={`register-step-line ${i < step ? "done" : ""}`} />}
              </div>
            ))}
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.form
                key="step0"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                onSubmit={(e) => { e.preventDefault(); nextStep(); }}
                className="register-form"
              >
                <div className="register-row">
                  <div className="login-field">
                    <label className="login-label">First Name</label>
                    <div className={`login-input-wrap ${focusedField === "firstName" ? "focused" : ""}`}>
                      <User className="login-input-icon" />
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("firstName")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="John"
                        className="login-input"
                      />
                    </div>
                  </div>
                  <div className="login-field">
                    <label className="login-label">Last Name</label>
                    <div className={`login-input-wrap ${focusedField === "lastName" ? "focused" : ""}`}>
                      <User className="login-input-icon" />
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("lastName")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Doe"
                        className="login-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-label">Phone Number</label>
                  <div className={`login-input-wrap ${focusedField === "phone" ? "focused" : ""}`}>
                    <Phone className="login-input-icon" />
                    <input
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="9876543210"
                      className="login-input"
                    />
                  </div>
                </div>

                <button type="submit" className="login-btn">
                  <span className="login-btn-idle">
                    Continue <ArrowRight className="w-5 h-5" />
                  </span>
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="register-form"
              >
                <div className="login-field">
                  <label className="login-label">Email Address</label>
                  <div className={`login-input-wrap ${focusedField === "email" ? "focused" : ""}`}>
                    <Mail className="login-input-icon" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="you@example.com"
                      className="login-input"
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-label">Password</label>
                  <div className={`login-input-wrap ${focusedField === "password" ? "focused" : ""}`}>
                    <Lock className="login-input-icon" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Min. 6 characters"
                      className="login-input"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="login-eye-btn" tabIndex={-1}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-label">Confirm Password</label>
                  <div className={`login-input-wrap ${focusedField === "confirm" ? "focused" : ""}`}>
                    <Lock className="login-input-icon" />
                    <input
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("confirm")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className="login-input"
                    />
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
                          <span className="login-spinner" /> Creating account...
                        </motion.span>
                      ) : (
                        <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="login-btn-idle">
                          Create Account <ArrowRight className="w-5 h-5" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="register-footer"
          >
            Already have an account?{" "}
            <Link to="/login" className="login-footer-link">Sign in</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;