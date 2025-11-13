import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Package, Plus, Edit, Trash2, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  price?: number;
  supplier?: string;
  last_updated: string;
}

export default function InventoryManagement() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    category: 'dental_supplies',
    quantity: 0,
    unit: 'pcs',
    min_quantity: 10,
    price: 0,
    supplier: '',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement du stock');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('inventory')
          .update({
            ...formData,
            last_updated: new Date().toISOString(),
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Article mis à jour avec succès');
      } else {
        const { error } = await supabase.from('inventory').insert({
          ...formData,
          last_updated: new Date().toISOString(),
        });

        if (error) throw error;
        toast.success('Article ajouté avec succès');
      }

      setDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article?')) return;

    try {
      const { error } = await supabase.from('inventory').delete().eq('id', itemId);

      if (error) throw error;
      toast.success('Article supprimé avec succès');
      fetchItems();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'dental_supplies',
      quantity: 0,
      unit: 'pcs',
      min_quantity: 10,
      price: 0,
      supplier: '',
    });
    setEditingItem(null);
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      min_quantity: item.min_quantity,
      price: item.price || 0,
      supplier: item.supplier || '',
    });
    setDialogOpen(true);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      dental_supplies: 'Fournitures dentaires',
      instruments: 'Instruments',
      materials: 'Matériaux',
      medications: 'Médicaments',
      hygiene: 'Hygiène',
      other: 'Autre',
    };
    return labels[category] || category;
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return { label: 'Rupture', variant: 'destructive' as const, icon: AlertTriangle };
    } else if (item.quantity <= item.min_quantity) {
      return { label: 'Bas', variant: 'default' as const, icon: TrendingDown };
    } else {
      return { label: 'OK', variant: 'secondary' as const, icon: TrendingUp };
    }
  };

  const filteredItems = items.filter((item) => 
    filterCategory === 'all' || item.category === filterCategory
  );

  const lowStockItems = items.filter(item => item.quantity <= item.min_quantity);
  const outOfStockItems = items.filter(item => item.quantity === 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Stocks</h1>
          <p className="text-gray-600 mt-1">Suivez et gérez l'inventaire</p>
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
              Nouvel Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Modifier l\'article' : 'Nouvel article'}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? 'Modifiez les détails de l\'article'
                  : 'Ajoutez un nouvel article au stock'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dental_supplies">Fournitures dentaires</SelectItem>
                      <SelectItem value="instruments">Instruments</SelectItem>
                      <SelectItem value="materials">Matériaux</SelectItem>
                      <SelectItem value="medications">Médicaments</SelectItem>
                      <SelectItem value="hygiene">Hygiène</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantité *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unité *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pièces</SelectItem>
                      <SelectItem value="box">Boîtes</SelectItem>
                      <SelectItem value="kg">Kilogrammes</SelectItem>
                      <SelectItem value="l">Litres</SelectItem>
                      <SelectItem value="pack">Paquets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_quantity">Quantité min *</Label>
                  <Input
                    id="min_quantity"
                    type="number"
                    min="0"
                    value={formData.min_quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix unitaire (MAD)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Fournisseur</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingItem ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bas</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{lowStockItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rupture</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{outOfStockItems.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="dental_supplies">Fournitures dentaires</SelectItem>
            <SelectItem value="instruments">Instruments</SelectItem>
            <SelectItem value="materials">Matériaux</SelectItem>
            <SelectItem value="medications">Médicaments</SelectItem>
            <SelectItem value="hygiene">Hygiène</SelectItem>
            <SelectItem value="other">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Unité</TableHead>
              <TableHead>Min</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Aucun article trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const status = getStockStatus(item);
                const StatusIcon = status.icon;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{getCategoryLabel(item.category)}</TableCell>
                    <TableCell className={item.quantity <= item.min_quantity ? 'text-orange-500 font-bold' : ''}>
                      {item.quantity}
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.min_quantity}</TableCell>
                    <TableCell>{item.price ? `${item.price.toFixed(2)} MAD` : '-'}</TableCell>
                    <TableCell>{item.supplier || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
