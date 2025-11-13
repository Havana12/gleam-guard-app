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
import { Plus, Edit, Trash2, DollarSign, FileText, Download, TrendingUp } from 'lucide-react';

interface Invoice {
  id: string;
  patient_id: string;
  appointment_id?: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  payment_method?: string;
  description: string;
  invoice_date: string;
  due_date: string;
  patient_name?: string;
}

interface Patient {
  id: string;
  full_name: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  type: string;
}

export default function BillingManagement() {
  const { userProfile, isAdmin } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    amount: 0,
    status: 'pending' as const,
    payment_method: 'cash',
    description: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch invoices with patient names
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          patients(full_name)
        `)
        .order('invoice_date', { ascending: false });

      if (invoicesError) throw invoicesError;

      const formattedInvoices = invoicesData?.map((inv: any) => ({
        ...inv,
        patient_name: inv.patients?.full_name,
      })) || [];

      setInvoices(formattedInvoices);

      // Fetch patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, full_name')
        .order('full_name');

      if (patientsError) throw patientsError;
      setPatients(patientsData || []);

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, patient_id, appointment_date, type')
        .order('appointment_date', { ascending: false });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const invoiceData = {
        ...formData,
        appointment_id: formData.appointment_id || null,
      };

      if (editingInvoice) {
        const { error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', editingInvoice.id);

        if (error) throw error;
        toast.success('Facture mise à jour avec succès');
      } else {
        const { error } = await supabase.from('invoices').insert(invoiceData);

        if (error) throw error;
        toast.success('Facture créée avec succès');
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture?')) return;

    try {
      const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);

      if (error) throw error;
      toast.success('Facture supprimée avec succès');
      fetchData();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      appointment_id: '',
      amount: 0,
      status: 'pending',
      payment_method: 'cash',
      description: '',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setEditingInvoice(null);
  };

  const openEditDialog = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      patient_id: invoice.patient_id,
      appointment_id: invoice.appointment_id || '',
      amount: invoice.amount,
      status: invoice.status,
      payment_method: invoice.payment_method || 'cash',
      description: invoice.description,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
    });
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'default',
      paid: 'secondary',
      cancelled: 'destructive',
    };
    const labels: Record<string, string> = {
      pending: 'En attente',
      paid: 'Payé',
      cancelled: 'Annulé',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const statusMatch = filterStatus === 'all' || invoice.status === filterStatus;
    const dateMatch =
      invoice.invoice_date >= dateRange.start && invoice.invoice_date <= dateRange.end;
    return statusMatch && dateMatch;
  });

  const totalRevenue = filteredInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingRevenue = filteredInvoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const filteredAppointments = appointments.filter(
    (apt) => apt.patient_id === formData.patient_id
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion de la Facturation</h1>
          <p className="text-gray-600 mt-1">Gérez les factures et les paiements</p>
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
              Nouvelle Facture
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingInvoice ? 'Modifier la facture' : 'Nouvelle facture'}
              </DialogTitle>
              <DialogDescription>
                {editingInvoice
                  ? 'Modifiez les détails de la facture'
                  : 'Créez une nouvelle facture'}
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
                  <Label htmlFor="appointment_id">Rendez-vous (optionnel)</Label>
                  <Select
                    value={formData.appointment_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, appointment_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rendez-vous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun</SelectItem>
                      {filteredAppointments.map((apt) => (
                        <SelectItem key={apt.id} value={apt.id}>
                          {new Date(apt.appointment_date).toLocaleDateString('fr-FR')} -{' '}
                          {apt.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant (MAD) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Mode de paiement</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) =>
                      setFormData({ ...formData, payment_method: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="card">Carte</SelectItem>
                      <SelectItem value="check">Chèque</SelectItem>
                      <SelectItem value="transfer">Virement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_date">Date de facturation *</Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) =>
                      setFormData({ ...formData, invoice_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Date d'échéance *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    required
                  />
                </div>
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
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="paid">Payé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {editingInvoice ? 'Mettre à jour' : 'Créer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRevenue.toFixed(2)} MAD
            </div>
            <p className="text-xs text-muted-foreground mt-1">Factures payées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {pendingRevenue.toFixed(2)} MAD
            </div>
            <p className="text-xs text-muted-foreground mt-1">Factures en attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total factures</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInvoices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Sur la période</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex gap-2">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="paid">Payé</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          className="w-48"
        />
        <Input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="w-48"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Aucune facture trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.patient_name}</TableCell>
                  <TableCell className="max-w-xs truncate">{invoice.description}</TableCell>
                  <TableCell>
                    {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {invoice.amount.toFixed(2)} MAD
                  </TableCell>
                  <TableCell className="capitalize">{invoice.payment_method || '-'}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(invoice)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(invoice.id)}
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
