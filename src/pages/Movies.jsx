import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, Filter, Calendar } from "lucide-react";
import { getMovies, searchMovies, getMoviesByGenre } from "../api/movieApi";
import { apiClient } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import MovieCard from "../Components/MovieCard";
import LoadingSkeleton from "../Components/LoadingSkeleton";
import { useDebounce } from "../hooks/useDebounce";

const Movies = () => {
  const { token } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Load movies when filters change
  useEffect(() => {
    loadMovies();
  }, [debouncedSearchTerm, selectedGenre, selectedStatus]);

  const loadMovies = async () => {
    setLoading(true);
    try {
      let response;

      // This is a naive client-side combining logic due to lack of advanced dynamic filter API backend
      if (debouncedSearchTerm) {
        response = await searchMovies(debouncedSearchTerm);
      } else if (selectedGenre !== "all") {
        response = await getMoviesByGenre(selectedGenre);
      } else if (selectedStatus !== "all") {
          // New endpoint: /api/movies/status/{status}
          response = await apiClient(`/api/movies/status/${selectedStatus}`);
      } else {
        response = await getMovies();
      }

      // Handle response - it might be wrapped in { data: [...] }
      const data = response?.data || response;

      // Ensure data is an array
      let moviesArray = Array.isArray(data) ? data : [];

      // Apply client-side filtering for overlapping filters (since backend doesn't have a combined endpoint)
      if (selectedStatus !== "all" && debouncedSearchTerm) {
          moviesArray = moviesArray.filter(m => m.status === selectedStatus);
      }
      if (selectedGenre !== "all" && debouncedSearchTerm) {
          moviesArray = moviesArray.filter(m => m.genre === selectedGenre);
      }
      if (selectedStatus !== "all" && selectedGenre !== "all" && !debouncedSearchTerm) {
          moviesArray = moviesArray.filter(m => m.status === selectedStatus);
      }

      setMovies(moviesArray);
    } catch (err) {
      console.error("Failed to load movies:", err);
      toast.error("Failed to load movies");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const genres = useMemo(() => {
    return ["all", "ACTION", "COMEDY", "DRAMA", "HORROR", "ROMANCE", "SCI_FI", "THRILLER", "ANIMATION", "DOCUMENTARY", "FANTASY"];
  }, []);

  const statuses = useMemo(() => {
    return ["all", "NOW_SHOWING", "COMING_SOON"];
  }, []);

  if (loading && movies.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4 py-8">
          <LoadingSkeleton variant="text" className="h-12 w-64 mx-auto" />
          <LoadingSkeleton variant="text" className="h-6 w-96 mx-auto" />
        </div>
        <div className="glass-card p-6">
          <LoadingSkeleton variant="rect" className="h-12" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 py-8"
      >
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
          Discover Movies
        </h1>
        <p className="text-gray-400 text-lg">
          Book your tickets for the latest blockbusters
        </p>
      </motion.div>

      {/* Advanced Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 space-y-4 shadow-xl"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 relative w-full group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              placeholder="Search movies by title, director, or cast..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-white placeholder-gray-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Genre Filter */}
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/50 appearance-none text-white cursor-pointer"
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre} className="bg-gray-900 text-white">
                    {genre === "all" ? "All Genres" : genre.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-48">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/50 appearance-none text-white cursor-pointer"
              >
                {statuses.map((status) => (
                  <option key={status} value={status} className="bg-gray-900 text-white">
                    {status === "all" ? "All Statuses" : status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
          <TrendingUp className="h-4 w-4 text-red-500" />
          <span>Found <span className="text-white font-bold">{movies.length}</span> movies matching your criteria</span>
        </div>
      </motion.div>

      {/* Movies Grid */}
      {movies.length === 0 && !loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 glass-card rounded-2xl flex flex-col items-center justify-center p-8 border border-white/5"
        >
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
             <Search className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">No movies found</h3>
          <p className="text-gray-400 text-sm max-w-md">Try adjusting your search or filters to find what you're looking for.</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedGenre('all'); setSelectedStatus('all'); }}
            className="mt-6 text-red-500 hover:text-red-400 hover:underline"
          >
            Clear all filters
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {loading ? (
             Array.from({ length: 8 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))
          ) : (
            movies.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} />
            ))
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Movies;