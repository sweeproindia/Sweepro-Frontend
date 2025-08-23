import { Toaster } from "@/components/ui/toaster"; 
import { Toaster as Sonner } from "@/components/ui/sonner"; // ✅ fix: correct path
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { BookingFormProvider } from "@/contexts/BookingFormContext";

import AdminDashboard from "./pages/AdminDashboard";
import BookingsPage from "./pages/BookingsPage";
import Dashboard from "./pages/UserDashboard";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MaidBookingsPage from "./pages/MaidBookingsPage";
import MaidDashboard from "./pages/MaidDashboard";
import MaidSupportPage from "./pages/MaidSupportPage";
import NotFound from "./pages/NotFound";
import PaymentsPage from "./pages/PaymentsPage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SupportPage from "./pages/SupportPage";
import SubscriptionDetailsPage from "./pages/SubscriptionDetailsPage";
import PaymentOptionsPage from "./pages/PaymentOptionsPage";
import ReviewPaymentPage from "./pages/ReviewPaymentPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <BookingFormProvider>
        <TooltipProvider>
          {/* Global toast components */}
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/maid-dashboard" element={<MaidDashboard />} />
              <Route path="/maid-bookings" element={<MaidBookingsPage />} />
              <Route path="/maid-support" element={<MaidSupportPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/subscription/:planId" element={<SubscriptionDetailsPage />}/>
              <Route path="/payment-options" element={<PaymentOptionsPage/>}/>
              <Route path="/review-payment" element={<ReviewPaymentPage/>}/>
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/support" element={<SupportPage />} />
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </BookingFormProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
