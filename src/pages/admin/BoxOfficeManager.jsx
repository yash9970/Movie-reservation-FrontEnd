import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Search, Film, Users, Ticket, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../../auth/AuthContext";
import { apiClient } from "../../api/api";
import Button from "../../Components/ui/Button";
import Input from "../../Components/ui/Input";
import LoadingSpinner from "../../Components/ui/LoadingSpinner";
import Modal from "../../Components/ui/Modal";

const BoxOfficeManager = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const [showtimes, setShowtimes] = useState([]);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Manifest Modal State
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [manifest, setManifest] = useState(null);
    const [loadingManifest, setLoadingManifest] = useState(false);

    useEffect(() => {
        loadTodayShowtimes();
    }, []);

    const loadTodayShowtimes = async () => {
        try {
            setLoading(true);
            console.log("[BoxOffice] Loading data...");
            const [showtimesData, moviesData] = await Promise.all([
                apiClient('/api/showtimes', token),
                apiClient('/api/movies', token)
            ]);
            
            console.log(`[BoxOffice] Received ${showtimesData.length} showtimes and ${moviesData.length} movies`);
            
            // Filter: Show showtimes from 6 hours ago up to any time in the future
            const now = new Date();
            const relevantShowtimes = showtimesData.filter(st => {
                 const stTime = new Date(st.showDateTime);
                 const diffHours = (stTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                 // We show anything that started in the last 6 hours or is in the future
                 return diffHours >= -6;
            });

            console.log(`[BoxOffice] ${relevantShowtimes.length} showtimes passed the filter`);
            setShowtimes(relevantShowtimes.sort((a,b) => new Date(a.showDateTime) - new Date(b.showDateTime)));
            setMovies(moviesData);
        } catch (error) {
            console.error("[BoxOffice] Error loading data:", error);
            toast.error("Failed to load box office data");
        } finally {
            setLoading(false);
        }
    };

    const getMovieTitle = (movieId) => {
        const movie = movies.find((m) => m.id === movieId);
        return movie ? movie.title : "Unknown Movie";
    };

    const openManifest = async (showtime) => {
        setSelectedShowtime(showtime);
        setLoadingManifest(true);
        try {
            const data = await apiClient(`/api/bookings/showtimes/${showtime.id}/manifest`, token);
            setManifest(data);
        } catch (err) {
            toast.error("Failed to load manifest");
            setSelectedShowtime(null);
        } finally {
            setLoadingManifest(false);
        }
    };
    
    const handleWalkInBooking = (showtimeId) => {
         navigate(`/booking/${showtimeId}?boxoffice=true`);
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" message="Initialising Box Office Terminal..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Box Office Terminal</h1>
                    <p className="text-gray-400 mt-1">Manage today's live walk-ins and seating manifests</p>
                </div>
                <Button onClick={loadTodayShowtimes} variant="outline" size="sm" className="gap-2">
                   <Clock size={14} /> Refresh
                </Button>
            </div>

            {showtimes.length === 0 ? (
                <div className="glass-card p-12 text-center space-y-4 border-dashed border-2 border-white/10">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Film className="text-gray-600" size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white">No Active Showtimes</h3>
                        <p className="text-gray-400 max-w-md mx-auto mt-2">
                            There are no showtimes scheduled for today or the immediate future. 
                            Please check with the system administrator to schedule movies.
                        </p>
                    </div>
                    <Button onClick={loadTodayShowtimes} variant="secondary">
                        Try Reloading Data
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {showtimes.map((showtime) => {
                        const movie = movies.find((m) => m.id === showtime.movieId);
                        const showDate = new Date(showtime.showDateTime);
                        const isStarted = showDate < new Date();

                        return (
                            <div key={showtime.id} className={`glass-card p-6 border-l-4 ${isStarted ? 'border-l-yellow-500' : 'border-l-green-500'} relative overflow-hidden group hover:border-white/20 transition-all`}>
                                {movie && movie.posterUrl && (
                                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"
                                         style={{ backgroundImage: `url(${movie.posterUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(5px)' }}
                                    />
                                )}
                                
                                <div className="relative z-10">
                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded inline-block mb-3 ${isStarted ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {isStarted ? 'In Progress' : 'Upcoming'}
                                    </span>
                                    
                                    <h3 className="text-xl font-bold text-white leading-tight mb-2">
                                        {getMovieTitle(showtime.movieId)}
                                    </h3>
                                    
                                    <div className="space-y-2 mb-6 text-sm">
                                        <p className="text-gray-300 flex items-center gap-2">
                                            <Clock size={16} className="text-gray-500" />
                                            {format(showDate, "h:mm a")} (Screen {showtime.screenNumber})
                                        </p>
                                        <p className="text-gray-300 flex items-center gap-2">
                                            <Users size={16} className="text-gray-500" />
                                            {showtime.totalSeats - showtime.availableSeats} / {showtime.totalSeats} seats booked
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button onClick={() => openManifest(showtime)} variant="secondary" className="flex-1 text-xs py-2 flex justify-center items-center gap-2">
                                            <Ticket size={14} /> Manifest
                                        </Button>
                                        <Button onClick={() => handleWalkInBooking(showtime.id)} className="flex-1 text-xs py-2 flex justify-center items-center gap-2">
                                            + Walk-in
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Manifest Modal */}
            <Modal
                isOpen={!!selectedShowtime}
                onClose={() => setSelectedShowtime(null)}
                title="Screen Manifest"
            >
                {loadingManifest ? (
                     <div className="py-12 flex justify-center"><LoadingSpinner /></div>
                ) : manifest ? (
                     <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                          <div className="bg-black/20 p-4 rounded-lg mb-6 border border-white/5">
                              <h3 className="text-white font-semibold mb-1">{getMovieTitle(selectedShowtime?.movieId)}</h3>
                              <p className="text-sm text-gray-400">Screen {selectedShowtime?.screenNumber} — {selectedShowtime && format(new Date(selectedShowtime.showDateTime), "MMM dd, yyyy h:mm a")}</p>
                          </div>

                          {Object.keys(manifest).length === 0 ? (
                               <div className="text-center py-8 text-gray-500">No seats booked yet.</div>
                          ) : (
                               <div className="space-y-3">
                                   {Object.entries(manifest).map(([seatLabel, data]) => (
                                        <div key={seatLabel} className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center hover:bg-white/10 transition-colors">
                                             <div className="flex items-center gap-4">
                                                  <div className="w-10 h-10 rounded bg-red-500/20 text-red-400 font-bold flex items-center justify-center">
                                                       {seatLabel}
                                                  </div>
                                                  <div>
                                                       <p className="text-white font-medium text-sm">{data.customerName}</p>
                                                       <p className="text-gray-400 text-xs">{data.customerEmail}</p>
                                                  </div>
                                             </div>
                                             <div className="text-right">
                                                  <p className="text-xs text-gray-500 uppercase font-semibold">Ref</p>
                                                  <p className="font-mono text-gray-300 text-sm">{data.bookingReference}</p>
                                                  <p className={`text-[10px] uppercase font-bold mt-1 ${data.status === 'CONFIRMED' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                      {data.status}
                                                  </p>
                                             </div>
                                        </div>
                                   ))}
                               </div>
                          )}
                     </div>
                ) : (
                     <div className="py-8 text-center text-red-400">Failed to load manifest.</div>
                )}
            </Modal>
        </div>
    );
};

export default BoxOfficeManager;
