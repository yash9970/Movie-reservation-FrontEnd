import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Mail, Ticket, Clock } from 'lucide-react';
import Modal from '../../Components/ui/Modal';
import LoadingSpinner from '../../Components/ui/LoadingSpinner';
import { apiClient } from '../../api/api';
import { useAuth } from '../../auth/AuthContext';

const ShowtimeManifestModal = ({ isOpen, onClose, showtime }) => {
    const { token } = useAuth();
    const [manifest, setManifest] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hoveredSeat, setHoveredSeat] = useState(null);

    useEffect(() => {
        if (isOpen && showtime) {
            fetchManifest();
        } else {
            setManifest([]);
            setHoveredSeat(null);
        }
    }, [isOpen, showtime]);

    const fetchManifest = async () => {
        try {
            setLoading(true);
            setError(null);
            // Assuming booking-service running on gateway /api/bookings
            const data = await apiClient(`/api/bookings/showtimes/${showtime.id}/manifest`, token);
            setManifest(data || []);
        } catch (err) {
            setError(err.message || "Failed to load manifest. Ensure Booking Service is accessible.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate layout matrix
    const gridRows = {};
    manifest.forEach(seat => {
        const rowMatch = seat.seatLabel.match(/^[A-Z]+/);
        if (rowMatch) {
            const rowPrefix = rowMatch[0];
            if (!gridRows[rowPrefix]) gridRows[rowPrefix] = [];
            gridRows[rowPrefix].push(seat);
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Digital Manifest - Screen ${showtime?.screenNumber}`} size="4xl">
            {loading ? (
                <div className="flex flex-col items-center justify-center p-12">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-400">Decrypting seating manifest...</p>
                </div>
            ) : error ? (
                <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400">{error}</p>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Seating Map */}
                    <div className="flex-1 bg-black/40 border border-white/5 p-6 rounded-xl overflow-x-auto min-h-[300px]">
                        <div className="w-[80%] h-8 bg-gradient-to-b from-blue-500/30 to-transparent mx-auto rounded-t-full mb-12 flex items-center justify-center border-t border-blue-500/50">
                            <span className="text-blue-200/50 text-xs tracking-widest font-semibold uppercase">SCREEN</span>
                        </div>

                        <div className="inline-flex flex-col gap-3 min-w-max">
                            {Object.entries(gridRows).sort(([a], [b]) => a.localeCompare(b)).map(([rowId, seats]) => (
                                <div key={rowId} className="flex items-center gap-4">
                                    <span className="w-6 text-center font-bold text-gray-500">{rowId}</span>
                                    <div className="flex gap-2">
                                        {seats.sort((a,b) => {
                                            const aNum = parseInt(a.seatLabel.replace(/\D/g, ''));
                                            const bNum = parseInt(b.seatLabel.replace(/\D/g, ''));
                                            return aNum - bNum;
                                        }).map((seat) => (
                                            <motion.button
                                                key={seat.seatLabel}
                                                whileHover={{ scale: 1.1 }}
                                                onMouseEnter={() => setHoveredSeat(seat)}
                                                onMouseLeave={() => setHoveredSeat(null)}
                                                className={`w-8 h-8 rounded-t-lg rounded-b-sm border shadow-sm transition-colors
                                                    ${seat.status === 'RESERVED' 
                                                        ? 'bg-red-500 border-red-600 cursor-help shadow-red-500/50' 
                                                        : 'bg-white/5 border-white/10 cursor-default'}`}
                                            >
                                                <span className="text-[10px] font-medium text-white/50">{seat.seatLabel.replace(rowId, '')}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inspection Panel */}
                    <div className="w-full md:w-80 flex flex-col gap-4">
                        <div className="glass-card p-5">
                            <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2 flex items-center justify-between">
                                Inspector
                                <Users className="h-4 w-4 text-gray-400" />
                            </h3>
                            
                            <AnimatePresence mode="wait">
                                {hoveredSeat ? (
                                    <motion.div
                                        key="hovered"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-red-500/20 text-red-500 px-3 py-1 rounded text-2xl font-black">
                                                {hoveredSeat.seatLabel}
                                            </div>
                                            <span className="text-xs font-semibold px-2 py-1 bg-red-600 text-white rounded">BOOKED</span>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <div>
                                                <label className="text-xs text-gray-400 uppercase tracking-wider">Customer Name</label>
                                                <p className="text-white font-medium flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-blue-400" />
                                                    {hoveredSeat.userName || "Guest Profile"}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 uppercase tracking-wider">Contact</label>
                                                <p className="text-white font-medium flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-green-400" />
                                                    {hoveredSeat.userEmail || "N/A"}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 uppercase tracking-wider bg-">Booking Ref</label>
                                                <p className="text-sm font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 mt-1 inline-flex items-center gap-2">
                                                    <Ticket className="w-3 h-3" />
                                                    {hoveredSeat.bookingReference || "Unknown"}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center py-8 text-gray-500 flex flex-col items-center"
                                    >
                                        <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center mb-3">
                                            <span className="text-xs">G-4</span>
                                        </div>
                                        <p className="text-sm">Hover over any red seat to inspect passenger details</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ShowtimeManifestModal;
