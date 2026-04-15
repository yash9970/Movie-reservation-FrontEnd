import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { apiClient } from '../../api/api';
import toast from 'react-hot-toast';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import LoadingSkeleton from '../../Components/LoadingSkeleton';
import Modal from '../../Components/ui/Modal';

const ManageTheaters = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [theaters, setTheaters] = useState([]);
    const [filteredTheaters, setFilteredTheaters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, theater: null });

    useEffect(() => {
        loadTheaters();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            setFilteredTheaters(
                theaters.filter(
                    (theater) =>
                        theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        theater.city.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        } else {
            setFilteredTheaters(theaters);
        }
    }, [searchTerm, theaters]);

    const loadTheaters = async () => {
        try {
            const data = await apiClient('/api/theaters', token);
            setTheaters(data);
            setFilteredTheaters(data);
            toast.success(`${data.length} theaters loaded`);
        } catch (err) {
            toast.error('Failed to load theaters');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.theater) return;

        try {
            await apiClient(`/api/theaters/${deleteModal.theater.id}`, token, {
                method: 'DELETE',
            });
            toast.success('Theater deleted successfully');
            setDeleteModal({ open: false, theater: null });
            loadTheaters();
        } catch (err) {
            toast.error('Failed to delete theater');
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
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                        Manage Theaters
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Add, edit, or remove theaters from your system
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => navigate('/admin/theaters/new')}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Add Theater
                </Button>
            </div>

            {/* Search */}
            <div className="glass-card p-6">
                <Input
                    icon={Search}
                    placeholder="Search theaters by name or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Theaters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTheaters.map((theater, index) => (
                    <motion.div
                        key={theater.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card p-6 hover:scale-105 transition-all duration-300"
                    >
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">{theater.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{theater.city}, {theater.state}</span>
                                    </div>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${theater.isActive
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-gray-500/20 text-gray-400'
                                        }`}
                                >
                                    {theater.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <p className="text-gray-400">{theater.address}</p>
                                <p className="text-gray-400">Screens: {theater.totalScreens}</p>
                                <p className="text-gray-400">Phone: {theater.phoneNumber}</p>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-white/10">
                                <button
                                    onClick={() => navigate(`/admin/theaters/edit/${theater.id}`)}
                                    className="flex-1 p-2 hover:bg-blue-500/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit className="h-4 w-4 text-blue-400" />
                                    <span className="text-sm">Edit</span>
                                </button>
                                <button
                                    onClick={() => setDeleteModal({ open: true, theater })}
                                    className="flex-1 p-2 hover:bg-red-500/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                    <span className="text-sm">Delete</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredTheaters.length === 0 && (
                <div className="text-center py-12 glass-card">
                    <p className="text-gray-400">No theaters found</p>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, theater: null })}
                title="Delete Theater"
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-white">
                            {deleteModal.theater?.name}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => setDeleteModal({ open: false, theater: null })}
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

export default ManageTheaters;
