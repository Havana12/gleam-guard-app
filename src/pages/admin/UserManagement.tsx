import { Plus, Search, Edit, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "assistant",
  });

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: async () => {
      let query = supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
      
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Create/Update user
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingUser) {
        // Update profile only
        const { error } = await supabase
          .from('user_profiles')
          .update({
            full_name: data.full_name,
            role: data.role,
          })
          .eq('id', editingUser.id);
        if (error) throw error;
      } else {
        // Create new user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
        if (authError) throw authError;

        if (authData.user) {
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
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingUser ? "Utilisateur mis à jour" : "Utilisateur créé",
        description: "Les informations ont été enregistrées avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  // Delete user
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      email: user.email || "",
      password: "",
      full_name: user.full_name || "",
      role: user.role || "assistant",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Admin</Badge>;
      case 'dentist':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Dentiste</Badge>;
      case 'assistant':
        return <Badge className="bg-secondary/10 text-secondary border-secondary/20">Assistant</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Gestion des utilisateurs
          </h1>
          <p className="text-muted-foreground mt-2">Gérez les comptes et permissions</p>
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
          <DialogContent>
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
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="dentist">Dentiste</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
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

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total utilisateurs</p>
          <p className="text-3xl font-bold text-foreground mt-2">{users.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Dentistes</p>
          <p className="text-3xl font-bold text-primary mt-2">
            {users.filter(u => u.role === 'dentist').length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Assistants</p>
          <p className="text-3xl font-bold text-secondary mt-2">
            {users.filter(u => u.role === 'assistant').length}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {searchTerm ? "Aucun utilisateur trouvé" : "Aucun utilisateur enregistré"}
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{user.full_name || 'Sans nom'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
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

export default UserManagement;
