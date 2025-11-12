import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { RecentAppointments } from "@/components/RecentAppointments";

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">Vue d'ensemble de votre cabinet dentaire</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Patients totaux"
          value="248"
          icon={Users}
          trend="+12% ce mois"
          trendUp
          color="primary"
        />
        <StatCard
          title="Rendez-vous aujourd'hui"
          value="8"
          icon={Calendar}
          trend="4 confirmés"
          trendUp
          color="secondary"
        />
        <StatCard
          title="Revenus du mois"
          value="45 280€"
          icon={DollarSign}
          trend="+18% vs mois dernier"
          trendUp
          color="success"
        />
        <StatCard
          title="Taux de satisfaction"
          value="98%"
          icon={TrendingUp}
          trend="+2% ce trimestre"
          trendUp
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentAppointments />
        </div>
        
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <h3 className="text-lg font-semibold mb-2">Rappels importants</h3>
            <p className="text-sm opacity-90 mb-4">
              3 patients nécessitent un rappel pour leur contrôle annuel
            </p>
            <button className="px-4 py-2 bg-background/20 hover:bg-background/30 rounded-lg text-sm font-medium transition-colors">
              Voir les rappels
            </button>
          </div>
          
          <div className="p-6 rounded-xl bg-card border border-border shadow-md">
            <h3 className="text-lg font-semibold mb-4">Stocks faibles</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Amalgames dentaires</span>
                <span className="text-sm font-medium text-warning">12 unités</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Gants latex</span>
                <span className="text-sm font-medium text-warning">45 paires</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Masques chirurgicaux</span>
                <span className="text-sm font-medium text-destructive">8 boîtes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
