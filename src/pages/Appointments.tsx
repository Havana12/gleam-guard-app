import { Plus, Calendar as CalendarIcon, Clock, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Appointments = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    patient_id: "",
    dentist_id: "",
    appointment_date: "",
    appointment_time: "",
    type: "consultation",
    status: "scheduled",
    notes: "",
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('patients').select('id, full_name').order('full_name');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: dentists = [] } = useQuery({
    queryKey: ['dentists-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('role', ['dentist', 'admin']);
      if (error) throw error;
      return data || [];
    }
  });

  const selectedDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', selectedDate, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patients (full_name),
          user_profiles (full_name)
        `)
        .eq('appointment_date', selectedDate)
        .order('appointment_time');
      
      if (searchTerm) {
        query = query.or(`patients.full_name.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingAppointment) {
        const { error } = await supabase
          .from('appointments')
          .update(data)
          .eq('id', editingAppointment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('appointments').insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['today-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['today-appointments-list'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingAppointment ? "Rendez-vous mis à jour" : "Rendez-vous créé",
        description: "Les informations ont été enregistrées avec succès.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['today-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['today-appointments-list'] });
      toast({
        title: "Rendez-vous supprimé",
        description: "Le rendez-vous a été supprimé avec succès.",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      patient_id: "",
      dentist_id: "",
      appointment_date: "",
      appointment_time: "",
      type: "consultation",
      status: "scheduled",
      notes: "",
    });
    setEditingAppointment(null);
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id || "",
      dentist_id: appointment.dentist_id || "",
      appointment_date: appointment.appointment_date || "",
      appointment_time: appointment.appointment_time || "",
      type: appointment.type || "consultation",
      status: appointment.status || "scheduled",
      notes: appointment.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-success/10 text-success border-success/20";
      case "scheduled": return "bg-warning/10 text-warning border-warning/20";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      case "completed": return "bg-muted text-muted-foreground border-border";
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
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau rendez-vous
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAppointment ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient *</Label>
                  <Select required value={formData.patient_id} onValueChange={(value) => setFormData({ ...formData, patient_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dentiste *</Label>
                  <Select required value={formData.dentist_id} onValueChange={(value) => setFormData({ ...formData, dentist_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un dentiste" />
                    </SelectTrigger>
                    <SelectContent>
                      {dentists.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.full_name || d.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heure *</Label>
                  <Input
                    type="time"
                    required
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="cleaning">Nettoyage</SelectItem>
                      <SelectItem value="treatment">Traitement</SelectItem>
                      <SelectItem value="emergency">Urgence</SelectItem>
                      <SelectItem value="followup">Suivi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Statut *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Programmé</SelectItem>
                      <SelectItem value="confirmed">Confirmé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {date?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
            <div className="relative flex-1 max-w-xs ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Chargement...</p>
            ) : appointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm ? "Aucun rendez-vous trouvé" : "Aucun rendez-vous pour cette date"}
              </p>
            ) : (
              appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 text-muted-foreground min-w-[80px]">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{apt.appointment_time?.substring(0, 5)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{apt.patients?.full_name || 'Patient inconnu'}</p>
                      <p className="text-sm text-muted-foreground">{typeTranslations[apt.type] || apt.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(apt.status)} variant="outline">
                      {statusTranslations[apt.status] || apt.status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(apt)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ?")) {
                          deleteMutation.mutate(apt.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
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
