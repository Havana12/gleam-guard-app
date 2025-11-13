import { Plus, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const inventory = [
  { id: 1, name: "Gants en latex", quantity: 450, min: 200, unit: "boîtes", category: "Consommables" },
  { id: 2, name: "Masques chirurgicaux", quantity: 180, min: 300, unit: "boîtes", category: "Consommables" },
  { id: 3, name: "Anesthésique local", quantity: 25, min: 30, unit: "unités", category: "Médicaments" },
  { id: 4, name: "Amalgame dentaire", quantity: 15, min: 10, unit: "unités", category: "Matériaux" },
  { id: 5, name: "Brosses à dents", quantity: 120, min: 50, unit: "unités", category: "Produits" },
  { id: 6, name: "Fil dentaire", quantity: 80, min: 40, unit: "unités", category: "Produits" },
];

const Inventory = () => {
  const getStockLevel = (quantity: number, min: number) => {
    const percentage = (quantity / (min * 2)) * 100;
    if (quantity < min) return { level: "critical", color: "text-destructive", bg: "bg-destructive" };
    if (percentage < 75) return { level: "low", color: "text-warning", bg: "bg-warning" };
    return { level: "good", color: "text-success", bg: "bg-success" };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des stocks</h1>
          <p className="text-muted-foreground mt-2">Suivez vos fournitures et matériels</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un article
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total d'articles</p>
          <p className="text-3xl font-bold text-foreground mt-2">{inventory.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Stock optimal</p>
          <p className="text-3xl font-bold text-success mt-2">
            {inventory.filter(item => item.quantity >= item.min).length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Stock faible</p>
          <p className="text-3xl font-bold text-warning mt-2">
            {inventory.filter(item => item.quantity < item.min && item.quantity >= item.min * 0.5).length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Stock critique</p>
          <p className="text-3xl font-bold text-destructive mt-2">
            {inventory.filter(item => item.quantity < item.min * 0.5).length}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Inventaire</h2>
          <div className="relative flex-1 max-w-xs ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un article..." className="pl-10" />
          </div>
        </div>

        <div className="space-y-4">
          {inventory.map((item) => {
            const stockInfo = getStockLevel(item.quantity, item.min);
            const percentage = Math.min((item.quantity / (item.min * 2)) * 100, 100);
            
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
                        {item.category}
                      </Badge>
                      {item.quantity < item.min && (
                        <AlertTriangle className={`w-4 h-4 ${stockInfo.color}`} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Stock minimum: {item.min} {item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${stockInfo.color}`}>
                      {item.quantity}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.unit}</p>
                  </div>
                </div>
                <Progress value={percentage} className={`h-2 ${stockInfo.bg}`} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Inventory;
