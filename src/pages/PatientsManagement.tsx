import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Edit, Trash2, Search, Filter } from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  address?: string;
  medical_history?: string;
  allergies?: string;
  created_at: string;
  created_by?: string;
}

export default function PatientsManagement() {
  const { userProfile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    medical_history: '',
    allergies: '',
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = patients.filter(
        (patient) =>
          patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.phone.includes(searchQuery)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPatient) {
        const { error } = await supabase
          .from('patients')
          .update(formData)
          .eq('id', editingPatient.id);

        if (error) throw error;
        toast.success('Patient mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('patients')
          .insert({
            ...formData,
            created_by: userProfile?.id,
          });

        if (error) throw error;
        toast.success('Patient créé avec succès');
      }

      setDialogOpen(false);
      resetForm();
      fetchPatients();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (patientId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce patient?')) return;

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) throw error;
      toast.success('Patient supprimé avec succès');
      fetchPatients();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      address: '',
      medical_history: '',
      allergies: '',
    });
    setEditingPatient(null);
  };

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      full_name: patient.full_name,
      email: patient.email,
      phone: patient.phone,
      date_of_birth: patient.date_of_birth || '',
      address: patient.address || '',
      medical_history: patient.medical_history || '',
      allergies: patient.allergies || '',
    });
    setDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Patients</h1>
          <p className="text-gray-600 mt-1">Gérez les dossiers des patients</p>
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
              <UserPlus className="h-4 w-4 mr-2" />
              Nouveau Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? 'Modifier le patient' : 'Nouveau patient'}
              </DialogTitle>
              <DialogDescription>
                {editingPatient
                  ? 'Modifiez les informations du patient'
                  : 'Ajoutez un nouveau patient au système'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nom complet *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date de naissance</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      setFormData({ ...formData, date_of_birth: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medical_history">Antécédents médicaux</Label>
                <Textarea
                  id="medical_history"
                  value={formData.medical_history}
                  onChange={(e) =>
                    setFormData({ ...formData, medical_history: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) =>
                    setFormData({ ...formData, allergies: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingPatient ? 'Mettre à jour' : 'Créer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Date de naissance</TableHead>
              <TableHead>Allergies</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Aucun patient trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.full_name}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>
                    {patient.date_of_birth
                      ? new Date(patient.date_of_birth).toLocaleDateString('fr-FR')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {patient.allergies ? (
                      <Badge variant="destructive">Oui</Badge>
                    ) : (
                      <Badge variant="secondary">Non</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(patient)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(patient.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
