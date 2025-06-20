
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import SeatBooking from "./pages/SeatBooking";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMovies from "./pages/admin/Movies";
import AdminCinemas from "./pages/admin/Cinemas";
import AdminShowtimes from "./pages/admin/Showtimes";
import AdminUsers from "./pages/admin/Users";
import AdminReports from "./pages/admin/Reports";
import { AuthProvider } from "./contexts/AuthContext";
import IndexLayout from "./components/layouts/IndexLayout";
import PaymentResult from "./pages/PaymentResult";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<IndexLayout />}>
              <Route index element={<Index />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route
                path="/booking/:movieId/:showtimeId"
                element={<SeatBooking />}
              />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment/zalo-pay/result" element={<PaymentResult />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/register/verify-email" element={<VerifyEmail />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="movies" element={<AdminMovies />} />
              <Route path="cinemas" element={<AdminCinemas />} />
              <Route path="showtimes" element={<AdminShowtimes />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
