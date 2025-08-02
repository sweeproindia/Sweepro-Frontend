import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import BookingsPage from "./pages/BookingsPage";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MaidDashboard from "./pages/MaidDashboard";
import NotFound from "./pages/NotFound";
import PaymentsPage from "./pages/PaymentsPage";
import SignupPage from "./pages/SignupPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SupportPage from "./pages/SupportPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/maid-dashboard" element={<MaidDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/support" element={<SupportPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
