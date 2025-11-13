import { Save, User, Bell, Lock, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground mt-2">Gérez les paramètres de votre cabinet</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="clinic">
            <Building className="w-4 h-4 mr-2" />
            Cabinet
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Informations personnelles</h2>
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" defaultValue="Martin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" defaultValue="Dubois" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="martin.dubois@dentalcare.fr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" defaultValue="+33 6 12 34 56 78" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Spécialisation</Label>
                <Input id="specialization" defaultValue="Chirurgie dentaire" />
              </div>
              <Separator className="my-6" />
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Enregistrer les modifications
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="clinic">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Informations du cabinet</h2>
            <div className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="clinicName">Nom du cabinet</Label>
                <Input id="clinicName" defaultValue="DentalCare Cabinet Dentaire" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" defaultValue="12 Avenue des Champs-Élysées" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" defaultValue="Paris" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal">Code postal</Label>
                  <Input id="postal" defaultValue="75008" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicPhone">Téléphone du cabinet</Label>
                <Input id="clinicPhone" type="tel" defaultValue="+33 1 23 45 67 89" />
              </div>
              <Separator className="my-6" />
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Enregistrer les modifications
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Préférences de notification</h2>
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rappels de rendez-vous</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des notifications pour les rendez-vous à venir
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertes de stock</Label>
                  <p className="text-sm text-muted-foreground">
                    Être notifié quand le stock est faible
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Factures en retard</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des alertes pour les paiements en retard
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nouveaux patients</Label>
                  <p className="text-sm text-muted-foreground">
                    Être notifié lors de l'ajout de nouveaux patients
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Sécurité et confidentialité</h2>
            <div className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Separator className="my-6" />
              <Button className="gap-2">
                <Lock className="w-4 h-4" />
                Changer le mot de passe
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
