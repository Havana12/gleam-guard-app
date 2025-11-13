import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Clock, User, Filter } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Appointment {
  id: string;
  patient_id: string;
  dentist_id: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  patient_name?: string;
  dentist_name?: string;
}

interface Patient {
  id: string;
  full_name: string;
}

interface Dentist {
  id: string;
  full_name: string;
}

export default function AppointmentsManagement() {
  const { userProfile, isAdmin } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    patient_id: '',
    dentist_id: '',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '',
    type: 'consultation',
    status: 'scheduled' as const,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch appointments with patient and dentist names
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(full_name),
          user_profiles!appointments_dentist_id_fkey(full_name)
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      const formattedAppointments = appointmentsData?.map((apt: any) => ({
        ...apt,
        patient_name: apt.patients?.full_name,
        dentist_name: apt.user_profiles?.full_name,
      })) || [];

      setAppointments(formattedAppointments);

      // Fetch patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, full_name')
        .order('full_name');

      if (patientsError) throw patientsError;
      setPatients(patientsData || []);

      // Fetch dentists
      const { data: dentistsData, error: dentistsError } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('role', ['admin', 'dentist'])
        .order('full_name');

      if (dentistsError) throw dentistsError;
      setDentists(dentistsData || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAppointment) {
        const { error } = await supabase
          .from('appointments')
          .update(formData)
          .eq('id', editingAppointment.id);

        if (error) throw error;
        toast.success('Rendez-vous mis à jour avec succès');
      } else {
        const { error } = await supabase.from('appointments').insert(formData);

        if (error) throw error;
        toast.success('Rendez-vous créé avec succès');
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;
      toast.success('Rendez-vous supprimé avec succès');
      fetchData();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;
      toast.success('Statut mis à jour');
      fetchData();
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      dentist_id: '',
      appointment_date: format(new Date(), 'yyyy-MM-dd'),
      appointment_time: '',
      type: 'consultation',
      status: 'scheduled',
      notes: '',
    });
    setEditingAppointment(null);
  };

  const openEditDialog = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id,
      dentist_id: appointment.dentist_id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes || '',
    });
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      scheduled: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      completed: 'outline',
    };
    const labels: Record<string, string> = {
      scheduled: 'Planifié',
      confirmed: 'Confirmé',
      cancelled: 'Annulé',
      completed: 'Terminé',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      consultation: 'Consultation',
      cleaning: 'Nettoyage',
      treatment: 'Traitement',
      emergency: 'Urgence',
      followup: 'Suivi',
    };

    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  const filteredAppointments = appointments.filter((apt) => {
    const dateMatch = format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    const typeMatch = filterType === 'all' || apt.type === filterType;
    const statusMatch = filterStatus === 'all' || apt.status === filterStatus;
    return dateMatch && typeMatch && statusMatch;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Rendez-vous</h1>
          <p className="text-gray-600 mt-1">Planifiez et gérez les rendez-vous</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Rendez-vous
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
              </DialogTitle>
              <DialogDescription>
                {editingAppointment
                  ? 'Modifiez les détails du rendez-vous'
                  : 'Créez un nouveau rendez-vous'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_id">Patient *</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, patient_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dentist_id">Dentiste *</Label>
                  <Select
                    value={formData.dentist_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, dentist_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un dentiste" />
                    </SelectTrigger>
                    <SelectContent>
                      {dentists.map((dentist) => (
                        <SelectItem key={dentist.id} value={dentist.id}>
                          {dentist.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment_date">Date *</Label>
                  <Input
                    id="appointment_date"
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, appointment_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment_time">Heure *</Label>
                  <Input
                    id="appointment_time"
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) =>
                      setFormData({ ...formData, appointment_time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
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
                  <Label htmlFor="status">Statut *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Planifié</SelectItem>
                      <SelectItem value="confirmed">Confirmé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingAppointment ? 'Mettre à jour' : 'Créer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Calendrier</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={fr}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="cleaning">Nettoyage</SelectItem>
                <SelectItem value="treatment">Traitement</SelectItem>
                <SelectItem value="emergency">Urgence</SelectItem>
                <SelectItem value="followup">Suivi</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="scheduled">Planifié</SelectItem>
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Rendez-vous du {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Chargement...</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucun rendez-vous pour cette date
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold">
                              {appointment.appointment_time}
                            </span>
                            {getTypeBadge(appointment.type)}
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>Patient: {appointment.patient_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>Dentiste: {appointment.dentist_name}</span>
                            </div>
                            {appointment.notes && (
                              <p className="text-gray-600 mt-2">{appointment.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(appointment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(appointment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
