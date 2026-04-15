import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./auth/ProtectedRoute";
import Layout from "./Components/Layout";
import LoadingSpinner from "./Components/ui/LoadingSpinner";
import { TOAST_POSITION } from "./config/constants";

// Lazy load pages for better performance
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Movies = lazy(() => import("./pages/Movies"));
const MovieDetail = lazy(() => import("./pages/MovieDetails"));
const Booking = lazy(() => import("./pages/Booking"));
const Concessions = lazy(() => import("./pages/Concessions"));
const Payment = lazy(() => import("./pages/Payment"));
const TicketPass = lazy(() => import("./pages/TicketPass"));
const MyBookings = lazy(() => import("./pages/MyBookings"));

// Box Office (Admin/Manager)
const BoxOfficeManager = lazy(() => import("./pages/admin/BoxOfficeManager"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageMovies = lazy(() => import("./pages/admin/ManageMovies"));
const MovieForm = lazy(() => import("./pages/admin/MovieForm"));
const ManageTheaters = lazy(() => import("./pages/admin/ManageTheaters"));
const TheaterForm = lazy(() => import("./pages/admin/TheaterForm"));
const ManageShowtimes = lazy(() => import("./pages/admin/ManageShowtimes"));
const ShowtimeForm = lazy(() => import("./pages/admin/ShowtimeForm"));
const AdminSetup = lazy(() => import("./pages/admin/AdminSetup"));

// Theater Owner pages
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));

// Theater Manager pages
const ManagerDashboard = lazy(() => import("./pages/ManagerDashboard"));

// User Profile
const UserProfile = lazy(() => import("./pages/UserProfile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" message="Loading..." />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position={TOAST_POSITION}
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
          success: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'THEATER_OWNER']}>
                <Layout>
                  <OwnerDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'THEATER_OWNER', 'THEATER_MANAGER']}>
                <Layout>
                  <ManagerDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/movies"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <ManageMovies />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/movies/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <MovieForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/movies/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <MovieForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/theaters"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'THEATER_OWNER']}>
                <Layout>
                  <ManageTheaters />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/theaters/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'THEATER_OWNER']}>
                <Layout>
                  <TheaterForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/theaters/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'THEATER_OWNER']}>
                <Layout>
                  <TheaterForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/showtimes"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'THEATER_OWNER']}>
                <Layout>
                  <ManageShowtimes />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/showtimes/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'THEATER_OWNER']}>
                <Layout>
                  <ShowtimeForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/showtimes/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'THEATER_OWNER']}>
                <Layout>
                  <ShowtimeForm />
                </Layout>
              </ProtectedRoute>
            }
          />



          <Route
            path="/admin/setup"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <AdminSetup />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/box-office"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'THEATER_OWNER', 'THEATER_MANAGER']}>
                <Layout>
                  <BoxOfficeManager />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* User Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserProfile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditProfile />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Customer Routes */}
          <Route
            path="/movies"
            element={
              <ProtectedRoute>
                <Layout>
                  <Movies />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/movies/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <MovieDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/booking/:showtimeId"
            element={
              <ProtectedRoute>
                <Layout>
                  <Booking />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/concessions/:bookingId"
            element={
              <ProtectedRoute>
                <Layout>
                  <Concessions />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment/:bookingId"
            element={
              <ProtectedRoute>
                <Layout>
                  <Payment />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ticket/:bookingId"
            element={
              <ProtectedRoute>
                <Layout>
                  <TicketPass />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyBookings />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;