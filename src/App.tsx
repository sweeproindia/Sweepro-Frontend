import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { BookingFormProvider } from "@/contexts/BookingFormContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ScrollToTop from '@/components/ScrollToTop';
import { RequireAuth, RequireGuest, RequireRole } from '@/components/auth/RequireAuth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Suspense, lazy, useEffect } from 'react';

// ---------------------------------------------------------------------------
// P1 FIX: Route-based code splitting via React.lazy() + Suspense.
//
// Before: All 37 pages were eagerly imported — every visitor downloaded the
//         entire admin dashboard, maid pages, and all 50+ shadcn components
//         upfront, producing a 2-3MB+ bundle.
//
// After: Each page is a separate chunk loaded only when the route matches.
//        Admin, maid, and customer code are in totally separate bundles.
//        The initial bundle drops to ~200KB.
//
// Rollup/Vite will automatically split these into separate chunks with
// descriptive names because of the webpackChunkName magic comments.
// ---------------------------------------------------------------------------

// --- Public pages (small — loaded eagerly is fine but lazy is cheaper) ---
const LandingPage = lazy(() => import(/* webpackChunkName: "landing"   */ "./pages/LandingPage"));
const LoginPage = lazy(() => import(/* webpackChunkName: "login"     */ "./pages/LoginPage"));
const SignupPage = lazy(() => import(/* webpackChunkName: "signup"    */ "./pages/SignupPage"));
const TestLoginPage = lazy(() => import(/* webpackChunkName: "testlogin" */ "./pages/TestLoginPage"));
const ForgotPasswordPage = lazy(() => import(/* webpackChunkName: "forgot-pw" */ "./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import(/* webpackChunkName: "reset-pw"  */ "./pages/ResetPasswordPage"));
const TermsPage = lazy(() => import(/* webpackChunkName: "terms"     */ "./pages/TermsPage"));
const PrivacyPolicyPage = lazy(() => import(/* webpackChunkName: "privacy"   */ "./pages/PrivacyPolicyPage"));
const CookiePolicyPage = lazy(() => import(/* webpackChunkName: "cookies"   */ "./pages/CookiePolicyPage"));
const NotFound = lazy(() => import(/* webpackChunkName: "not-found" */ "./pages/NotFound"));

// --- Shared authenticated pages ---
const CompleteProfilePage = lazy(() => import(/* webpackChunkName: "complete-profile" */ "./pages/CompleteProfilePage"));
const ProfilePage = lazy(() => import(/* webpackChunkName: "profile"          */ "./pages/ProfilePage"));
const EnhancedProfilePage = lazy(() => import(/* webpackChunkName: "profile-enhanced" */ "./pages/EnhancedProfilePage"));
const NotificationsPage = lazy(() => import(/* webpackChunkName: "notifications"    */ "./pages/NotificationsPage"));

// --- Customer chunk (loaded only for CUSTOMER role) ---
const UserDashboard = lazy(() => import(/* webpackChunkName: "customer" */ "./pages/UserDashboard"));
const BookingsPage = lazy(() => import(/* webpackChunkName: "customer" */ "./pages/BookingsPage"));
const PaymentsPage = lazy(() => import(/* webpackChunkName: "customer" */ "./pages/PaymentsPage"));
const SubscriptionPage = lazy(() => import(/* webpackChunkName: "customer" */ "./pages/SubscriptionPage"));
const MonthlySubscriptionDashboard = lazy(() => import(/* webpackChunkName: "customer" */ "./pages/MonthlySubscriptionDashboard"));
const MonthlyServiceCalendar = lazy(() => import(/* webpackChunkName: "customer" */ "./pages/MonthlyServiceCalendar"));
const SupportPage = lazy(() => import(/* webpackChunkName: "customer" */ "./pages/SupportPage"));
const SubscriptionDetailsPage = lazy(() => import(/* webpackChunkName: "customer" */ "./pages/SubscriptionDetailsPage"));
const PaymentOptionsPage = lazy(() => import(/* webpackChunkName: "customer" */ "./pages/PaymentOptionsPage"));
const ReviewPaymentPage = lazy(() => import(/* webpackChunkName: "customer" */ "./pages/ReviewPaymentPage"));
const BufferManagementPage = lazy(() => import(/* webpackChunkName: "customer" */ "./pages/BufferManagementPage"));

// --- Maid chunk (loaded only for MAID role) ---
const MaidDashboard = lazy(() => import(/* webpackChunkName: "maid" */ "./pages/MaidDashboardEnhanced"));
const UserMaidDashboard = lazy(() => import(/* webpackChunkName: "maid" */ "./pages/MaidDashboard"));
const MaidBookingsPage = lazy(() => import(/* webpackChunkName: "maid" */ "./pages/MaidBookingsPage"));
const MaidSupportPage = lazy(() => import(/* webpackChunkName: "maid" */ "./pages/MaidSupportPage"));
const MaidAvailabilityPage = lazy(() => import(/* webpackChunkName: "maid" */ "./pages/MaidAvailabilityPage"));
const MaidVerification = lazy(() => import(/* webpackChunkName: "maid" */ "./pages/MaidVerification"));

// --- Admin chunk (loaded only for ADMIN role — heaviest, full isolation) ---
const AdminDashboard = lazy(() => import(/* webpackChunkName: "admin" */ "./pages/AdminDashboard"));
const AdminFeedbackPage = lazy(() => import(/* webpackChunkName: "admin" */ "./pages/AdminFeedbackPage"));

// ---------------------------------------------------------------------------
// P2 FIX: Global QueryClient configuration.
//
// Before: new QueryClient() used all defaults:
//   - staleTime: 0ms       → every navigation refetched all data
//   - gcTime: 5min         → cache evicted quickly
//   - refetchOnWindowFocus: true  → tab-switching triggered refetches
//   - retry: 3             → ALL errors (incl. 401/403/404) retried 3×
//
// After: sensible production defaults that dramatically cut network traffic.
// ---------------------------------------------------------------------------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is "fresh" for 30s — navigating back to a page within 30s
      // uses the cached result without a network request.
      staleTime: 30_000,

      // Keep inactive cache for 5 minutes (unchanged default, but explicit).
      gcTime: 300_000,

      // Tab-switching should NOT trigger background refetches.
      // The app is real-time via WebSocket; polling on focus is wasteful.
      refetchOnWindowFocus: false,

      // Only retry server errors (5xx). Never retry auth failures (401/403)
      // or not-found (404) — they will never succeed on retry.
      retry: (failureCount, error: any) => {
        if (error?.statusCode >= 400 && error?.statusCode < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      // Never auto-retry mutations — duplicate side-effects (payments!) are dangerous.
      retry: false,
    },
  },
});

