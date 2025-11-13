import { Calendar, Clock } from "lucide-react";
import { Card } from "./ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const typeTranslations: Record<string, string> = {
  consultation: "Consultation",
  cleaning: "Nettoyage",
  treatment: "Traitement",
  emergency: "Urgence",
  followup: "Suivi",
};

const statusTranslations: Record<string, string> = {
  scheduled: "Programmé",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  completed: "Terminé",
};

export const RecentAppointments = () => {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['today-appointments-list'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (full_name)
        `)
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true })
        .limit(4);
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Rendez-vous du jour
        </h3>
        <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString('fr-FR')}</span>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Chargement...</p>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aucun rendez-vous aujourd'hui</p>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{appointment.patients?.full_name || 'Patient inconnu'}</p>
                <p className="text-sm text-muted-foreground mt-1">{typeTranslations[appointment.type] || appointment.type}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {appointment.appointment_time?.substring(0, 5)}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === "confirmed"
                      ? "bg-success/10 text-success"
                      : appointment.status === "cancelled"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {statusTranslations[appointment.status] || appointment.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
