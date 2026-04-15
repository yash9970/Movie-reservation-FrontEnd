import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiClient } from '../api/api';
import toast from 'react-hot-toast';
import Button from '../Components/ui/Button';
import Input from '../Components/ui/Input';
import LoadingSkeleton from '../Components/LoadingSkeleton';

const EditProfile = () => {
    const { user, token, login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
    });

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const data = await apiClient(`/api/users/${user.id}`, token);
            setFormData({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                password: '', // Don't populate password
            });
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            // Don't send password if it's empty
            const payload = { ...formData };
            if (!payload.password) {
                delete payload.password;
            }

            const updatedUser = await apiClient(`/api/users/${user.id}`, token, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });

            // Update auth context with new user data
            login({
                token: token,
                userId: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
            });

            toast.success('Profile updated successfully');
            navigate('/profile');
        } catch (err) {
            if (err.data && err.data.errors) {
                setErrors(err.data.errors);
                const firstError = Object.values(err.data.errors)[0];
                toast.error(firstError);
            } else {
                toast.error(err.message || 'Failed to update profile');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <LoadingSkeleton variant="text" className="h-12 w-64" />
                <LoadingSkeleton variant="card" className="h-96" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/profile')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                        Edit Profile
                    </h1>
                    <p className="text-gray-400 mt-2">Update your personal information</p>
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

                    <div className="md:col-span-2">
                        <Input
                            label="New Password (leave blank to keep current)"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            error={errors.password}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Only fill this if you want to change your password
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/profile')}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        <Save className="h-5 w-5" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </motion.form>
        </div>
    );
};

export default EditProfile;
