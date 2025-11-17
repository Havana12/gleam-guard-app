import { Home, Users, Calendar, FileText, Package, BarChart3, Settings, Shield, LogOut } from "lucide-react";
import { NavLink } from "./NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import React from "react";

const navItems = [
  { icon: Home, label: "Tableau de bord", path: "/dashboard" },
  { icon: Users, label: "Patients", path: "/patients" },
  { icon: Calendar, label: "Rendez-vous", path: "/appointments" },
  { icon: FileText, label: "Facturation", path: "/billing" },
  { icon: Package, label: "Stocks", path: "/inventory" },
  { icon: BarChart3, label: "Rapports", path: "/reports" },
  { icon: Settings, label: "Paramètres", path: "/settings" },
];

const adminItems = [
  { icon: Shield, label: "Gestion utilisateurs", path: "/admin/users" },
];

export const Sidebar = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isAdmin = userProfile?.role === 'admin';

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-sidebar-accent text-sidebar-accent-foreground rounded-full p-2 shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Home className="w-6 h-6" />
      </button>
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-40 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sidebar-foreground">
              Dr. Mohamed JOURANI
            </h1>
            <p className="text-sm text-sidebar-foreground/70 mt-1">Gestion de cabinet</p>
          </div>
          {/* Close button on mobile */}
          <button
            className="md:hidden ml-2 text-sidebar-foreground/60"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              onClick={() => setOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="p-4 border-t border-sidebar-border space-y-3">
            <div className="px-4 py-3 bg-sidebar-accent rounded-lg">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                {isAdmin && userProfile?.full_name ? `Dr. ${userProfile.full_name}` : (userProfile?.full_name || user.email)}
              </p>
              <p className="text-xs text-sidebar-foreground/60 mt-1 capitalize">
                {userProfile?.role || 'Utilisateur'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        )}
      </aside>
      {/* Overlay for mobile sidebar */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};
