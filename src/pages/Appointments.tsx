import { Plus, Calendar as CalendarIcon, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

const appointments = [
  { id: 1, patient: "Marie Dubois", time: "09:00", type: "Consultation", status: "confirmed" },
  { id: 2, patient: "Jean Martin", time: "10:30", type: "Nettoyage", status: "confirmed" },
  { id: 3, patient: "Sophie Bernard", time: "14:00", type: "Traitement canal", status: "pending" },
  { id: 4, patient: "Luc Petit", time: "15:30", type: "Consultation", status: "confirmed" },
  { id: 5, patient: "Emma Laurent", time: "16:45", type: "Urgence", status: "urgent" },
];

const Appointments = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-success/10 text-success border-success/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "urgent": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rendez-vous</h1>
          <p className="text-muted-foreground mt-2">Gérez votre calendrier de rendez-vous</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau rendez-vous
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Aujourd'hui</h2>
            <div className="relative flex-1 max-w-xs ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-10" />
            </div>
          </div>

          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground min-w-[80px]">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{apt.time}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{apt.patient}</p>
                    <p className="text-sm text-muted-foreground">{apt.type}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(apt.status)} variant="outline">
                  {apt.status === "confirmed" && "Confirmé"}
                  {apt.status === "pending" && "En attente"}
                  {apt.status === "urgent" && "Urgent"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Calendrier</h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </Card>
      </div>
    </div>
  );
};

export default Appointments;
