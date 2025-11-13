import { Plus, Search, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    category: "dental_supplies",
    quantity: 0,
    unit: "pcs",
    min_quantity: 10,
    price: 0,
    supplier: "",
  });

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['inventory', searchTerm],
    queryFn: async () => {
      let query = supabase.from('inventory').select('*').order('name');
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingItem) {
        const { error } = await supabase
          .from('inventory')
          .update({ ...data, last_updated: new Date().toISOString() })
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('inventory').insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingItem ? "Article mis à jour" : "Article ajouté",
        description: "Les informations ont été enregistrées avec succès.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès.",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "dental_supplies",
      quantity: 0,
      unit: "pcs",
      min_quantity: 10,
      price: 0,
      supplier: "",
    });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      category: item.category || "dental_supplies",
      quantity: item.quantity || 0,
      unit: item.unit || "pcs",
      min_quantity: item.min_quantity || 10,
      price: item.price || 0,
      supplier: item.supplier || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };
  const getStockLevel = (quantity: number, min: number) => {
    const percentage = (quantity / (min * 2)) * 100;
    if (quantity < min) return { level: "critical", color: "text-destructive", bg: "bg-destructive" };
    if (percentage < 75) return { level: "low", color: "text-warning", bg: "bg-warning" };
    return { level: "good", color: "text-success", bg: "bg-success" };
  };

  const categoryTranslations: Record<string, string> = {
    dental_supplies: "Fournitures dentaires",
    instruments: "Instruments",
    materials: "Matériaux",
    medications: "Médicaments",
    hygiene: "Hygiène",
    other: "Autre",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des stocks</h1>
          <p className="text-muted-foreground mt-2">Suivez vos fournitures et matériels</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Label>Quantité *</Label>
                  <Input type="number" required value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Unité *</Label>
                  <Input required value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Stock min *</Label>
                  <Input type="number" required value={formData.min_quantity} onChange={(e) => setFormData({ ...formData, min_quantity: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prix</Label>
                  <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Fournisseur</Label>
                  <Input value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total d'articles</p>
          <p className="text-3xl font-bold text-foreground mt-2">{inventory.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Stock optimal</p>
          <p className="text-3xl font-bold text-success mt-2">
            {inventory.filter(item => item.quantity >= item.min_quantity).length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Stock faible</p>
          <p className="text-3xl font-bold text-warning mt-2">
            {inventory.filter(item => item.quantity < item.min_quantity && item.quantity >= item.min_quantity * 0.5).length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Stock critique</p>
          <p className="text-3xl font-bold text-destructive mt-2">
            {inventory.filter(item => item.quantity < item.min_quantity * 0.5).length}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Inventaire</h2>
          <div className="relative flex-1 max-w-xs ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un article..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Chargement...</p>
          ) : inventory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? "Aucun article trouvé" : "Aucun article en stock"}
            </p>
          ) : (
            inventory.map((item) => {
              const stockInfo = getStockLevel(item.quantity, item.min_quantity);
              const percentage = Math.min((item.quantity / (item.min_quantity * 2)) * 100, 100);
              
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {categoryTranslations[item.category] || item.category}
                        </Badge>
                        {item.quantity < item.min_quantity && (
                          <AlertTriangle className={`w-4 h-4 ${stockInfo.color}`} />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Stock minimum: {item.min_quantity} {item.unit}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${stockInfo.color}`}>
                          {item.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.unit}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Progress value={percentage} className={`h-2 ${stockInfo.bg}`} />
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

export default Inventory;
