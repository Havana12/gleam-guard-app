import { Download, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = () => {
  // Revenue queries
  const { data: monthRevenue = 0 } = useQuery({
    queryKey: ['reports-month-revenue'],
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

  const { data: lastMonthRevenue = 0 } = useQuery({
    queryKey: ['reports-last-month-revenue'],
    queryFn: async () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const firstDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'paid')
        .gte('invoice_date', firstDay)
        .lte('invoice_date', lastDay);
      if (error) throw error;
      return data?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
    }
  });

  const { data: quarterRevenue = 0 } = useQuery({
    queryKey: ['reports-quarter-revenue'],
    queryFn: async () => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const firstDay = threeMonthsAgo.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'paid')
        .gte('invoice_date', firstDay);
      if (error) throw error;
      return data?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
    }
  });

  const { data: yearRevenue = 0 } = useQuery({
    queryKey: ['reports-year-revenue'],
    queryFn: async () => {
      const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'paid')
        .gte('invoice_date', firstDayOfYear);
      if (error) throw error;
      return data?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
    }
  });

  // Appointments queries
  const { data: appointmentsStats } = useQuery({
    queryKey: ['reports-appointments-stats'],
    queryFn: async () => {
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('appointments')
        .select('type')
        .gte('appointment_date', firstDayOfMonth);
      if (error) throw error;
      
      const total = data?.length || 0;
      const consultation = data?.filter(a => a.type === 'consultation').length || 0;
      const treatment = data?.filter(a => a.type === 'treatment').length || 0;
      const emergency = data?.filter(a => a.type === 'emergency').length || 0;
      
      return { total, consultation, treatment, emergency };
    }
  });

  // Patients queries
  const { data: patientsStats } = useQuery({
    queryKey: ['reports-patients-stats'],
    queryFn: async () => {
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      
      const { count: total, error: totalError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      if (totalError) throw totalError;
      
      const { count: newThisMonth, error: newError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth);
      if (newError) throw newError;
      
      // Active patients = those with appointments in the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const { data: activeData, error: activeError } = await supabase
        .from('appointments')
        .select('patient_id')
        .gte('appointment_date', sixMonthsAgo.toISOString().split('T')[0]);
      if (activeError) throw activeError;
      
      const activePatients = new Set(activeData?.map(a => a.patient_id)).size;
      
      return { total: total || 0, newThisMonth: newThisMonth || 0, active: activePatients };
    }
  });

  // Monthly revenue data for chart (last 6 months)
  const { data: monthlyRevenueData = [] } = useQuery({
    queryKey: ['reports-monthly-revenue-chart'],
    queryFn: async () => {
      const data = [];
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
        
        const { data: invoices, error } = await supabase
          .from('invoices')
          .select('amount')
          .eq('status', 'paid')
          .gte('invoice_date', firstDay)
          .lte('invoice_date', lastDay);
        
        if (error) throw error;
        
        const total = invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
        data.push({
          month: monthNames[date.getMonth()],
          revenue: total
        });
      }
      
      return data;
    }
  });

  // Appointment types data for pie chart
  const { data: appointmentTypesData = [] } = useQuery({
    queryKey: ['reports-appointment-types-chart'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('type');
      
      if (error) throw error;
      
      const types = data?.reduce((acc: any, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {});
      
      const typeLabels: any = {
        consultation: 'Consultation',
        cleaning: 'Nettoyage',
        treatment: 'Traitement',
        emergency: 'Urgence',
        followup: 'Suivi'
      };
      
      return Object.entries(types || {}).map(([key, value]) => ({
        name: typeLabels[key] || key,
        value: value as number
      }));
    }
  });

  const monthRevenueChange = lastMonthRevenue > 0 
    ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) 
    : 0;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rapports</h1>
          <p className="text-muted-foreground mt-2">Analysez les performances de votre cabinet</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-success" />
                <p className="text-sm text-muted-foreground">Ce mois</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{monthRevenue.toLocaleString('fr-FR')} DH</p>
              <p className={`text-sm mt-2 ${monthRevenueChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {monthRevenueChange >= 0 ? '+' : ''}{monthRevenueChange}% vs mois dernier
              </p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">Ce trimestre</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{quarterRevenue.toLocaleString('fr-FR')} DH</p>
              <p className="text-sm text-muted-foreground mt-2">3 derniers mois</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">Cette année</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{yearRevenue.toLocaleString('fr-FR')} DH</p>
              <p className="text-sm text-muted-foreground mt-2">Année en cours</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Évolution des revenus (6 derniers mois)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString('fr-FR')} DH`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenus" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Total ce mois</p>
              <p className="text-3xl font-bold text-foreground mt-2">{appointmentsStats?.total || 0}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Consultations</p>
              <p className="text-3xl font-bold text-primary mt-2">{appointmentsStats?.consultation || 0}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Traitements</p>
              <p className="text-3xl font-bold text-secondary mt-2">{appointmentsStats?.treatment || 0}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Urgences</p>
              <p className="text-3xl font-bold text-destructive mt-2">{appointmentsStats?.emergency || 0}</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Répartition par type de rendez-vous</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Total patients</p>
              <p className="text-3xl font-bold text-foreground mt-2">{patientsStats?.total || 0}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Nouveaux ce mois</p>
              <p className="text-3xl font-bold text-success mt-2">{patientsStats?.newThisMonth || 0}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Patients actifs</p>
              <p className="text-3xl font-bold text-primary mt-2">{patientsStats?.active || 0}</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
