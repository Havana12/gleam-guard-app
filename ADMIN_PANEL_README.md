# DentalCare Admin Panel

Un système complet de gestion de cabinet dentaire avec authentification, gestion des utilisateurs, patients, rendez-vous, stocks et facturation.

## 🚀 Fonctionnalités

### Authentification et Autorisation
- ✅ Connexion et inscription des utilisateurs
- ✅ Gestion des rôles (Administrateur, Dentiste, Assistant)
- ✅ Protection des routes par authentification
- ✅ Permissions basées sur les rôles

### Interface Administrateur
- ✅ **Gestion des Utilisateurs**
  - Création, modification et suppression d'utilisateurs
  - Assignation des rôles
  - Vue d'ensemble de tous les utilisateurs
  
### Gestion des Patients
- ✅ Dossiers patients complets
- ✅ Historique médical et allergies
- ✅ Recherche et filtrage avancés
- ✅ Modification et suppression des dossiers

### Gestion des Rendez-vous
- ✅ Calendrier interactif
- ✅ Planification des rendez-vous
- ✅ Types de rendez-vous (Consultation, Nettoyage, Traitement, Urgence, Suivi)
- ✅ Statuts (Planifié, Confirmé, Annulé, Terminé)
- ✅ Filtrage par type et statut
- ✅ Notes pour chaque rendez-vous

### Gestion des Stocks
- ✅ Inventaire complet
- ✅ Catégories de produits
- ✅ Alertes de stock bas
- ✅ Alertes de rupture de stock
- ✅ Suivi des fournisseurs et prix
- ✅ Statistiques en temps réel

### Facturation et Rapports
- ✅ Création de factures
- ✅ Suivi des paiements
- ✅ Différents modes de paiement (Espèces, Carte, Chèque, Virement)
- ✅ Filtrage par statut et période
- ✅ Rapports financiers
- ✅ Statistiques des revenus

## 🛠️ Technologies Utilisées

- **Frontend**: React 18 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Routing**: React Router v6
- **État**: React Query (TanStack Query)
- **Backend**: Supabase
- **Base de données**: PostgreSQL (via Supabase)
- **Authentification**: Supabase Auth
- **Build**: Vite

## 📦 Installation

### Prérequis
- Node.js 18+ et npm/bun
- Un compte Supabase

### Étapes d'installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd gleam-guard-app-main
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   bun install
   ```

3. **Configurer Supabase**
   
   a. Créez un nouveau projet sur [Supabase](https://supabase.com)
   
   b. Créez un fichier `.env` à la racine du projet:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   c. Exécutez le schéma de base de données:
   - Allez dans l'éditeur SQL de Supabase
   - Copiez et exécutez le contenu de `database-schema.sql`

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Créer le premier utilisateur admin**
   - Accédez à `/register`
   - Créez un compte avec le rôle "Administrateur"

## 🗄️ Structure de la Base de Données

### Tables principales:

- **user_profiles**: Profils utilisateurs avec rôles
- **patients**: Informations des patients
- **appointments**: Rendez-vous avec patients et dentistes
- **inventory**: Gestion des stocks
- **invoices**: Facturation et paiements

Voir `database-schema.sql` pour le schéma complet.

## 🎨 Structure du Projet

```
src/
├── components/         # Composants réutilisables
│   ├── ui/            # Composants shadcn/ui
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── ...
├── contexts/          # Contextes React
│   └── AuthContext.tsx
├── pages/             # Pages de l'application
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── UserManagement.tsx
│   ├── PatientsManagement.tsx
│   ├── AppointmentsManagement.tsx
│   ├── InventoryManagement.tsx
│   └── BillingManagement.tsx
├── integrations/      # Intégrations externes
│   └── supabase/
└── App.tsx           # Point d'entrée
```

## 👥 Rôles et Permissions

### Administrateur
- Accès complet à toutes les fonctionnalités
- Gestion des utilisateurs
- Gestion des patients, rendez-vous, stocks, facturation
- Accès aux rapports

### Dentiste
- Gestion des patients
- Gestion des rendez-vous
- Consultation des stocks
- Création de factures

### Assistant
- Gestion des rendez-vous
- Consultation des patients
- Gestion des stocks

## 🔒 Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Authentification JWT via Supabase
- Protection des routes côté client
- Policies PostgreSQL pour l'accès aux données

## 📱 Responsive Design

L'interface est entièrement responsive et optimisée pour:
- Desktop (1920px+)
- Laptop (1366px)
- Tablet (768px)
- Mobile (375px)

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Déploiement sur Vercel/Netlify
1. Connectez votre repository
2. Ajoutez les variables d'environnement
3. Déployez

## 📝 Branche Admin Panel

Cette version est sur la branche `admin-panel` avec toutes les fonctionnalités d'administration.

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à:
1. Fork le projet
2. Créer une branche feature
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 💡 Support

Pour toute question ou problème, n'hésitez pas à ouvrir une issue sur GitHub.
