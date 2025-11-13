import { Download, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rapports</h1>
          <p className="text-muted-foreground mt-2">Analysez les performances de votre cabinet</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-success" />
                <p className="text-sm text-muted-foreground">Ce mois</p>
              </div>
              <p className="text-3xl font-bold text-foreground">12,450€</p>
              <p className="text-sm text-success mt-2">+15% vs mois dernier</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">Ce trimestre</p>
              </div>
              <p className="text-3xl font-bold text-foreground">35,280€</p>
              <p className="text-sm text-success mt-2">+8% vs trimestre dernier</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">Cette année</p>
              </div>
              <p className="text-3xl font-bold text-foreground">124,560€</p>
              <p className="text-sm text-success mt-2">+12% vs année dernière</p>
            </Card>
          </div>

          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Graphique des revenus à venir...</p>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Total ce mois</p>
              <p className="text-3xl font-bold text-foreground mt-2">156</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Consultations</p>
              <p className="text-3xl font-bold text-primary mt-2">89</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Traitements</p>
              <p className="text-3xl font-bold text-secondary mt-2">52</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Urgences</p>
              <p className="text-3xl font-bold text-destructive mt-2">15</p>
            </Card>
          </div>

          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Statistiques de rendez-vous à venir...</p>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Total patients</p>
              <p className="text-3xl font-bold text-foreground mt-2">487</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Nouveaux ce mois</p>
              <p className="text-3xl font-bold text-success mt-2">23</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Patients actifs</p>
              <p className="text-3xl font-bold text-primary mt-2">342</p>
            </Card>
          </div>

          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Analyse des patients à venir...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
