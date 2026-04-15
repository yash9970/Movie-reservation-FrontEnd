import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Shield, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getUsers, deleteUser } from '../../api/userApi';
import toast from 'react-hot-toast';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import LoadingSkeleton from '../../Components/LoadingSkeleton';
import Modal from '../../Components/ui/Modal';

const ManageUsers = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, user: null });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            setFilteredUsers(
                users.filter(
                    (user) =>
                        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
            setFilteredUsers(data);
            toast.success(`${data.length} users loaded`);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.user) return;

        try {
            await deleteUser(deleteModal.user.id);
            toast.success('User deleted successfully');
            setDeleteModal({ open: false, user: null });
            loadUsers();
        } catch (err) {
            toast.error('Failed to delete user');
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-red-500/20 text-red-400';
            case 'THEATER_OWNER':
                return 'bg-blue-500/20 text-blue-400';
            case 'CUSTOMER':
            default:
                return 'bg-green-500/20 text-green-400';
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
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                        Manage Users
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Add, edit, or manage user accounts and roles
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => navigate('/admin/users/new')}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Add User
                </Button>
            </div>

            {/* Search */}
            <div className="glass-card p-6">
                <Input
                    icon={Search}
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Name
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Phone
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredUsers.map((user) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                                                <Shield className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{user.email}</td>
                                    <td className="px-6 py-4 text-sm">{user.phoneNumber}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                                                user.role
                                            )}`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isActive ? (
                                            <div className="flex items-center gap-2 text-green-400">
                                                <UserCheck className="h-4 w-4" />
                                                <span className="text-sm">Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-red-400">
                                                <UserX className="h-4 w-4" />
                                                <span className="text-sm">Inactive</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                                                className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4 text-blue-400" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ open: true, user })}
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

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No users found</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, user: null })}
                title="Delete User"
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-white">
                            {deleteModal.user?.firstName} {deleteModal.user?.lastName}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => setDeleteModal({ open: false, user: null })}
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

export default ManageUsers;
