import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import AdminUsers from "./pages/AdminUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-gradient-subtle">
    <Sidebar />
    <div className="flex-1 md:ml-64">
      <Header />
      <main className="p-4 md:p-8">
        {children}
      </main>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
    <Route path="/patients" element={<Layout><Patients /></Layout>} />
    <Route path="/appointments" element={<Layout><Appointments /></Layout>} />
    <Route path="/billing" element={<Layout><Billing /></Layout>} />
    <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
    <Route path="/reports" element={<Layout><Reports /></Layout>} />
    <Route path="/settings" element={<Layout><Settings /></Layout>} />
    <Route path="/admin/users" element={<ProtectedRoute><Layout><AdminUsers /></Layout></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
