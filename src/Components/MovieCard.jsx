import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Clock, Calendar } from "lucide-react";
import { formatDuration } from "../utils/formatters";

/**
 * Reusable Movie Card component
 * @param {object} props - Component props
 * @param {object} props.movie - Movie data
 * @param {number} props.index - Card index for animation delay
 */
const MovieCard = ({ movie, index = 0 }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(`/movies/${movie.id}`)}
            className="movie-card group flex flex-col h-full"
        >
            {/* Poster */}
            <div className="relative overflow-hidden aspect-[2/3]">
                <img
                    src={movie.posterUrl || "https://via.placeholder.com/300x450?text=No+Image"}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{movie.rating}</span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 left-3 bg-red-600 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-semibold">
                    {movie.status}
                </div>
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col flex-1 justify-between">
                <div className="space-y-3">
                    <h3 className="font-bold text-lg line-clamp-1 group-hover:text-red-500 transition-colors">
                        {movie.title}
                    </h3>

                    <p className="text-sm text-gray-400 line-clamp-2">
                        {movie.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(movie.durationMinutes)}</span>
                        </div>
                        <span className="px-2 py-1 bg-white/5 rounded text-xs">
                            {movie.genre}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(movie.releaseDate).getFullYear()}</span>
                    </div>
                </div>

                <button className="w-full btn-primary text-sm mt-4">
                    Book Now
                </button>
            </div>
        </motion.div>
    );
};

export default MovieCard;
