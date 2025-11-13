import React from "react";
import { Save, User, Bell, Lock, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
// Supabase client is now generic, so all table names are allowed
import { useQuery, useMutation } from "@tanstack/react-query";

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch user profile from Supabase
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setEmail(data.email || "");
        setRole(data.role || "");
      }
    };
    fetchProfile();
  }, [user]);

  // Cabinet info state
  const { data: cabinet, refetch } = useQuery({
    queryKey: ['cabinet-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cabinet').select('*').single();
      if (error || !data) return null;
      return data;
    }
  });
  const [cabinetName, setCabinetName] = useState("");
  const [cabinetAddress, setCabinetAddress] = useState("");
  const [cabinetCity, setCabinetCity] = useState("");
  const [cabinetPostal, setCabinetPostal] = useState("");
  const [cabinetPhone, setCabinetPhone] = useState("");
  const [cabinetSaving, setCabinetSaving] = useState(false);

  // Update cabinet info when fetched
  React.useEffect(() => {
    if (cabinet) {
      setCabinetName(cabinet.name || "");
      setCabinetAddress(cabinet.address || "");
      setCabinetCity(cabinet.city || "");
      setCabinetPostal(cabinet.postal || "");
      setCabinetPhone(cabinet.phone || "");
    } else {
      setCabinetName("");
      setCabinetAddress("");
      setCabinetCity("");
      setCabinetPostal("");
      setCabinetPhone("");
    }
  }, [cabinet]);

  const handleCabinetSave = async () => {
    setCabinetSaving(true);
    if (cabinet?.id) {
      await supabase.from('cabinet').update({
        name: cabinetName,
        address: cabinetAddress,
        city: cabinetCity,
        postal: cabinetPostal,
        phone: cabinetPhone
      }).eq('id', cabinet.id);
    } else {
      await supabase.from('cabinet').insert({
        name: cabinetName,
        address: cabinetAddress,
        city: cabinetCity,
        postal: cabinetPostal,
        phone: cabinetPhone
      });
    }
    await refetch();
    setCabinetSaving(false);
    // Optionally show a toast here
  };

  const handleProfileSave = async () => {
    setSaving(true);
    if (!profile) return;
    await supabase.from('user_profiles').update({ full_name: fullName, email, role }).eq('id', profile.id);
    setSaving(false);
    // Optionally show a toast here
  };

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
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Input id="role" value={role} disabled />
              </div>
              <Separator className="my-6" />
              <Button className="gap-2" onClick={handleProfileSave} disabled={saving}>
                <Save className="w-4 h-4" />
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="clinic">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Informations du cabinet</h2>
            <div className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="cabinetName">Nom du cabinet</Label>
                <Input id="cabinetName" value={cabinetName} onChange={e => setCabinetName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cabinetAddress">Adresse</Label>
                <Input id="cabinetAddress" value={cabinetAddress} onChange={e => setCabinetAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cabinetCity">Ville</Label>
                  <Input id="cabinetCity" value={cabinetCity} onChange={e => setCabinetCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cabinetPostal">Code postal</Label>
                  <Input id="cabinetPostal" value={cabinetPostal} onChange={e => setCabinetPostal(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cabinetPhone">Téléphone du cabinet</Label>
                <Input id="cabinetPhone" type="tel" value={cabinetPhone} onChange={e => setCabinetPhone(e.target.value)} />
              </div>
              <Separator className="my-6" />
              <Button className="gap-2" onClick={handleCabinetSave} disabled={cabinetSaving}>
                <Save className="w-4 h-4" />
                {cabinetSaving ? "Enregistrement..." : "Enregistrer les modifications"}
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
