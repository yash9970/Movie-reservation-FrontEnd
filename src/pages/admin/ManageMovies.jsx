import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { apiClient } from '../../api/api';
import toast from 'react-hot-toast';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import LoadingSkeleton from '../../Components/LoadingSkeleton';
import Modal from '../../Components/ui/Modal';

const ManageMovies = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, movie: null });

    useEffect(() => {
        loadMovies();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            setFilteredMovies(
                movies.filter((movie) =>
                    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        } else {
            setFilteredMovies(movies);
        }
    }, [searchTerm, movies]);

    const loadMovies = async () => {
        try {
            const data = await apiClient('/api/movies', token);
            setMovies(data);
            setFilteredMovies(data);
            toast.success(`${data.length} movies loaded`);
        } catch (err) {
            toast.error('Failed to load movies');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.movie) return;

        try {
            await apiClient(`/api/movies/${deleteModal.movie.id}`, token, {
                method: 'DELETE',
            });
            toast.success('Movie deleted successfully');
            setDeleteModal({ open: false, movie: null });
            loadMovies();
        } catch (err) {
            toast.error('Failed to delete movie');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton variant="text" className="h-12 w-64" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <LoadingSkeleton key={i} variant="card" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                        Manage Movies
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Add, edit, or remove movies from your catalog
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => navigate('/admin/movies/new')}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Add Movie
                </Button>
            </div>

            {/* Search */}
            <div className="glass-card p-6">
                <Input
                    icon={Search}
                    placeholder="Search movies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Movies Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Title
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Genre
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Language
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Duration
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Rating
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredMovies.map((movie) => (
                                <motion.tr
                                    key={movie.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={movie.posterUrl || 'https://via.placeholder.com/50'}
                                                alt={movie.title}
                                                className="w-12 h-16 object-cover rounded"
                                            />
                                            <div>
                                                <p className="font-semibold">{movie.title}</p>
                                                <p className="text-sm text-gray-400">{movie.director}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{movie.genre}</td>
                                    <td className="px-6 py-4 text-sm">{movie.language}</td>
                                    <td className="px-6 py-4 text-sm">{movie.durationMinutes} min</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${movie.status === 'NOW_SHOWING'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : movie.status === 'COMING_SOON'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                }`}
                                        >
                                            {movie.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">⭐ {movie.rating}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/movies/edit/${movie.id}`)}
                                                className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4 text-blue-400" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ open: true, movie })}
                                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-400" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredMovies.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No movies found</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, movie: null })}
                title="Delete Movie"
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-white">
                            {deleteModal.movie?.title}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => setDeleteModal({ open: false, movie: null })}
                        >
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageMovies;
