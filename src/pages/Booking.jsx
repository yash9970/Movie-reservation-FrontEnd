import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { authFetch } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Armchair, Film, Clock, CreditCard, ChevronLeft, Info, CalendarDays, Ticket, Banknote } from "lucide-react";

const FALLBACK_CATEGORY = { id: 'fallback', label: "Standard", color: "#9ca3af", price: 150 };

const getSeatCategory = (rowLetter, parsedConfig) => {
  if (parsedConfig && parsedConfig.layout && parsedConfig.categories) {
    const rowConfig = parsedConfig.layout.find(r => r.row === rowLetter);
    if (rowConfig && rowConfig.categoryId) {
        const cat = parsedConfig.categories.find(c => c.id === rowConfig.categoryId);
        if (cat) return { id: cat.id, label: cat.name, color: cat.color, price: Number(cat.price) };
    }
  }
  return FALLBACK_CATEGORY;
};

const getSeatPrice = (rowLetter, basePrice, parsedConfig) => {
  const cat = getSeatCategory(rowLetter, parsedConfig);
  return cat && cat.id !== 'fallback' ? cat.price : basePrice;
};

const Seat = ({ seatNumber, category, isBooked, isSelected, onToggle }) => {
  const color = category.color || "#9ca3af";
  
  if (isBooked) {
    return (
      <div className="w-8 h-8 rounded-t-xl rounded-b-md bg-[#1f2937] border border-[#374151] flex items-center justify-center cursor-not-allowed opacity-50 shadow-inner">
        <span className="text-[10px] text-gray-500 font-bold">X</span>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.15, y: -2 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onToggle(seatNumber)}
      className="relative w-8 h-8 rounded-t-xl rounded-b-md transition-all duration-200 group flex items-center justify-center overflow-hidden"
      style={{
        background: isSelected ? `${color}40` : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${isSelected ? color : 'rgba(255,255,255,0.1)'}`,
        boxShadow: isSelected ? `0 0 15px ${color}40, inset 0 0 8px ${color}30` : 'none',
      }}
    >
      <Armchair 
        className={`w-4 h-4 transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'}`} 
        style={{ color: isSelected ? color : '#fff' }} 
      />
      
      {/* Tooltip on hover */}
      <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-opacity border border-white/10 z-50">
        {seatNumber} • {category.label}
      </div>
    </motion.button>
  );
};

const Booking = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuth();
  
  const isBoxOfficeMode = new URLSearchParams(location.search).get("boxoffice") === "true" && 
                          (user?.role === "ADMIN" || user?.role === "THEATER_MANAGER" || user?.role === "THEATER_OWNER");
  
  const [showtime, setShowtime] = useState(null);
  const [movie, setMovie] = useState(null);
  const [seatMap, setSeatMap] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const loadBookingData = useCallback(async () => {
    try {
      const [showtimeData, seatMapData] = await Promise.all([
        authFetch(`/api/showtimes/${showtimeId}`, token),
        authFetch(`/api/bookings/showtimes/${showtimeId}/seats`, token),
      ]);
      const movieData = await authFetch(`/api/movies/${showtimeData.movieId}`, token);
      setShowtime(showtimeData);
      setSeatMap(seatMapData);
      setMovie(movieData);
    } catch {
      toast.error("Failed to load showtime details");
    } finally {
      setLoading(false);
    }
  }, [showtimeId, token]);

  useEffect(() => { loadBookingData(); }, [loadBookingData]);

  const toggleSeat = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      if (selectedSeats.length >= 10) {
        toast.error("Maximum 10 seats per booking");
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return;
    setBooking(true);
    try {
      const data = await authFetch(`/api/bookings`, token, {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          showtimeId: Number(showtimeId),
          numberOfSeats: selectedSeats.length,
          seatNumbers: selectedSeats.join(", "),
          totalAmount: totalPrice,
          specialRequests: isBoxOfficeMode ? "OFFLINE_BOXOFFICE" : "",
        }),
      });
      
      if (isBoxOfficeMode) {
          toast.success(`Walk-in Seats Reserved. Proceed to Food Add-ons.`);
          navigate(`/concessions/${data.id}?boxoffice=true`);
      } else {
          toast.success(`Seats locked! Let's get some snacks.`);
          navigate(`/concessions/${data.id}`);
      }
    } catch (err) {
      toast.error(err.message || "Booking failed — seats may have been taken");
      const newSeatMap = await authFetch(`/api/bookings/showtimes/${showtimeId}/seats`, token);
      setSeatMap(newSeatMap);
      setSelectedSeats([]);
    } finally {
      setBooking(false);
    }
  };

  if (loading || !showtime || !movie || !seatMap) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-400 font-medium tracking-wide">Loading Auditorium...</p>
        </div>
      </div>
    );
  }

  const parsedConfig = showtime.seatLayoutConfig ? JSON.parse(showtime.seatLayoutConfig) : null;
  const basePrice = parseFloat(showtime.pricePerSeat || 0);
  
  const allSeatLabels = [...(seatMap.availableSeatLabels || []), ...(seatMap.reservedSeatLabels || [])];
  
  let uniqueRows = [];
  let rowSeatCounts = {};

  if (parsedConfig && parsedConfig.layout) {
    uniqueRows = parsedConfig.layout.map(r => r.row);
    parsedConfig.layout.forEach(r => { rowSeatCounts[r.row] = r.seats; });
  } else {
    uniqueRows = [...new Set(allSeatLabels.map((l) => l.charAt(0)))].sort();
    const maxSeats = Math.max(...allSeatLabels.map((l) => parseInt(l.slice(1), 10)), 10);
    uniqueRows.forEach(r => { rowSeatCounts[r] = maxSeats; });
  }

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat.charAt(0), basePrice, parsedConfig), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-red-500/30 relative">
      
      {/* Background Poster Blur Bleed */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div 
            className="absolute inset-0 bg-cover bg-center blur-[120px] scale-125 saturate-150" 
            style={{ backgroundImage: `url(${movie.posterUrl})` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/40 via-[#0a0a0f]/80 to-[#0a0a0f]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col lg:flex-row gap-8 min-h-screen">
        
        {/* LEFT COLUMN: Seat Layout Area */}
        <div className="flex-1 flex flex-col">
            
            {/* Header: Movie & Back */}
            <div className="flex items-center gap-6 mb-10 pb-6 border-b border-white/5">
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
                <img src={movie.posterUrl} alt={movie.title} className="h-16 w-11 rounded-md object-cover shadow-lg" />
                <div>
                    <h1 className="text-2xl font-black tracking-tight">
                        {movie.title}
                        {isBoxOfficeMode && <span className="ml-3 text-xs bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">POS Mode</span>}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1 font-medium">
                        <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {format(new Date(showtime.showDateTime), "MMM dd")}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {format(new Date(showtime.showDateTime), "h:mm a")}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span className="text-white bg-white/10 px-2 py-0.5 rounded font-bold">Screen {showtime.screenNumber}</span>
                    </div>
                </div>
            </div>

            {/* Theatre Area Container */}
            <div className="bg-[#12121a]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 flex-1 flex flex-col items-center justify-center relative shadow-2xl">
                
                {/* The Cinematic Screen */}
                <div className="cinema-screen-wrap">
                    <div className="cinema-screen" />
                    <div className="screen-label">Screen</div>
                </div>

                {/* Seat Map Matrix */}
                <div className="flex flex-col gap-3">
                    {uniqueRows.map((row, rowIdx) => {
                        const categoryObj = getSeatCategory(row, parsedConfig);
                        const seatsInRow = rowSeatCounts[row] || 10;
                        const rowPrice = getSeatPrice(row, basePrice, parsedConfig);
                        
                        // Create a realistic aisle splitting (e.g., 2 blocks of seats)
                        const halfSeats = Math.floor(seatsInRow / 2);

                        return (
                            <motion.div 
                                key={row}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: rowIdx * 0.05 }}
                                className="flex items-center justify-center gap-6"
                            >
                                {/* Left Label */}
                                <div className="w-6 text-right font-bold text-sm" style={{ color: categoryObj.color }}>{row}</div>

                                {/* Left Block */}
                                <div className="flex gap-2">
                                    {Array.from({ length: halfSeats }, (_, i) => {
                                        const seatNum = `${row}${i + 1}`;
                                        return (
                                            <Seat 
                                                key={seatNum} 
                                                seatNumber={seatNum} 
                                                category={categoryObj} 
                                                isBooked={(seatMap.reservedSeatLabels || []).includes(seatNum)} 
                                                isSelected={selectedSeats.includes(seatNum)} 
                                                onToggle={toggleSeat} 
                                            />
                                        );
                                    })}
                                </div>
                                
                                {/* Aisle Gap - Walkway */}
                                <div className="w-8" />

                                {/* Right Block */}
                                <div className="flex gap-2">
                                    {Array.from({ length: seatsInRow - halfSeats }, (_, i) => {
                                        const seatNum = `${row}${halfSeats + i + 1}`;
                                        return (
                                            <Seat 
                                                key={seatNum} 
                                                seatNumber={seatNum} 
                                                category={categoryObj} 
                                                isBooked={(seatMap.reservedSeatLabels || []).includes(seatNum)} 
                                                isSelected={selectedSeats.includes(seatNum)} 
                                                onToggle={toggleSeat} 
                                            />
                                        );
                                    })}
                                </div>

                                {/* Right Price Info */}
                                <div className="w-12 text-left font-mono text-xs opacity-50" style={{ color: categoryObj.color }}>
                                    ₹{Math.round(rowPrice)}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-16 flex flex-wrap justify-center gap-6 border-t border-white/5 pt-6 w-full max-w-xl">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white/5 border border-white/10" /><span className="text-xs text-gray-400">Available</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-500/20 border border-red-500" /><span className="text-xs text-white">Selected</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#1f2937] border border-[#374151] opacity-50 flex items-center justify-center"><span className="text-[8px]">X</span></div><span className="text-xs text-gray-500">Reserved</span></div>
                    
                    {(parsedConfig?.categories || [FALLBACK_CATEGORY]).map((cat) => (
                        <div key={cat.id || cat.name} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border" style={{ backgroundColor: `${cat.color}20`, borderColor: cat.color }} />
                            <span className="text-xs" style={{ color: cat.color }}>{cat.name || cat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Summary Pane */}
        <div className="w-full lg:w-96 shrink-0 mt-8 lg:mt-0">
            <div className="sticky top-8 bg-[#12121a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col h-[calc(100vh-4rem)]">
                
                <h3 className="text-lg font-bold mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                    Booking Summary
                    <Ticket className="w-5 h-5 text-gray-400" />
                </h3>

                {/* Selected Seats Grid */}
                <div className="flex-1 overflow-y-auto mb-6">
                    <p className="text-sm font-medium text-gray-400 mb-3">Selected Seats ({selectedSeats.length}/10)</p>
                    
                    <AnimatePresence mode="popLayout">
                        {selectedSeats.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-48 bg-white/5 rounded-2xl border border-dashed border-white/10"
                            >
                                <Armchair className="w-8 h-8 text-gray-600 mb-2" />
                                <p className="text-sm text-gray-400">No seats selected yet</p>
                            </motion.div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedSeats.sort().map((seat) => {
                                    const cat = getSeatCategory(seat.charAt(0), parsedConfig);
                                    const price = getSeatPrice(seat.charAt(0), basePrice, parsedConfig);
                                    return (
                                        <motion.div
                                            layout
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            key={seat}
                                            onClick={() => toggleSeat(seat)}
                                            className="px-3 py-1.5 rounded-lg border text-sm font-bold flex flex-col gap-1 cursor-pointer hover:bg-white/5 transition-colors"
                                            style={{ borderColor: `${cat.color}40`, color: cat.color, backgroundColor: `${cat.color}10` }}
                                        >
                                            <span className="flex items-center justify-between gap-3">
                                                {seat} <span className="text-[10px] opacity-60 ml-2 font-mono">₹{price}</span>
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Total & Checkout */}
                <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="flex items-end justify-between mb-6">
                        <div className="text-gray-400 font-medium">Total Amount</div>
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={totalPrice}
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400"
                            >
                                ₹{Math.round(totalPrice)}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={handleBooking}
                        disabled={selectedSeats.length === 0 || booking}
                        className={`w-full relative overflow-hidden group disabled:bg-gray-800 disabled:text-gray-500 rounded-xl py-4 font-bold text-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:shadow-none hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:-translate-y-1 disabled:transform-none disabled:cursor-not-allowed
                            ${isBoxOfficeMode ? "bg-green-600 hover:shadow-[0_0_30px_rgba(22,163,74,0.6)] shadow-[0_0_20px_rgba(22,163,74,0.3)]" : "bg-red-600"}
                        `}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {booking ? (
                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                            ) : selectedSeats.length === 0 ? (
                                'Please Select Seats'
                            ) : isBoxOfficeMode ? (
                                <><Banknote className="w-5 h-5"/> Cash Checkout (₹{Math.round(totalPrice)})</>
                            ) : (
                                <>Pay ₹{Math.round(totalPrice)} <ChevronRightIcon /></>
                            )}
                        </span>
                        {!booking && selectedSeats.length > 0 && (
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isBoxOfficeMode ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-red-500 to-red-600"}`} />
                        )}
                    </button>
                    
                    {!isBoxOfficeMode && (
                        <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                            <Info className="w-3 h-3" /> F&B Options available on next screen
                        </p>
                    )}
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default Booking;
