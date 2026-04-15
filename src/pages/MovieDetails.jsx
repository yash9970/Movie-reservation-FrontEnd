import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Calendar, User, Play, Ticket, X } from "lucide-react";
import { authFetch } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { format } from "date-fns";

/* Extract YouTube video ID from various URL formats */
const getYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};


const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMovieDetails = useCallback(async () => {
    try {
      const [movieData, showtimesData] = await Promise.all([
        authFetch(`/api/movies/${id}`, token),
        authFetch(`/api/showtimes/movie/${id}`, token),
      ]);
      setMovie(movieData);
      setShowtimes(showtimesData);
    } catch {
      toast.error("Failed to load movie details");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => { loadMovieDetails(); }, [loadMovieDetails]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-8">
        <div className="h-[520px] bg-white/5 rounded-3xl w-full" />
        <div className="grid lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="h-40 bg-white/5 rounded-2xl w-full" />
              <div className="h-60 bg-white/5 rounded-2xl w-full" />
           </div>
           <div className="h-[400px] bg-white/5 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const hasTrailer = movie.trailerUrl && movie.trailerUrl.trim() !== "";

  return (
    <div className="space-y-8 relative">
      {/* Dynamic Background Bleed */}
      <div 
         className="fixed inset-0 opacity-[0.15] blur-[120px] transform scale-110 pointer-events-none z-[-1]" 
         style={{ 
             backgroundImage: `url(${movie.posterUrl})`,
             backgroundPosition: 'center',
             backgroundSize: 'cover'
         }} 
      />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[520px] rounded-3xl overflow-hidden group bg-black"
      >
        {hasTrailer && getYouTubeId(movie.trailerUrl) ? (
          <iframe
            src={`https://www.youtube.com/embed/${getYouTubeId(movie.trailerUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeId(movie.trailerUrl)}&rel=0&modestbranding=1&controls=0`}
            title={`${movie.title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-[150%] h-[150%] -left-[25%] -top-[25%] border-none pointer-events-none"
          />
        ) : (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent pointer-events-none" />



        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-xl backdrop-blur-sm">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-white">{movie.rating}/10</span>
            </div>
            <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-xl backdrop-blur-sm">
              <Clock className="h-5 w-5 text-gray-300" />
              <span className="text-white">{movie.durationMinutes} mins</span>
            </div>
            <span className="bg-red-600 px-4 py-2 rounded-xl font-semibold text-white">
              {movie.genre}
            </span>
            <span className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm text-white">
              {movie.language}
            </span>

          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Movie Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-2xl font-bold">About the Movie</h2>
            <p className="text-gray-300 leading-relaxed">{movie.description}</p>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h2 className="text-2xl font-bold">Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-red-500 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Director</p>
                  <p className="font-semibold">{movie.director}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-red-500 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Release Date</p>
                  <p className="font-semibold">
                    {format(new Date(movie.releaseDate), "MMMM dd, yyyy")}
                  </p>
                </div>
              </div>
              <div className="md:col-span-2 flex items-start gap-3">
                <User className="h-5 w-5 text-red-500 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Cast</p>
                  <p className="font-semibold">{movie.cast}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Showtimes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="glass-card p-6 space-y-4 sticky top-24">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Ticket className="h-6 w-6 text-red-500" />
              Book Tickets
            </h2>

            {showtimes.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No showtimes available</p>
            ) : (
              <div className="space-y-3">
                {showtimes.map((showtime) => (
                  <motion.div
                    key={showtime.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-red-500/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/booking/${showtime.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg">
                          {format(new Date(showtime.showDateTime), "h:mm a")}
                        </p>
                        <p className="text-sm text-gray-400">
                          {format(new Date(showtime.showDateTime), "MMM dd, yyyy")}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">Screen {showtime.screenNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-500 text-lg">₹{Math.round(showtime.pricePerSeat)}</p>
                        <p className="text-xs text-gray-400">per seat</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">
                        {showtime.availableSeats} seats left
                      </p>
                      <button
                        className="btn-primary text-sm py-2"
                        disabled={showtime.availableSeats === 0}
                      >
                        {showtime.availableSeats === 0 ? "Sold Out" : "Book Now"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MovieDetail;