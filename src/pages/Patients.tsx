import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Patients = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-2">Gérez vos dossiers patients</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau patient
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher un patient..." className="pl-10" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-muted-foreground">Liste des patients à venir...</p>
      </div>
    </div>
  );
};

export default Patients;
