import { Plus, Search, Download, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_id: "",
    amount: 0,
    status: "pending",
    payment_method: "",
    description: "",
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: "",
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients-for-billing'],
    queryFn: async () => {
      const { data, error } = await supabase.from('patients').select('id, full_name').order('full_name');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          patients (full_name)
        `)
        .order('invoice_date', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['invoice-stats'],
    queryFn: async () => {
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      
      const { data: allInvoices, error } = await supabase
        .from('invoices')
        .select('amount, status')
        .gte('invoice_date', firstDayOfMonth);
      
      if (error) throw error;
      
      const total = allInvoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
      const paid = allInvoices?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
      const pending = allInvoices?.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
      
      return { total, paid, pending };
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const cleanedData = {
        ...data,
        appointment_id: data.appointment_id || null,
        payment_method: data.payment_method || null,
      };
      
      if (editingInvoice) {
        const { error } = await supabase
          .from('invoices')
          .update(cleanedData)
          .eq('id', editingInvoice.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('invoices').insert([cleanedData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      queryClient.invalidateQueries({ queryKey: ['month-revenue'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingInvoice ? "Facture mise à jour" : "Facture créée",
        description: "Les informations ont été enregistrées avec succès.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      queryClient.invalidateQueries({ queryKey: ['month-revenue'] });
      toast({
        title: "Facture supprimée",
        description: "La facture a été supprimée avec succès.",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      patient_id: "",
      appointment_id: "",
      amount: 0,
      status: "pending",
      payment_method: "",
      description: "",
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: "",
    });
    setEditingInvoice(null);
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setFormData({
      patient_id: invoice.patient_id || "",
      appointment_id: invoice.appointment_id || "",
      amount: invoice.amount || 0,
      status: invoice.status || "pending",
      payment_method: invoice.payment_method || "",
      description: invoice.description || "",
      invoice_date: invoice.invoice_date || new Date().toISOString().split('T')[0],
      due_date: invoice.due_date || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-success/10 text-success border-success/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted";
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    !searchTerm || 
    inv.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Facturation</h1>
          <p className="text-muted-foreground mt-2">Gérez vos factures et paiements</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle facture
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingInvoice ? "Modifier la facture" : "Nouvelle facture"}</DialogTitle>
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
                  <Label>Montant *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de facture *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date d'échéance *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Statut *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="paid">Payée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Méthode de paiement</Label>
                  <Input
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    placeholder="CB, Espèces, Chèque..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total facturé ce mois</p>
          <p className="text-3xl font-bold text-foreground mt-2">{stats?.total.toLocaleString('fr-FR')} DH</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Paiements reçus</p>
          <p className="text-3xl font-bold text-success mt-2">{stats?.paid.toLocaleString('fr-FR')} DH</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">En attente</p>
          <p className="text-3xl font-bold text-warning mt-2">{stats?.pending.toLocaleString('fr-FR')} DH</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Factures récentes</h2>
          <div className="relative flex-1 max-w-xs ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une facture..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Chargement...</p>
        ) : filteredInvoices.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {searchTerm ? "Aucune facture trouvée" : "Aucune facture"}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.patients?.full_name || 'Patient inconnu'}</TableCell>
                  <TableCell>{new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="max-w-xs truncate">{invoice.description}</TableCell>
                  <TableCell className="font-semibold">{Number(invoice.amount).toLocaleString('fr-FR')} DH</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)} variant="outline">
                      {invoice.status === "paid" && "Payée"}
                      {invoice.status === "pending" && "En attente"}
                      {invoice.status === "cancelled" && "Annulée"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(invoice)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
                            deleteMutation.mutate(invoice.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default Billing;
