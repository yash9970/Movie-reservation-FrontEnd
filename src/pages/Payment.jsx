import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { authFetch } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { CreditCard, CheckCircle, AlertTriangle, Shield, ShoppingCart, Coffee, Clock as ClockIcon } from "lucide-react";
import LoadingSpinner from "../Components/ui/LoadingSpinner";
import Button from "../Components/ui/Button";

const Payment = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { token, user } = useAuth();
    
    // Concessions state dragged from previous UI if it exists
    const concessionsTotal = location.state?.concessionsTotal || 0;
    const isFoodOnly = location.state?.isFoodOnly || false;
    const returnTo = location.state?.returnTo || null;
    const isPOS = returnTo === '/admin/box-office';
    
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    
    // 5 Minute Timer (300 seconds)
    const [timeLeft, setTimeLeft] = useState(300);

    useEffect(() => {
        const fetchBooking = async () => {
             try {
                 const data = await authFetch(`/api/bookings/${bookingId}`, token);
                 if (data.paymentStatus === 'PAID' && !isFoodOnly) {
                     navigate(`/ticket/${bookingId}`);
                     return;
                 }
                 if (data.status === 'CANCELLED') {
                     toast.error("This booking has expired or was cancelled.");
                     navigate("/movies");
                     return;
                 }
                 setBooking(data);
             } catch (err) {
                 toast.error("Failed to fetch payment details");
                 navigate("/movies");
             } finally {
                 setLoading(false);
             }
        };
        fetchBooking();
    }, [bookingId, token, navigate]);

    // Timer countdown logic
    useEffect(() => {
        if (!booking || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleExpiration();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [booking, !!timeLeft]);

    const handleExpiration = async () => {
         toast.error("Payment session expired. Seats have been released.");
         // Note: Backend cron job will also catch this, but forcing it here is good UX
         navigate("/movies");
    };

    const handlePayment = async () => {
         setProcessing(true);
         // Process payment
         await new Promise(resolve => setTimeout(resolve, 2000));
         
         try {
             if (!isFoodOnly) {
                 await authFetch(`/api/bookings/${bookingId}/payment?paymentStatus=PAID`, token, {
                     method: 'PATCH'
                 });
             }
             
             toast.success(isFoodOnly ? "Food & Beverage Order Placed!" : "Payment Successful! 🎟️");
             if (returnTo) {
                 navigate(returnTo);
             } else {
                 navigate(`/ticket/${bookingId}`);
             }
         } catch (err) {
             toast.error("Payment failed. Please try again.");
             setProcessing(false);
         }
    };

    const handleCancel = async () => {
         try {
             await authFetch(`/api/bookings/${bookingId}/cancel`, token, { method: 'PATCH' });
             toast.success("Booking cancelled.");
             navigate("/movies");
         } catch (err) {
             navigate("/movies");
         }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" message="Loading secure payment gateway..." />
            </div>
        );
    }

    if (!booking) return null;

    const totalPayable = isFoodOnly ? concessionsTotal : booking.totalAmount + concessionsTotal;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
            {/* The Glowing Background for Payment */}
            <div className="absolute inset-0 bg-gradient-to-tr from-red-900/10 via-transparent to-blue-900/10" />

            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 relative z-10">
                
                {/* Left side: Order Details */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-8 rounded-2xl border border-white/10 relative overflow-hidden"
                >
                    {/* Security Badge */}
                    <div className="absolute top-0 right-0 bg-green-500/10 text-green-400 px-4 py-2 rounded-bl-2xl font-medium flex items-center gap-2 text-sm border-b border-l border-green-500/20">
                        <Shield size={16} /> 256-bit Encrypted
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-8 mt-4">Order Summary</h2>

                    <div className="space-y-6">
                        <div className="flex justify-between items-start border-b border-white/5 pb-4">
                            <div>
                                <p className="text-gray-400 text-sm">Booking Reference</p>
                                <p className="text-white font-mono">{booking.bookingReference}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-sm">Seats</p>
                                <p className="text-white font-semibold">{booking.seatNumbers}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {!isFoodOnly && (
                                <div className="flex justify-between text-gray-300">
                                    <span>Ticket Price ({booking.numberOfSeats} x)</span>
                                    <span>₹{booking.totalAmount}</span>
                                </div>
                            )}
                            {concessionsTotal > 0 && (
                                <div className="flex justify-between text-gray-300">
                                    <span>Food & Beverages</span>
                                    <span>₹{concessionsTotal}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-400 text-sm pt-2">
                                <span>Convenience Fee (Waived)</span>
                                <span className="line-through text-gray-500">₹60</span>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-6 mt-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Total Amount Payable</p>
                                    <p className="text-4xl font-bold text-white">₹{totalPayable}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right side: Payment Gateway OR POS Cash Terminal */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-8 rounded-2xl border ${isPOS ? 'bg-[#0f1016] border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]' : 'glass-card border-white/10'}`}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isPOS ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-gray-400'}`}>
                                {isPOS ? <ShoppingCart className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                {isPOS ? 'Box Office Terminal' : 'Payment Gateway'}
                            </h2>
                        </div>
                        
                        {/* Timer Element — shown in both for reservation logic */}
                        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 font-mono text-sm ${timeLeft < 60 ? 'border-red-500/30 text-red-400 bg-red-500/10 animate-pulse' : 'border-white/10 text-gray-400 bg-white/5'}`}>
                            <ClockIcon />
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </div>
                    </div>

                    {isPOS ? (
                        <div className="space-y-6">
                            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-8 text-center flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <Coffee className="w-8 h-8 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg mb-1">Cash Collection</h3>
                                    <p className="text-gray-400 text-sm">Collect the physical amount from the customer</p>
                                </div>
                                <div className="text-3xl font-black text-white mt-2">
                                    ₹{totalPayable}
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex gap-3 text-xs text-gray-400">
                                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                <p>By clicking confirm, you acknowledge that you have received the above amount in cash. This will finalize the booking and generate the manifest entry.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Payment method tabs */}
                            <div className="flex gap-2 mb-6">
                                {['UPI', 'Card', 'Net Banking'].map((method, i) => (
                                    <button key={method} className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                                        i === 0 ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-gray-500 hover:border-white/10'
                                    }`}>{method}</button>
                                ))}
                            </div>

                            {/* UPI input */}
                            <div className="bg-black/30 border border-white/5 rounded-xl p-6 mb-6">
                                <label className="text-xs text-gray-400 uppercase tracking-wider mb-3 block">UPI ID</label>
                                <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                                    <input
                                        type="text"
                                        placeholder="yourname@upi"
                                        className="bg-transparent flex-1 text-white outline-none text-sm"
                                        defaultValue=""
                                    />
                                    <span className="text-xs text-gray-500 font-mono">VERIFY</span>
                                </div>
                            </div>

                            {/* Security note */}
                            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 mb-6 flex gap-3 text-sm text-green-300">
                                <Shield className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                <p>Your payment is secured with 256-bit SSL encryption. Seats are held for the duration of your session.</p>
                            </div>
                        </>
                    )}

                    <div className="space-y-4 mt-8">
                        <Button 
                            onClick={handlePayment} 
                            disabled={processing} 
                            className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-shadow"
                        >
                            {processing ? (
                                <>
                                    <LoadingSpinner size="sm" /> {isPOS ? 'Finalizing Entry...' : 'Processing Payment...'}
                                </>
                            ) : (
                                <>
                                    {isPOS ? 'Confirm Cash Payment' : `Pay ₹${totalPayable} Securely`}
                                </>
                            )}
                        </Button>
                        <button 
                            onClick={returnTo ? () => navigate(returnTo) : isFoodOnly ? () => navigate(`/ticket/${bookingId}`) : handleCancel}
                            disabled={processing}
                            className="w-full py-3 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {returnTo ? 'Cancel & Return to POS' : 'Cancel Transaction'}
                        </button>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};



export default Payment;
