import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { RecentAppointments } from "@/components/RecentAppointments";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  // Fetch total patients
  const { data: patientsCount = 0 } = useQuery({
    queryKey: ['patients-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch today's appointments
  const { data: todayAppointments = [] } = useQuery({
    queryKey: ['today-appointments'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', today);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch current month revenue
  const { data: monthRevenue = 0 } = useQuery({
    queryKey: ['month-revenue'],
    queryFn: async () => {
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'paid')
        .gte('invoice_date', firstDayOfMonth);
      if (error) throw error;
      return data?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
    }
  });

  // Fetch low stock items
  const { data: lowStockItems = [] } = useQuery({
    queryKey: ['low-stock-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .lt('quantity', supabase.raw('min_quantity'))
        .limit(3);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch patients needing annual checkup reminders (last appointment > 11 months ago)
  const { data: patientsNeedingReminders = [] } = useQuery({
    queryKey: ['patients-needing-reminders'],
    queryFn: async () => {
      const elevenMonthsAgo = new Date();
      elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);
      const dateThreshold = elevenMonthsAgo.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select('patient_id, patients(full_name), appointment_date')
        .eq('status', 'completed')
        .lt('appointment_date', dateThreshold)
        .order('appointment_date', { ascending: true });
      
      if (error) throw error;
      
      // Get unique patients (in case they have multiple old appointments)
      const uniquePatients = data?.reduce((acc: any[], curr) => {
        if (!acc.find(p => p.patient_id === curr.patient_id)) {
          acc.push(curr);
        }
        return acc;
      }, []) || [];
      
      return uniquePatients;
    }
  });

  const confirmedCount = todayAppointments.filter(apt => apt.status === 'confirmed').length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">Vue d'ensemble de votre cabinet dentaire</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Patients totaux"
          value={patientsCount.toString()}
          icon={Users}
          trend="+12% ce mois"
          trendUp
          color="primary"
        />
        <StatCard
          title="Rendez-vous aujourd'hui"
          value={todayAppointments.length.toString()}
          icon={Calendar}
          trend={`${confirmedCount} confirmés`}
          trendUp
          color="secondary"
        />
        <StatCard
          title="Revenus du mois"
          value={`${monthRevenue.toLocaleString('fr-FR')} DH`}
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
              {patientsNeedingReminders.length > 0 
                ? `${patientsNeedingReminders.length} patient${patientsNeedingReminders.length > 1 ? 's' : ''} nécessite${patientsNeedingReminders.length > 1 ? 'nt' : ''} un rappel pour leur contrôle annuel`
                : 'Aucun rappel en attente'}
            </p>
            {patientsNeedingReminders.length > 0 && (
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {patientsNeedingReminders.slice(0, 5).map((reminder: any) => (
                  <div key={reminder.patient_id} className="text-xs bg-background/20 p-2 rounded">
                    <span className="font-medium">{reminder.patients?.full_name}</span>
                    <span className="opacity-75 ml-2">
                      (Dernier RDV: {new Date(reminder.appointment_date).toLocaleDateString('fr-FR')})
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button className="px-4 py-2 bg-background/20 hover:bg-background/30 rounded-lg text-sm font-medium transition-colors">
              Voir les rappels
            </button>
          </div>
          
          <div className="p-6 rounded-xl bg-card border border-border shadow-md">
            <h3 className="text-lg font-semibold mb-4">Stocks faibles</h3>
            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-sm text-foreground">{item.name}</span>
                    <span className={`text-sm font-medium ${item.quantity < 5 ? 'text-destructive' : 'text-warning'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Tous les stocks sont au niveau optimal</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
