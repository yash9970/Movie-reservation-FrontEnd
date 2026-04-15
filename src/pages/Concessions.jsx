import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { authFetch } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { Coffee, Plus, Minus, ArrowRight, ChevronLeft } from "lucide-react";
import LoadingSpinner from "../Components/ui/LoadingSpinner";
import Button from "../Components/ui/Button";

const FALLBACK_MENU = [
  { id: 1, name: "Large Popcorn", description: "Freshly popped, extra butter", price: 250, icon: "🍿" },
  { id: 2, name: "Medium Popcorn", description: "Classic salted popcorn", price: 200, icon: "🍿" },
  { id: 3, name: "Coca-Cola (Large)", description: "Ice cold refreshing cola", price: 150, icon: "🥤" },
  { id: 4, name: "Nachos with Salsa", description: "Crispy tortillas, cheesy dip", price: 180, icon: "🌮" }
];

const Concessions = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useAuth();
    
    const isBoxOfficeMode = new URLSearchParams(location.search).get("boxoffice") === "true";
    
    const [booking, setBooking] = useState(null);
    const [menuItems, setMenuItems] = useState(FALLBACK_MENU); // Fallback if no theater config
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState({});

    useEffect(() => {
        const fetchData = async () => {
             try {
                 const data = await authFetch(`/api/bookings/${bookingId}`, token);
                 setBooking(data);
                 
                 // Fetch Theater to get dynamic F&B Config
                 const theaterData = await authFetch(`/api/theaters/${data.theaterId}`, token);
                 if (theaterData.concessionsConfig) {
                      try {
                          const cConfig = JSON.parse(theaterData.concessionsConfig);
                          if (Array.isArray(cConfig) && cConfig.length > 0) {
                              setMenuItems(cConfig);
                          }
                      } catch (e) {
                          console.error("Failed parsing theater concessions config");
                      }
                 }
                 
             } catch (err) {
                 toast.error("Failed to fetch booking details");
                 navigate("/movies");
             } finally {
                 setLoading(false);
             }
        };
        fetchData();
    }, [bookingId, token]);

    const handleQuantity = (id, delta) => {
        setCart(prev => {
            const current = prev[id] || 0;
            const next = current + delta;
            if (next <= 0) {
                const newCart = { ...prev };
                delete newCart[id];
                return newCart;
            }
            return { ...prev, [id]: next };
        });
    };

    const getConcessionsTotal = () => {
        return Object.entries(cart).reduce((total, [id, qty]) => {
            const item = menuItems.find(m => String(m.id) === String(id));
            if (!item) return total;
            return total + (item.price * qty);
        }, 0);
    };

    const handleProceed = () => {
         const concessionsTotal = getConcessionsTotal();

         if (concessionsTotal === 0 && booking.status === "CONFIRMED" && !isBoxOfficeMode) {
             toast.error("Please add items to your cart first.");
             return;
         }

         const isTicketAlreadyPaid = booking.status === "CONFIRMED";
         
         // Box office: CONFIRMED ticket but food is optional. Route back to /admin/boxoffice after payment.
         navigate(`/payment/${bookingId}`, { 
             state: { 
                 concessionsTotal, 
                 cart,
                 isFoodOnly: isTicketAlreadyPaid,
                 returnTo: isBoxOfficeMode ? '/admin/box-office' : null
             } 
         });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" message="Loading concessions..." />
            </div>
        );
    }

    if (!booking) return null;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 max-w-5xl mx-auto">
             <button onClick={() => navigate(`/booking/${booking.showtimeId}`)} className="cinema-back-btn mb-6">
                <ChevronLeft className="w-5 h-5" /> Back to Seats
             </button>

             <div className="text-center mb-12">
                 <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-white mb-4"
                 >
                    Grab Some Snacks
                 </motion.h1>
                 <p className="text-gray-400">Pre-book your F&B to skip the queue!</p>
             </div>

             <div className="grid md:grid-cols-3 gap-8">
                  {/* Menu */}
                  <div className="md:col-span-2 space-y-4">
                      {menuItems.map((item, idx) => (
                          <motion.div 
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="glass-card p-4 flex items-center justify-between"
                          >
                              <div className="flex items-center gap-4">
                                  <div className="text-4xl bg-white/5 p-3 rounded-xl">{item.icon}</div>
                                  <div>
                                      <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                                      <p className="text-gray-400 text-sm">{item.description}</p>
                                      <p className="text-red-400 font-medium mt-1">₹{item.price}</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-4">
                                  {cart[item.id] > 0 ? (
                                      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-1">
                                          <button onClick={() => handleQuantity(item.id, -1)} className="p-1 hover:bg-red-500/20 rounded text-red-400">
                                              <Minus size={16} />
                                          </button>
                                          <span className="text-white font-medium w-4 text-center">{cart[item.id]}</span>
                                          <button onClick={() => handleQuantity(item.id, 1)} className="p-1 hover:bg-red-500/20 rounded text-red-400">
                                              <Plus size={16} />
                                          </button>
                                      </div>
                                  ) : (
                                      <button 
                                        onClick={() => handleQuantity(item.id, 1)}
                                        className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                      >
                                        Add
                                      </button>
                                  )}
                              </div>
                          </motion.div>
                      ))}
                  </div>

                  {/* Order Summary */}
                  <div>
                      <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass-card p-6 sticky top-24"
                      >
                          <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Order Summary</h2>
                          
                          <div className="space-y-4 mb-6 text-sm">
                              <div className="flex justify-between text-gray-300">
                                  <span>Tickets ({booking.numberOfSeats} seats)</span>
                                  <span>{booking.status === 'CONFIRMED' ? <span className="text-green-500 font-semibold text-sm mr-1">PAID</span> : ''} ₹{booking.totalAmount}</span>
                              </div>
                              
                              {Object.entries(cart).length > 0 && (
                                  <div className="pt-4 border-t border-white/10 space-y-2">
                                      <p className="text-white font-medium mb-2">Food & Beverage</p>
                                      {Object.entries(cart).map(([id, qty]) => {
                                          const rowItem = menuItems.find(m => String(m.id) === String(id));
                                          if (!rowItem) return null;
                                          return (
                                              <div key={id} className="flex justify-between text-gray-400">
                                                  <span>{qty}x {rowItem.name}</span>
                                                  <span>₹{rowItem.price * qty}</span>
                                              </div>
                                          );
                                      })}
                                  </div>
                              )}
                          </div>

                          <div className="border-t border-white/10 pt-4 mb-6">
                              <div className="flex justify-between items-center">
                                  <span className="text-white font-semibold flex flex-col">
                                      Total Due Now
                                      {booking.status === 'CONFIRMED' && <span className="text-[10px] text-gray-400">Seat delivery fee included</span>}
                                  </span>
                                  <span className="text-2xl font-bold text-red-500">
                                      ₹{booking.status === 'CONFIRMED' ? getConcessionsTotal() : booking.totalAmount + getConcessionsTotal()}
                                  </span>
                              </div>
                          </div>

                          <Button onClick={handleProceed} className="w-full flex items-center justify-center gap-2 py-3 text-lg">
                              Proceed to Pay <ArrowRight size={20} />
                          </Button>
                          {/* Skip button - for boxoffice mode goes straight back to POS dashboard */}
                          {isBoxOfficeMode ? (
                              <div className="mt-4 flex gap-3">
                                  <button onClick={handleProceed} className="flex-1 mt-0 text-sm py-2 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/10 transition-colors font-semibold">
                                      💳 Checkout with Food
                                  </button>
                                  <button
                                      onClick={() => navigate(`/payment/${bookingId}`, { state: { concessionsTotal: 0, cart: {}, isFoodOnly: true, returnTo: '/admin/boxoffice' } })}
                                      className="flex-1 mt-0 text-sm py-2 border border-white/10 text-gray-400 rounded-lg hover:bg-white/5 transition-colors"
                                  >
                                      Skip Food → Finalize
                                  </button>
                              </div>
                          ) : booking.status !== 'CONFIRMED' ? (
                              <button onClick={handleProceed} className="w-full mt-3 text-sm text-gray-400 hover:text-white transition-colors">
                                  Skip snacks
                              </button>
                          ) : null}
                      </motion.div>
                  </div>
             </div>
        </div>
    );
};

export default Concessions;
