import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Calendar, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiClient } from '../api/api';
import toast from 'react-hot-toast';
import Card from '../Components/ui/Card';
import Button from '../Components/ui/Button';
import LoadingSkeleton from '../Components/LoadingSkeleton';

const UserProfile = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserDetails();
    }, []);

    const loadUserDetails = async () => {
        try {
            const data = await apiClient(`/api/users/${user.id}`, token);
            setUserDetails(data);
        } catch (err) {
            toast.error('Failed to load user details');
        } finally {
            setLoading(false);
        }
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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 py-8"
            >
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                    My Profile
                </h1>
                <p className="text-gray-400">View and manage your account information</p>
            </motion.div>

            {/* Profile Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="p-8">
                    <div className="space-y-6">
                        {/* Name */}
                        <div className="flex items-start gap-4 pb-6 border-b border-white/10">
                            <div className="p-3 bg-red-500/20 rounded-lg">
                                <User className="h-6 w-6 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-400 mb-1">Full Name</p>
                                <p className="text-xl font-semibold">
                                    {userDetails?.firstName} {userDetails?.lastName}
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-4 pb-6 border-b border-white/10">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                <Mail className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-400 mb-1">Email Address</p>
                                <p className="text-xl font-semibold">{userDetails?.email}</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start gap-4 pb-6 border-b border-white/10">
                            <div className="p-3 bg-green-500/20 rounded-lg">
                                <Phone className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                                <p className="text-xl font-semibold">{userDetails?.phoneNumber}</p>
                            </div>
                        </div>

                        {/* Role */}
                        <div className="flex items-start gap-4 pb-6 border-b border-white/10">
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                                <Shield className="h-6 w-6 text-purple-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-400 mb-1">Account Type</p>
                                <p className="text-xl font-semibold">
                                    {userDetails?.role?.replace('_', ' ')}
                                </p>
                            </div>
                        </div>

                        {/* Account Status */}
                        <div className="flex items-start gap-4 pb-6 border-b border-white/10">
                            <div className="p-3 bg-yellow-500/20 rounded-lg">
                                <Calendar className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-400 mb-1">Account Status</p>
                                <p className="text-xl font-semibold">
                                    {userDetails?.isActive ? (
                                        <span className="text-green-400">Active</span>
                                    ) : (
                                        <span className="text-red-400">Inactive</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Member Since */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-500/20 rounded-lg">
                                <Calendar className="h-6 w-6 text-indigo-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-400 mb-1">Member Since</p>
                                <p className="text-xl font-semibold">
                                    {userDetails?.createdAt
                                        ? new Date(userDetails.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Button */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <Button
                            variant="primary"
                            className="w-full flex items-center justify-center gap-2"
                            onClick={() => navigate('/profile/edit')}
                        >
                            <Edit className="h-5 w-5" />
                            Edit Profile
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default UserProfile;
