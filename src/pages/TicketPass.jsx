import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authFetch } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { Download, Share2, ChevronLeft, Calendar, Clock, MapPin, Ticket } from "lucide-react";
import { format } from "date-fns";
import LoadingSpinner from "../Components/ui/LoadingSpinner";
import Button from "../Components/ui/Button";

const TicketPass = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [booking, setBooking] = useState(null);
    const [showtime, setShowtime] = useState(null);
    const [movie, setMovie] = useState(null);
    const [theater, setTheater] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicketDetails = async () => {
             try {
                 const bookingData = await authFetch(`/api/bookings/${bookingId}`, token);
                 
                 // If the booking somehow got cancelled or pending, redirect out of ticket pass
                 if (bookingData.status !== 'CONFIRMED' && bookingData.paymentStatus !== 'PAID') {
                      toast.error("Ticket is not confirmed yet.");
                      navigate("/my-bookings");
                      return;
                 }
                 
                 const [showtimeData, movieData, theaterData] = await Promise.all([
                      authFetch(`/api/showtimes/${bookingData.showtimeId}`, token),
                      authFetch(`/api/movies/${bookingData.movieId}`, token),
                      authFetch(`/api/theaters/${bookingData.theaterId}`, token)
                 ]);
                 
                 setBooking(bookingData);
                 setShowtime(showtimeData);
                 setMovie(movieData);
                 setTheater(theaterData);
             } catch (err) {
                 toast.error("Failed to load digital ticket");
                 navigate("/my-bookings");
             } finally {
                 setLoading(false);
             }
        };
        fetchTicketDetails();
    }, [bookingId, token, navigate]);

    if (loading || !booking || !movie) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" message="Generating your digital pass..." />
            </div>
        );
    }

    const showDate = new Date(showtime.showDateTime);

    return (
        <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4 flex flex-col items-center relative overflow-hidden">
             {/* Dynamic Blur Background from poster */}
             <div 
                className="absolute inset-0 opacity-20 blur-[100px] transform scale-110 pointer-events-none" 
                style={{ 
                    backgroundImage: `url(${movie.posterUrl})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                }} 
             />

             <div className="w-full max-w-sm mb-6 flex justify-between z-10">
                 <button onClick={() => navigate("/my-bookings")} className="cinema-back-btn text-white/70 hover:text-white">
                    <ChevronLeft className="w-5 h-5" /> Home
                 </button>
                 <div className="flex gap-2">
                     <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white">
                         <Share2 size={18} />
                     </button>
                     <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white">
                         <Download size={18} />
                     </button>
                 </div>
             </div>

             <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-sm z-10"
             >
                 {/* Top Pass Half */}
                 <div className="bg-white rounded-t-3xl overflow-hidden shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
                     <div className="h-48 relative">
                         <img src={movie.posterUrl} className="w-full h-full object-cover" alt="Movie Poster" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                         <div className="absolute bottom-4 left-6 right-6">
                             <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-xs font-medium text-white mb-2 inline-block">
                                 Screen {showtime.screenNumber}
                             </span>
                             <h1 className="text-2xl font-bold text-white leading-tight shadow-sm">{movie.title}</h1>
                         </div>
                     </div>
                     
                     <div className="p-6 bg-white">
                         <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                             <div className="flex gap-3">
                                 <Calendar className="text-gray-400 mt-0.5" size={18} />
                                 <div>
                                     <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Date</p>
                                     <p className="text-sm font-bold text-black">{format(showDate, "dd MMM yyyy")}</p>
                                 </div>
                             </div>
                             <div className="flex gap-3">
                                 <Clock className="text-gray-400 mt-0.5" size={18} />
                                 <div>
                                     <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Time</p>
                                     <p className="text-sm font-bold text-black">{format(showDate, "hh:mm a")}</p>
                                 </div>
                             </div>
                             <div className="flex gap-3 col-span-2 mt-2">
                                 <MapPin className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                                 <div>
                                     <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Cinema</p>
                                     <p className="text-sm font-bold text-black">{theater.name}</p>
                                     <p className="text-xs text-gray-600 truncate max-w-[200px]">{theater.location}</p>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Divider */}
                 <div className="relative h-8 bg-white flex items-center justify-between px-[-10px] overflow-hidden">
                     <div className="absolute w-8 h-8 rounded-full bg-[#050505] -left-4 shadow-inner" />
                     <div className="absolute w-8 h-8 rounded-full bg-[#050505] -right-4 shadow-inner" />
                     
                     <div className="w-full h-[2px] mx-6 border-b-2 border-dashed border-gray-300 rounded" />
                 </div>

                 {/* Bottom Pass Half */}
                 <div className="bg-white rounded-b-3xl p-6 shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
                     <div className="flex justify-between items-center mb-6">
                         <div>
                             <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Seats ({booking.numberOfSeats})</p>
                             <p className="text-xl font-bold text-black tracking-tight">{booking.seatNumbers}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order</p>
                             <p className="text-sm font-bold text-black uppercase">{booking.bookingReference}</p>
                         </div>
                     </div>

                     <div className="flex justify-center my-6">
                         {/* Fake QR code generation using a nice gradient block for UI */}
                         <div className="p-3 bg-white border-2 border-gray-100 rounded-xl shadow-sm">
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.bookingReference}&bgcolor=ffffff&color=000000`} 
                                alt="QR Code"
                                className="w-32 h-32"
                              />
                         </div>
                     </div>

                     <div className="text-center text-xs text-gray-500 font-medium">
                         Please present this QR code at the cinema entrance.
                     </div>
                 </div>
             </motion.div>
        </div>
    );
};

export default TicketPass;
