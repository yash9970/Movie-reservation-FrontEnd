import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Copy } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { apiClient } from "../../api/api";
import Button from "../../Components/ui/Button";
import Input from "../../Components/ui/Input";
import LoadingSpinner from "../../Components/ui/LoadingSpinner";
import { createShowtime, updateShowtime } from "../../api/showtimeApi";

const ShowtimeForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token } = useAuth();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [movies, setMovies] = useState([]);
    const [theaters, setTheaters] = useState([]);

    const [formData, setFormData] = useState({
        movieId: "",
        theaterId: "",
        screenNumber: "",
        showDateTime: "",
        status: "SCHEDULED",
    });

    const [showtimeConfig, setShowtimeConfig] = useState(null);

    const [errors, setErrors] = useState({});

    // When Theater or Screen Number changes, pull the Pre-Defined layout from Theater Screens!
    useEffect(() => {
        if (!isEditMode && formData.theaterId && formData.screenNumber) {
            const selectedTheater = theaters.find(t => t.id === Number(formData.theaterId));
            if (selectedTheater && selectedTheater.defaultSeatLayoutConfig) {
                 try {
                     const parsed = JSON.parse(selectedTheater.defaultSeatLayoutConfig);
                     const screenLayout = parsed[formData.screenNumber];
                     if(screenLayout) {
                         setShowtimeConfig(screenLayout);
                     } else {
                         setShowtimeConfig(null);
                     }
                 } catch (e) {
                     console.error("Failed parsing default layout", e);
                     setShowtimeConfig(null);
                 }
            }
        }
    }, [formData.theaterId, formData.screenNumber, theaters, isEditMode]);

    useEffect(() => {
        loadInitialData();
    }, [id]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [moviesData, theatersData] = await Promise.all([
                apiClient('/api/movies', token),
                apiClient('/api/theaters', token),
            ]);

            setMovies(moviesData);
            setTheaters(theatersData);

            if (isEditMode) {
                const showtimeData = await apiClient(`/api/showtimes/${id}`, token);
                const dateTime = new Date(showtimeData.showDateTime);
                setFormData({
                    movieId: showtimeData.movieId,
                    theaterId: showtimeData.theaterId,
                    screenNumber: showtimeData.screenNumber,
                    showDateTime: dateTime.toISOString().slice(0, 16),
                    status: showtimeData.status || "SCHEDULED",
                });
                
                if (showtimeData.seatLayoutConfig) {
                    try {
                        setShowtimeConfig(JSON.parse(showtimeData.seatLayoutConfig));
                    } catch (e) { }
                }
            }
        } catch (error) {
            toast.error("Failed to load data");
            navigate("/admin/showtimes");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.movieId) newErrors.movieId = "Please select a movie";
        if (!formData.theaterId) newErrors.theaterId = "Please select a theater";
        if (!formData.screenNumber || formData.screenNumber < 1) newErrors.screenNumber = "Please select a screen";
        if (!formData.showDateTime) newErrors.showDateTime = "Please select date and time";
        else if (!isEditMode && new Date(formData.showDateTime) <= new Date()) {
            newErrors.showDateTime = "Showtime must be in the future";
        }
        if(!showtimeConfig) newErrors.theaterId = "The selected screen has no configuration. Provide one in Theater Edit first.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        try {
            setSaving(true);
            const showDateTime = new Date(formData.showDateTime).toISOString();

            // Calculate totals dynamically purely for backend sync
            const totalSeats = showtimeConfig?.layout?.reduce((acc, row) => acc + Number(row.seats), 0) || 0;
            const blockedCount = showtimeConfig?.blocked ? Object.keys(showtimeConfig.blocked).length : 0;
            const basePrice = showtimeConfig?.categories?.[0]?.price || 0;

            const payload = {
                movieId: Number(formData.movieId),
                theaterId: Number(formData.theaterId),
                screenNumber: Number(formData.screenNumber),
                showDateTime,
                pricePerSeat: basePrice,
                totalSeats: totalSeats,
                availableSeats: isEditMode ? showtimeConfig.availableSeats || totalSeats - blockedCount : totalSeats - blockedCount,
                status: formData.status,
                seatLayoutConfig: JSON.stringify(showtimeConfig)
            };

            if (isEditMode) {
                await updateShowtime(id, payload, token);
                toast.success("Showtime updated successfully");
            } else {
                await createShowtime(payload, token);
                toast.success("Showtime cloned and created successfully");
            }

            navigate("/admin/showtimes");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save showtime");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner size="lg" message="Loading..." /></div>;

    const selectedTheater = theaters.find(t => t.id === Number(formData.theaterId));

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="secondary" size="sm" onClick={() => navigate("/admin/showtimes")}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-white">{isEditMode ? "Edit Showtime" : "Add New Showtime"}</h1>
                    <p className="text-gray-400 mt-1">{isEditMode ? "Reschedule or update status" : "One-Click clone showtimes from Physical Screens"}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Movie <span className="text-red-500">*</span></label>
                    <select name="movieId" value={formData.movieId} onChange={handleChange} className={`input-field ${errors.movieId ? "border-red-500" : ""}`} required>
                        <option value="">Select a movie</option>
                        {movies.map((movie) => <option key={movie.id} value={movie.id}>{movie.title}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Theater <span className="text-red-500">*</span></label>
                        <select name="theaterId" value={formData.theaterId} onChange={handleChange} className={`input-field ${errors.theaterId ? "border-red-500" : ""}`} required>
                            <option value="">Select a theater</option>
                            {theaters.map((theater) => <option key={theater.id} value={theater.id}>{theater.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Screen <span className="text-red-500">*</span></label>
                        <select name="screenNumber" value={formData.screenNumber} onChange={handleChange} disabled={!formData.theaterId} className={`input-field ${errors.screenNumber ? "border-red-500" : ""}`} required>
                            <option value="">Select a physical screen</option>
                            {selectedTheater && Array.from({ length: selectedTheater.totalScreens }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>Screen {num}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Show Date & Time <span className="text-red-500">*</span></label>
                    <Input type="datetime-local" name="showDateTime" value={formData.showDateTime} onChange={handleChange} error={errors.showDateTime} required />
                </div>

                {formData.theaterId && formData.screenNumber && showtimeConfig && (
                    <div className="mt-4 border border-green-500/30 bg-green-500/5 p-4 rounded-lg flex items-start gap-4 animate-in fade-in zoom-in duration-300">
                         <div className="p-2 bg-green-500/20 rounded-md">
                             <Copy className="h-6 w-6 text-green-400" />
                         </div>
                         <div>
                             <h4 className="text-green-400 font-bold mb-1">Configuration Synced</h4>
                             <p className="text-sm text-gray-300">This showtime will instantly inherit the exact Categories and Row Layout designed for <b>Screen {formData.screenNumber}</b> of this theater.</p>
                             <div className="flex gap-4 mt-3">
                                  <div className="bg-black/30 px-3 py-1.5 rounded text-xs text-white">Capacity: {showtimeConfig.layout.reduce((acc, row) => acc + Number(row.seats), 0)}</div>
                                  <div className="bg-black/30 px-3 py-1.5 rounded text-xs text-white">Tiers: {showtimeConfig.categories.length}</div>
                             </div>
                         </div>
                    </div>
                )}
                
                {formData.theaterId && formData.screenNumber && !showtimeConfig && (
                    <div className="mt-4 border border-red-500/30 bg-red-500/5 p-4 rounded-lg text-red-400 text-sm">
                         Warning: This physical screen does not have a Layout compiled in the Theater Architect yet. Saving this showtime will fail.
                    </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-white/10 mt-6">
                    <Button type="button" variant="secondary" onClick={() => navigate("/admin/showtimes")} disabled={saving} className="flex-1">Cancel</Button>
                    <Button type="submit" disabled={saving || !showtimeConfig} className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700">
                        {saving ? <LoadingSpinner size="sm" /> : <Save size={20} />}
                        {isEditMode ? "Update Showtime" : "Publish Showtime"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ShowtimeForm;
