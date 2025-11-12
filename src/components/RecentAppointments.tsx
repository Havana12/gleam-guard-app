import { Calendar, Clock } from "lucide-react";
import { Card } from "./ui/card";

const appointments = [
  {
    id: 1,
    patient: "Marie Dupont",
    time: "09:00",
    type: "Consultation",
    status: "confirmed",
  },
  {
    id: 2,
    patient: "Pierre Martin",
    time: "10:30",
    type: "Nettoyage",
    status: "confirmed",
  },
  {
    id: 3,
    patient: "Sophie Bernard",
    time: "14:00",
    type: "Chirurgie",
    status: "pending",
  },
  {
    id: 4,
    patient: "Jean Lefebvre",
    time: "15:30",
    type: "Consultation",
    status: "confirmed",
  },
];

export const RecentAppointments = () => {
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
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">{appointment.patient}</p>
              <p className="text-sm text-muted-foreground mt-1">{appointment.type}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {appointment.time}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  appointment.status === "confirmed"
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {appointment.status === "confirmed" ? "Confirmé" : "En attente"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
