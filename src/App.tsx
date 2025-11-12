import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-gradient-subtle">
    <Sidebar />
    <div className="flex-1 ml-64">
      <Header />
      <main className="p-8">
        {children}
      </main>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/patients" element={<Layout><Patients /></Layout>} />
          <Route path="/appointments" element={<Layout><div className="text-center p-8">Rendez-vous à venir...</div></Layout>} />
          <Route path="/billing" element={<Layout><div className="text-center p-8">Facturation à venir...</div></Layout>} />
          <Route path="/inventory" element={<Layout><div className="text-center p-8">Gestion des stocks à venir...</div></Layout>} />
          <Route path="/reports" element={<Layout><div className="text-center p-8">Rapports à venir...</div></Layout>} />
          <Route path="/settings" element={<Layout><div className="text-center p-8">Paramètres à venir...</div></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
