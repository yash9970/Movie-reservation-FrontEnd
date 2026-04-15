import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { getUserById, adminCreateUser, updateUser } from '../../api/userApi';
import toast from 'react-hot-toast';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';

const UserForm = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'CUSTOMER',
        isActive: true,
    });

    const roles = ['CUSTOMER', 'ADMIN', 'THEATER_OWNER'];

    useEffect(() => {
        if (id) {
            loadUser();
        }
    }, [id]);

    const loadUser = async () => {
        try {
            const data = await getUserById(id);
            setFormData({
                ...data,
                password: '', // Don't populate password for security
            });
        } catch (err) {
            toast.error('Failed to load user');
            navigate('/admin/users');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // Don't send password if editing and it's empty
            const payload = { ...formData };
            if (id && !payload.password) {
                delete payload.password;
            }

            if (id) {
                await updateUser(id, payload);
            } else {
                // Use admin-specific endpoint for creating new users
                await adminCreateUser(payload);
            }

            toast.success(id ? 'User updated successfully' : 'User created successfully');
            navigate('/admin/users');
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
                const firstError = Object.values(err.response.data.errors)[0];
                toast.error(firstError);
            } else {
                toast.error(err.response?.data?.message || err.message || (id ? 'Failed to update user' : 'Failed to create user'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                        {id ? 'Edit User' : 'Add New User'}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {id ? 'Update user information and role' : 'Create a new user account'}
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
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder="Enter first name"
                        error={errors.firstName}
                    />

                    <Input
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Enter last name"
                        error={errors.lastName}
                    />

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter email address"
                        error={errors.email}
                    />

                    <Input
                        label="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        placeholder="Enter phone number"
                        maxLength={10}
                        error={errors.phoneNumber}
                    />

                    <Input
                        label={id ? 'Password (leave blank to keep current)' : 'Password'}
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!id}
                        placeholder="Enter password"
                        error={errors.password}
                    />

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="input-field"
                            required
                        >
                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                        {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="isActive"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="w-5 h-5 rounded border-white/10 bg-white/5 text-red-600 focus:ring-2 focus:ring-red-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium">
                            Active Account
                        </label>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/admin/users')}
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
                        {loading ? 'Saving...' : id ? 'Update User' : 'Create User'}
                    </Button>
                </div>
            </motion.form>
        </div>
    );
};

export default UserForm;
