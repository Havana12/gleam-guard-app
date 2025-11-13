import { Plus, Search, Edit, Trash2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
    medical_history: "",
    allergies: "",
  });

  // Fetch patients
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', searchTerm],
    queryFn: async () => {
      let query = supabase.from('patients').select('*').order('created_at', { ascending: false });
      
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingPatient) {
        const { error } = await supabase
          .from('patients')
          .update(data)
          .eq('id', editingPatient.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('patients').insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingPatient ? "Patient mis à jour" : "Patient créé",
        description: editingPatient ? "Les informations du patient ont été mises à jour." : "Le nouveau patient a été ajouté avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Patient supprimé",
        description: "Le patient a été supprimé avec succès.",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      address: "",
      medical_history: "",
      allergies: "",
    });
    setEditingPatient(null);
  };

  const handleEdit = (patient: any) => {
    setEditingPatient(patient);
    setFormData({
      full_name: patient.full_name || "",
      email: patient.email || "",
      phone: patient.phone || "",
      date_of_birth: patient.date_of_birth || "",
      address: patient.address || "",
      medical_history: patient.medical_history || "",
      allergies: patient.allergies || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-2">Gérez vos dossiers patients</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPatient ? "Modifier le patient" : "Nouveau patient"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom complet *</Label>
                  <Input
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone *</Label>
                  <Input
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date de naissance</Label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Historique médical</Label>
                <Textarea
                  value={formData.medical_history}
                  onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Allergies</Label>
                <Textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  rows={2}
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

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un patient..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement...</div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchTerm ? "Aucun patient trouvé" : "Aucun patient enregistré"}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {patients.map((patient) => (
              <div key={patient.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{patient.full_name}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {patient.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {patient.phone}
                      </span>
                    </div>
                    {patient.date_of_birth && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Né(e) le {new Date(patient.date_of_birth).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(patient)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) {
                          deleteMutation.mutate(patient.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;
