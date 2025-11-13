import { Plus, Edit, Trash2, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const AdminUsers = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "assistant" as "admin" | "dentist" | "assistant",
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Sign up new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role,
          });
        if (profileError) throw profileError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Utilisateur créé",
        description: "Le nouvel utilisateur a été créé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ full_name: data.full_name, role: data.role })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Utilisateur mis à jour",
        description: "Les informations ont été mises à jour avec succès.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      full_name: "",
      role: "assistant",
    });
    setEditingUser(null);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "",
      full_name: user.full_name || "",
      role: user.role,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Admin</Badge>;
      case "dentist":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Dentiste</Badge>;
      case "assistant":
        return <Badge className="bg-secondary/10 text-secondary border-secondary/20">Assistant</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
          <p className="text-muted-foreground">Vous devez être administrateur pour accéder à cette page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground mt-2">Gérez les comptes utilisateurs et leurs rôles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  disabled={!!editingUser}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {!editingUser && (
                <div className="space-y-2">
                  <Label>Mot de passe *</Label>
                  <Input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={6}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Rôle *</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="dentist">Dentiste</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Chargement...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucun utilisateur</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{user.full_name || "Sans nom"}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  </div>
                  {getRoleBadge(user.role)}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
                        deleteMutation.mutate(user.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminUsers;
