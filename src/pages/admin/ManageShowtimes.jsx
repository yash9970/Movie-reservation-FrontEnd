import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Film, Calendar, Trash2, Edit, Plus, Search, Users } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../../auth/AuthContext";
import { apiClient } from "../../api/api";
import Button from "../../Components/ui/Button";
import Input from "../../Components/ui/Input";
import LoadingSpinner from "../../Components/ui/LoadingSpinner";
import Modal from "../../Components/ui/Modal";
import { deleteShowtime } from "../../api/showtimeApi";
import ShowtimeManifestModal from "./ShowtimeManifestModal";

const ManageShowtimes = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [showtimes, setShowtimes] = useState([]);
    const [movies, setMovies] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [showtimeToDelete, setShowtimeToDelete] = useState(null);
    const [manifestModalOpen, setManifestModalOpen] = useState(false);
    const [selectedShowtime, setSelectedShowtime] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMovie, setSelectedMovie] = useState("");
    const [selectedTheater, setSelectedTheater] = useState("");

    useEffect(() => {
        loadData();
    }, [selectedMovie, selectedTheater]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Build filter query params
            let showtimesUrl = '/api/showtimes';
            const params = new URLSearchParams();
            if (selectedMovie) params.append('movieId', selectedMovie);
            if (selectedTheater) params.append('theaterId', selectedTheater);
            if (params.toString()) showtimesUrl += `?${params.toString()}`;

            const [showtimesData, moviesData, theatersData] = await Promise.all([
                apiClient(showtimesUrl, token),
                apiClient('/api/movies', token),
                apiClient('/api/theaters', token),
            ]);

            setShowtimes(showtimesData);
            setMovies(moviesData);
            setTheaters(theatersData);
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Failed to load showtimes");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!showtimeToDelete) return;

        try {
            await deleteShowtime(showtimeToDelete.id, token);
            toast.success("Showtime deleted successfully");
            setDeleteModalOpen(false);
            setShowtimeToDelete(null);
            loadData();
        } catch (error) {
            console.error("Error deleting showtime:", error);
            toast.error(error.response?.data?.message || "Failed to delete showtime");
        }
    };

    const openDeleteModal = (showtime) => {
        setShowtimeToDelete(showtime);
        setDeleteModalOpen(true);
    };

    const openManifestModal = (showtime) => {
        setSelectedShowtime(showtime);
        setManifestModalOpen(true);
    };

    const getMovieTitle = (movieId) => {
        const movie = movies.find((m) => m.id === movieId);
        return movie ? movie.title : "Unknown Movie";
    };

    const getTheaterName = (theaterId) => {
        const theater = theaters.find((t) => t.id === theaterId);
        return theater ? theater.name : "Unknown Theater";
    };

    const getShowtimeStatus = (showDateTime) => {
        const now = new Date();
        const showTime = new Date(showDateTime);

        if (showTime < now) {
            return { label: "Completed", color: "text-gray-400" };
        } else if (showTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
            return { label: "Today", color: "text-yellow-400" };
        } else {
            return { label: "Upcoming", color: "text-green-400" };
        }
    };

    // Filter showtimes by search term
    const filteredShowtimes = showtimes.filter((showtime) => {
        const movieTitle = getMovieTitle(showtime.movieId).toLowerCase();
        const theaterName = getTheaterName(showtime.theaterId).toLowerCase();
        const search = searchTerm.toLowerCase();

        return movieTitle.includes(search) || theaterName.includes(search);
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" message="Loading showtimes..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Manage Showtimes</h1>
                    <p className="text-gray-400 mt-1">
                        Create and manage movie showtimes
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/admin/showtimes/new")}
                    className="flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Showtime
                </Button>
            </div>

            {/* Filters */}
            <div className="glass-card p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={20}
                        />
                        <Input
                            type="text"
                            placeholder="Search by movie or theater..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Movie Filter */}
                    <select
                        value={selectedMovie}
                        onChange={(e) => setSelectedMovie(e.target.value)}
                        className="input-field"
                    >
                        <option value="">All Movies</option>
                        {movies.map((movie) => (
                            <option key={movie.id} value={movie.id}>
                                {movie.title}
                            </option>
                        ))}
                    </select>

                    {/* Theater Filter */}
                    <select
                        value={selectedTheater}
                        onChange={(e) => setSelectedTheater(e.target.value)}
                        className="input-field"
                    >
                        <option value="">All Theaters</option>
                        {theaters.map((theater) => (
                            <option key={theater.id} value={theater.id}>
                                {theater.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Showtimes List */}
            {filteredShowtimes.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        No showtimes found
                    </h3>
                    <p className="text-gray-400 mb-6">
                        {searchTerm || selectedMovie || selectedTheater
                            ? "Try adjusting your filters"
                            : "Get started by creating your first showtime"}
                    </p>
                    <Button onClick={() => navigate("/admin/showtimes/new")}>
                        <Plus size={20} className="mr-2" />
                        Add Showtime
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredShowtimes.map((showtime) => {
                        const status = getShowtimeStatus(showtime.showDateTime);

                        return (
                            <div
                                key={showtime.id}
                                className="glass-card p-6 hover:border-red-500/50 transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Film className="text-red-500" size={24} />
                                            <h3 className="text-xl font-semibold text-white">
                                                {getMovieTitle(showtime.movieId)}
                                            </h3>
                                            <span className={`text-sm font-medium ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                                            <div>
                                                <p className="text-gray-400">Theater</p>
                                                <p className="text-white font-medium">
                                                    {getTheaterName(showtime.theaterId)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-gray-400">Screen</p>
                                                <p className="text-white font-medium">
                                                    Screen {showtime.screenNumber}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-gray-400">Date & Time</p>
                                                <p className="text-white font-medium">
                                                    {format(new Date(showtime.showDateTime), "MMM dd, yyyy")}
                                                </p>
                                                <p className="text-gray-300 text-xs">
                                                    {format(new Date(showtime.showDateTime), "h:mm a")}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-gray-400">Price</p>
                                                <p className="text-white font-medium">
                                                    ₹{showtime.pricePerSeat}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-gray-400">Total Seats</p>
                                                <p className="text-white font-medium">
                                                    {showtime.totalSeats}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-gray-400">Available</p>
                                                <p className="text-white font-medium">
                                                    {showtime.availableSeats}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-gray-400">Booked</p>
                                                <p className="text-white font-medium">
                                                    {showtime.totalSeats - showtime.availableSeats}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-gray-400">Occupancy</p>
                                                <p className="text-white font-medium">
                                                    {Math.round(
                                                        ((showtime.totalSeats - showtime.availableSeats) /
                                                            showtime.totalSeats) *
                                                        100
                                                    )}
                                                    %
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 ml-4 self-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openManifestModal(showtime)}
                                            className="text-xs w-full justify-center border-white/20 text-blue-400 hover:text-white"
                                        >
                                            <Users size={14} className="mr-1" />
                                            Manifest
                                        </Button>
                                        <div className="flex gap-2 w-full">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                    navigate(`/admin/showtimes/edit/${showtime.id}`)
                                                }
                                                className="flex-1"
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => openDeleteModal(showtime)}
                                                className="flex-1"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setShowtimeToDelete(null);
                }}
                title="Delete Showtime"
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        Are you sure you want to delete this showtime?
                    </p>
                    {showtimeToDelete && (
                        <div className="glass-card p-4">
                            <p className="text-white font-semibold">
                                {getMovieTitle(showtimeToDelete.movieId)}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {getTheaterName(showtimeToDelete.theaterId)} - Screen{" "}
                                {showtimeToDelete.screenNumber}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {format(
                                    new Date(showtimeToDelete.showDateTime),
                                    "MMM dd, yyyy - h:mm a"
                                )}
                            </p>
                        </div>
                    )}
                    <p className="text-red-400 text-sm">
                        This action cannot be undone. All bookings for this showtime will be
                        affected.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setShowtimeToDelete(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete Showtime
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Manifest Modal */}
            <ShowtimeManifestModal 
                isOpen={manifestModalOpen}
                onClose={() => setManifestModalOpen(false)}
                showtime={selectedShowtime}
            />
        </div>
    );
};

export default ManageShowtimes;
