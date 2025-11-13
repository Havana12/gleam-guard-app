# Admin Panel - Guide de Configuration

## 🚀 Configuration du Backend Supabase

### Étape 1: Créer un Projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Créez un nouveau projet avec les informations suivantes:
   - Nom du projet: gleam-guard-dental
   - Base de données password: (choisissez un mot de passe sécurisé)
   - Région: Choisissez la région la plus proche de vous

### Étape 2: Configurer les Variables d'Environnement

1. Dans votre projet Supabase, allez dans **Settings** > **API**
2. Copiez les valeurs suivantes:
   - `Project URL` (anon public)
   - `anon public` API key

3. Créez/modifiez le fichier `.env` à la racine du projet:

```env
VITE_SUPABASE_URL=votre_project_url
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

### Étape 3: Exécuter les Migrations de Base de Données

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Copiez le contenu du fichier `supabase/migrations/20231113000000_initial_schema.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur "Run" pour exécuter le script

### Étape 4: Configurer l'Authentification

1. Dans Supabase, allez dans **Authentication** > **Providers**
2. Activez **Email** provider
3. Configurez les paramètres:
   - **Enable email confirmations**: Désactivez pour le développement
   - **Enable email signups**: Activé

### Étape 5: Créer le Premier Utilisateur Admin

Après avoir configuré l'authentification, vous pouvez:

**Option A - Via l'interface d'inscription:**
1. Lancez l'application: `npm run dev`
2. Allez sur `/register`
3. Créez un compte avec le rôle "Administrateur"

**Option B - Via Supabase SQL Editor:**
```sql
-- Après avoir créé un utilisateur via l'interface, mettez-le admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'votre@email.com';
```

## 📊 Structure de la Base de Données

### Tables Créées:

1. **user_profiles** - Profils des utilisateurs (Admin, Dentiste, Assistant)
2. **patients** - Dossiers des patients
3. **appointments** - Rendez-vous avec calendrier
4. **inventory** - Gestion des stocks
5. **invoices** - Facturation et paiements

### Rôles Utilisateurs:

- **admin**: Accès complet à toutes les fonctionnalités
- **dentist**: Accès aux patients, rendez-vous, facturation
- **assistant**: Accès aux patients et rendez-vous (lecture/écriture limitée)

## 🔐 Sécurité (Row Level Security)

Toutes les tables sont protégées par RLS:
- Les utilisateurs ne peuvent voir que leurs propres données ou celles autorisées
- Les admins ont accès complet
- Les politiques sont définies dans le fichier de migration

## 🎨 Fonctionnalités Implémentées

### ✅ Authentification
- Inscription avec email/mot de passe
- Connexion
- Gestion des rôles
- Protection des routes

### ✅ Gestion des Utilisateurs (Admin)
- Créer/Modifier/Supprimer des utilisateurs
- Assigner des rôles
- Vue d'ensemble des utilisateurs

### ✅ Gestion des Patients
- CRUD complet des patients
- Recherche et filtrage
- Historique médical et allergies

### ✅ Gestion des Rendez-vous
- Calendrier interactif
- Création/Modification/Suppression
- Filtres par type et statut
- Notifications de statut
- Vue par dentiste

### ✅ Gestion des Stocks
- Suivi de l'inventaire
- Alertes de stock bas
- Catégorisation des articles
- Gestion des fournisseurs

### ✅ Facturation
- Création de factures
- Suivi des paiements
- Rapports financiers
- Statistiques de revenus

## 🚦 Lancer l'Application

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# L'application sera accessible sur http://localhost:8080
```

## 📝 Routes de l'Application

- `/login` - Connexion
- `/register` - Inscription
- `/dashboard` - Tableau de bord
- `/users` - Gestion des utilisateurs (Admin uniquement)
- `/patients` - Gestion des patients
- `/appointments` - Gestion des rendez-vous
- `/inventory` - Gestion des stocks
- `/billing` - Facturation
- `/settings` - Paramètres

## 🔧 Développement

### Technologies Utilisées:
- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: React Query
- **Routing**: React Router
- **Forms**: React Hook Form + Zod

### Structure du Projet:
```
src/
├── contexts/        # AuthContext pour l'authentification
├── components/      # Composants réutilisables
│   └── ui/         # Composants shadcn/ui
├── pages/          # Pages de l'application
├── integrations/   # Configuration Supabase
└── lib/            # Utilitaires
```

## 🐛 Dépannage

### Erreur: "supabase is not defined"
- Vérifiez que les variables d'environnement sont correctement configurées dans `.env`
- Redémarrez le serveur de développement

### Erreur: "relation does not exist"
- Assurez-vous que toutes les migrations ont été exécutées dans Supabase
- Vérifiez la structure de la base de données dans l'onglet **Table Editor**

### Problèmes d'authentification
- Vérifiez que l'email provider est activé dans Supabase
- Assurez-vous que RLS est correctement configuré

## 📞 Support

Pour toute question ou problème, consultez:
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation shadcn/ui](https://ui.shadcn.com)
- [Documentation React Router](https://reactrouter.com)
