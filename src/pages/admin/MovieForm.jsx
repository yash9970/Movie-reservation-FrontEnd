import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { apiClient } from '../../api/api';
import toast from 'react-hot-toast';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';

const MovieForm = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        director: '',
        language: '',
        genre: 'ACTION',
        durationMinutes: '',
        releaseDate: '',
        rating: '',
        cast: '',
        posterUrl: '',
        trailerUrl: '',
        status: 'COMING_SOON',
    });

    const genres = ['ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'ROMANCE', 'SCI_FI', 'THRILLER', 'ANIMATION', 'DOCUMENTARY', 'FANTASY'];
    const statuses = ['COMING_SOON', 'NOW_SHOWING', 'ARCHIVED'];

    useEffect(() => {
        if (id) {
            loadMovie();
        }
    }, [id]);

    const loadMovie = async () => {
        try {
            const data = await apiClient(`/api/movies/${id}`, token);
            setFormData(data);
        } catch (err) {
            toast.error('Failed to load movie');
            navigate('/admin/movies');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const method = id ? 'PUT' : 'POST';
            const url = id ? `/api/movies/${id}` : '/api/movies';

            await apiClient(url, token, {
                method,
                body: JSON.stringify(formData),
            });

            toast.success(id ? 'Movie updated successfully' : 'Movie created successfully');
            navigate('/admin/movies');
        } catch (err) {
            toast.error(id ? 'Failed to update movie' : 'Failed to create movie');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/movies')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                        {id ? 'Edit Movie' : 'Add New Movie'}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {id ? 'Update movie information' : 'Add a new movie to your catalog'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="glass-card p-8 space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter movie title"
                    />

                    <Input
                        label="Director"
                        name="director"
                        value={formData.director}
                        onChange={handleChange}
                        required
                        placeholder="Enter director name"
                    />

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Genre</label>
                        <select
                            name="genre"
                            value={formData.genre}
                            onChange={handleChange}
                            className="input-field"
                            required
                        >
                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Language"
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        required
                        placeholder="e.g., English, Hindi"
                    />

                    <Input
                        label="Duration (minutes)"
                        name="durationMinutes"
                        type="number"
                        value={formData.durationMinutes}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 120"
                    />

                    <Input
                        label="Release Date"
                        name="releaseDate"
                        type="date"
                        value={formData.releaseDate}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Rating"
                        name="rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={formData.rating}
                        onChange={handleChange}
                        placeholder="e.g., 8.5"
                    />

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="input-field"
                            required
                        >
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="input-field resize-none"
                        placeholder="Enter movie description"
                    />
                </div>

                <Input
                    label="Cast (comma-separated)"
                    name="cast"
                    value={formData.cast}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Actor 1, Actor 2, Actor 3"
                />

                <Input
                    label="Poster URL"
                    name="posterUrl"
                    value={formData.posterUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/poster.jpg"
                />

                <Input
                    label="Trailer URL"
                    name="trailerUrl"
                    value={formData.trailerUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/trailer.mp4"
                />

                <div className="flex gap-4 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/admin/movies')}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        <Save className="h-5 w-5" />
                        {loading ? 'Saving...' : id ? 'Update Movie' : 'Create Movie'}
                    </Button>
                </div>
            </motion.form>
        </div>
    );
};

export default MovieForm;
