import { Home, Users, Calendar, FileText, Package, BarChart3, Settings } from "lucide-react";
import { NavLink } from "./NavLink";

const navItems = [
  { icon: Home, label: "Tableau de bord", path: "/" },
  { icon: Users, label: "Patients", path: "/patients" },
  { icon: Calendar, label: "Rendez-vous", path: "/appointments" },
  { icon: FileText, label: "Facturation", path: "/billing" },
  { icon: Package, label: "Stocks", path: "/inventory" },
  { icon: BarChart3, label: "Rapports", path: "/reports" },
  { icon: Settings, label: "Paramètres", path: "/settings" },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-sidebar-foreground">
          DentalCare
        </h1>
        <p className="text-sm text-sidebar-foreground/70 mt-1">Gestion de cabinet</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="px-4 py-3 bg-sidebar-accent rounded-lg">
          <p className="text-sm font-medium text-sidebar-accent-foreground">Dr. Martin Dubois</p>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Administrateur</p>
        </div>
      </div>
    </aside>
  );
};