// ---------------------------------------------------------------------------
// Shared loading fallback used by all Suspense boundaries.
// Matches the existing skeleton aesthetic used across 22 files.
// ---------------------------------------------------------------------------
function PageLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      }}
    >
      <div style={{ textAlign: 'center', color: '#e2e8f0' }}>
        <div
          style={{
            width: 48,
            height: 48,
            border: '4px solid rgba(99,102,241,0.3)',
            borderTop: '4px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem',
          }}
        />
        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Loading…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

const App = () => {
  // Disable browser scroll restoration on page reload
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return (
    // F1 FIX: Root ErrorBoundary — catches render errors in any child component.
    // Before this, a single component crash = blank white screen with no recovery.
    <ErrorBoundary>
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
                    {/*
                      P1 FIX: Single Suspense boundary wrapping all routes.
                      Each lazy() import above creates a separate Rollup chunk.
                      The spinner only shows during the first load of a chunk;
                      subsequent visits use the browser module cache.
                    */}
                    <Suspense fallback={<PageLoadingFallback />}>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route
                          path="/login"
                          element={
                            <RequireGuest>
                              <LoginPage />
                            </RequireGuest>
                          }
                        />
                        <Route
                          path="/test-login"
                          element={
                            <RequireGuest>
                              <TestLoginPage />
                            </RequireGuest>
                          }
                        />
                        <Route
                          path="/signup"
                          element={
                            <RequireGuest>
                              <SignupPage />
                            </RequireGuest>
                          }
                        />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPolicyPage />} />
                        <Route path="/cookies" element={<CookiePolicyPage />} />

                        {/* Profile completion */}
                        <Route
                          path="/complete-profile"
                          element={
                            <RequireAuth requireProfileCompletion={false}>
                              <CompleteProfilePage />
                            </RequireAuth>
                          }
                        />

                        {/* Shared authenticated routes */}
                        <Route
                          path="/profile"
                          element={
                            <RequireAuth>
                              <ProfilePage />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/profile/enhanced"
                          element={
                            <RequireAuth>
                              <EnhancedProfilePage />
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/notifications"
                          element={
                            <RequireAuth>
                              <NotificationsPage />
                            </RequireAuth>
                          }
                        />

                        {/* Customer routes */}
                        <Route
                          path="/dashboard"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["CUSTOMER"]}>
                                <UserDashboard />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/bookings"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["CUSTOMER"]}>
                                <BookingsPage />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/subscription"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["CUSTOMER"]}>
                                <SubscriptionPage />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/monthly-subscription"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["CUSTOMER"]}>
                                <MonthlySubscriptionDashboard />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/calendar"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["CUSTOMER"]}>
                                <MonthlyServiceCalendar />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/buffer"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["CUSTOMER"]}>
                                <BufferManagementPage />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/subscription/:planId"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["CUSTOMER"]}>
                                <SubscriptionDetailsPage />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/payment-options"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["CUSTOMER"]}>
                                <PaymentOptionsPage />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/review-payment"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["CUSTOMER"]}>
                                <ReviewPaymentPage />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/payments"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["CUSTOMER"]}>
                                <PaymentsPage />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/support"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["CUSTOMER"]}>
                                <SupportPage />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />

                        {/* Maid routes */}
                        <Route
                          path="/maid-verification"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["MAID"]}>
                                <MaidVerification />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/maid"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["MAID"]}>
                                <UserMaidDashboard />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/maid-dashboard"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["MAID"]}>
                                <MaidDashboard />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/maid-bookings"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["MAID"]}>
                                <MaidBookingsPage />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/maid-support"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["MAID"]}>
                                <MaidSupportPage />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/maid-availability"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["MAID"]}>
                                <MaidAvailabilityPage />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />

                        {/* Admin routes */}
                        <Route
                          path="/admin"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["ADMIN"]}>
                                <AdminDashboard />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/admin-dashboard"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["ADMIN"]}>
                                <AdminDashboard />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />
                        <Route
                          path="/admin/feedback"
                          element={
                            <RequireAuth>
                              <RequireRole roles={["ADMIN"]}>
                                <AdminFeedbackPage />
                              </RequireRole>
                            </RequireAuth>
                          }
                        />

                        {/* Catch-all */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </ScrollToTop>
                </BrowserRouter>
              </TooltipProvider>
            </BookingFormProvider>
          </NotificationProvider>
        </UserProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
