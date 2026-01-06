import { Toaster } from "@/components/ui/toaster"; 
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { BookingFormProvider } from "@/contexts/BookingFormContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ScrollToTop from '@/components/ScrollToTop';
import { RequireAuth, RequireRole } from '@/components/auth/RequireAuth';

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
import CompleteProfilePage from "./pages/CompleteProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <NotificationProvider>
        <BookingFormProvider>
          <TooltipProvider>
            {/* Global toast components */}
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <ScrollToTop>
              <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/test-login" element={<TestLoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  
                  {/* Profile completion (accessible when authenticated but profile not completed) */}
                  <Route path="/complete-profile" element={
                    <RequireAuth requireProfileCompletion={false}>
                      <CompleteProfilePage />
                    </RequireAuth>
                  } />
                  
                  {/* Protected routes - require authentication and profile completion */}
                  <Route path="/dashboard" element={
                    <RequireAuth>
                      <RequireRole roles={['CUSTOMER']}>
                        <UserDashboard />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/bookings" element={
                    <RequireAuth>
                      <RequireRole roles={['CUSTOMER']}>
                        <BookingsPage />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/subscription" element={
                    <RequireAuth>
                      <RequireRole roles={['CUSTOMER']}>
                        <SubscriptionPage />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/monthly-subscription" element={
                    <RequireAuth>
                      <RequireRole roles={['CUSTOMER']}>
                        <MonthlySubscriptionDashboard />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/calendar" element={
                    <RequireAuth>
                      <RequireRole roles={['CUSTOMER']}>
                        <MonthlyServiceCalendar />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/buffer" element={
                    <RequireAuth>
                      <RequireRole roles={['CUSTOMER']}>
                        <BufferManagementPage />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/subscription/:planId" element={
                    <RequireAuth>
                      <RequireRole roles={['CUSTOMER']}>
                        <SubscriptionDetailsPage />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/payment-options" element={
                    <RequireAuth>
                      <RequireRole roles={['CUSTOMER']}>
                        <PaymentOptionsPage />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/review-payment" element={
                    <RequireAuth>
                      <RequireRole roles={['CUSTOMER']}>
                        <ReviewPaymentPage />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/payments" element={
                    <RequireAuth>
                      <RequireRole roles={['CUSTOMER']}>
                        <PaymentsPage />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/support" element={
                    <RequireAuth>
                      <RequireRole roles={['CUSTOMER']}>
                        <SupportPage />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/profile" element={
                    <RequireAuth>
                      <ProfilePage />
                    </RequireAuth>
                  } />
                  <Route path="/profile/enhanced" element={
                    <RequireAuth>
                      <EnhancedProfilePage />
                    </RequireAuth>
                  } />
                  <Route path="/notifications" element={
                    <RequireAuth>
                      <NotificationsPage />
                    </RequireAuth>
                  } />
                  
                  {/* Maid routes */}
                  <Route path="/maid-verification" element={
                    <RequireAuth>
                      <RequireRole roles={['MAID']}>
                        <MaidVerification />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/maid" element={
                    <RequireAuth>
                      <RequireRole roles={['MAID']}>
                        <UserMaidDashboard />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/maid-dashboard" element={
                    <RequireAuth>
                      <RequireRole roles={['MAID']}>
                        <MaidDashboard />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/maid-bookings" element={
                    <RequireAuth>
                      <RequireRole roles={['MAID']}>
                        <MaidBookingsPage />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/maid-support" element={
                    <RequireAuth>
                      <RequireRole roles={['MAID']}>
                        <MaidSupportPage />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/maid-availability" element={
                    <RequireAuth>
                      <RequireRole roles={['MAID']}>
                        <MaidAvailabilityPage />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={
                    <RequireAuth>
                      <RequireRole roles={['ADMIN']}>
                        <AdminDashboard />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/admin-dashboard" element={
                    <RequireAuth>
                      <RequireRole roles={['ADMIN']}>
                        <AdminDashboard />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  <Route path="/admin/feedback" element={
                    <RequireAuth>
                      <RequireRole roles={['ADMIN']}>
                        <AdminFeedbackPage />
                      </RequireRole>
                    </RequireAuth>
                  } />
                  
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
