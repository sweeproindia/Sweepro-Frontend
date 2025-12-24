import { Toaster } from "@/components/ui/toaster"; 
import { Toaster as Sonner } from "@/components/ui/sonner"; // fix: correct path
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { BookingFormProvider } from "@/contexts/BookingFormContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ScrollToTop from '@/components/ScrollToTop';

import AdminDashboard from "./pages/AdminDashboard";
import BookingsPage from "./pages/BookingsPage";
import UserDashboard from "./pages/UserDashboard";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import TestLoginPage from "./pages/TestLoginPage";
import MaidBookingsPage from "./pages/MaidBookingsPage";
import MaidDashboard from "./pages/MaidDashboardEnhanced";
import MaidSupportPage from "./pages/MaidSupportPage";
import MaidAvailabilityPage from "./pages/MaidAvailabilityPage";
import NotFound from "./pages/NotFound";
import PaymentsPage from "./pages/PaymentsPage";
import ProfilePage from "./pages/ProfilePage";
import EnhancedProfilePage from "./pages/EnhancedProfilePage";
import SignupPage from "./pages/SignupPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import MonthlySubscriptionDashboard from "./pages/MonthlySubscriptionDashboard";
import MonthlyServiceCalendar from "./pages/MonthlyServiceCalendar";
import SupportPage from "./pages/SupportPage";
import SubscriptionDetailsPage from "./pages/SubscriptionDetailsPage";
import PaymentOptionsPage from "./pages/PaymentOptionsPage";
import ReviewPaymentPage from "./pages/ReviewPaymentPage";
import MaidVerification from "./pages/MaidVerification";
import UserMaidDashboard from "./pages/MaidDashboard";
import NotificationsPage from "./pages/NotificationsPage";
import BufferManagementPage from "./pages/BufferManagementPage";
import AdminFeedbackPage from "./pages/AdminFeedbackPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <NotificationProvider>
        <BookingFormProvider>
          <TooltipProvider>
            {/* Global toast components */}
            <Sonner />
            <BrowserRouter>
            <ScrollToTop>
              <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/test-login" element={<TestLoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/maid-verification" element={<MaidVerification />} />
                  <Route path="/maid" element={<UserMaidDashboard />} />
                  <Route path="/maid-dashboard" element={<MaidDashboard />} />
                  <Route path="/maid-bookings" element={<MaidBookingsPage />} />
                  <Route path="/maid-support" element={<MaidSupportPage />} />
                  <Route path="/maid-availability" element={<MaidAvailabilityPage />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/enhanced" element={<EnhancedProfilePage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/subscription" element={<SubscriptionPage />} />
                  <Route path="/monthly-subscription" element={<MonthlySubscriptionDashboard />} />
                  <Route path="/calendar" element={<MonthlyServiceCalendar />} />
                  <Route path="/buffer" element={<BufferManagementPage />} />
                  <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
                  <Route path="/subscription/:planId" element={<SubscriptionDetailsPage />}  />
                  <Route path="/payment-options" element={<PaymentOptionsPage />} />
                  <Route path="/review-payment" element={<ReviewPaymentPage />} />
                  <Route path="/payments" element={<PaymentsPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
            </ScrollToTop>
          </BrowserRouter>
        </TooltipProvider>
      </BookingFormProvider>
      </NotificationProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
