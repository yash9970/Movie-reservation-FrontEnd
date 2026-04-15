import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Calendar, MapPin, CreditCard, XCircle, Coffee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../api/bookingApi";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { format } from "date-fns";

const MyBookings = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await getMyBookings(user.id);
      setBookings(data);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await cancelBooking(bookingId);
      toast.success("Booking cancelled successfully");
      loadBookings();
    } catch (err) {
      toast.error("Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-400">Manage your movie tickets</p>
      </motion.div>

      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <Ticket className="h-16 w-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">No bookings yet</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold">Movie #{booking.movieId}</h3>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${booking.status === "CONFIRMED"
                          ? "bg-green-600"
                          : booking.status === "CANCELLED"
                            ? "bg-red-600"
                            : "bg-yellow-600"
                        }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      <span>Ref: {booking.bookingReference}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(booking.bookingDateTime), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>Seats: {booking.seatNumbers || booking.numberOfSeats}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-semibold text-red-500">
                        ${booking.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {booking.status === "CONFIRMED" && (
                    <button
                      onClick={() => navigate(`/concessions/${booking.id}`)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-lg transition-colors border border-yellow-500/20 text-sm font-semibold whitespace-nowrap"
                    >
                      <Coffee className="h-4 w-4" />
                      Order Food to Seat
                    </button>
                  )}
                  {booking.status !== "CANCELLED" && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg transition-colors border border-red-500/20 text-sm whitespace-nowrap"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Ticket
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;