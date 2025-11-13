# Supabase Setup Guide for DentalCare Admin Panel

## 🎯 Quick Setup Steps

### 1. Access Your Supabase Project
You already have a Supabase project configured:
- URL: `https://qrrekqzqkshvfzzumyer.supabase.co`

**Go to:** https://supabase.com/dashboard/project/qrrekqzqkshvfzzumyer

### 2. Setup Database Tables

#### Option A: Using SQL Editor (Recommended)
1. In Supabase Dashboard, click **SQL Editor** in the left menu
2. Click **"New Query"**
3. Copy ALL content from `database-schema.sql`
4. Paste into the editor
5. Click **"Run"** (or press Ctrl+Enter)

You should see: ✅ Success messages for all tables created

#### Option B: Manual Table Creation
If you prefer, you can also use the Table Editor, but SQL is faster.

### 3. Verify Tables Were Created

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - ✅ user_profiles
   - ✅ patients
   - ✅ appointments
   - ✅ inventory
   - ✅ invoices

### 4. Create Your First Admin User

**Method 1: Via Registration Page**
1. Start your app: `npm run dev`
2. Go to: http://localhost:8080/register
3. Fill in the form:
   - Full Name: Your name
   - Email: your@email.com
   - Password: (minimum 6 characters)
   - Role: **Administrateur**
4. Click "S'inscrire"

**Method 2: Via Supabase Dashboard**
1. Go to **Authentication** > **Users** in Supabase
2. Click **"Add user"** > **"Create new user"**
3. Enter email and password
4. After user is created, go to **SQL Editor**
5. Run this query (replace USER_ID and EMAIL):

```sql
INSERT INTO user_profiles (id, email, full_name, role)
VALUES (
  'USER_ID_HERE',
  'your@email.com',
  'Your Name',
  'admin'
);
```

### 5. Test the Application

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:** http://localhost:8080

3. **Login** with your admin credentials

4. **Test Features:**
   - ✅ Dashboard loads
   - ✅ Create a test patient
   - ✅ Create an appointment
   - ✅ Add inventory items
   - ✅ Create an invoice
   - ✅ Manage users (admin only)

### 6. Verify RLS (Row Level Security)

All tables have RLS enabled for security. To check:
1. Go to **Authentication** > **Policies** in Supabase
2. Select each table
3. You should see policies like:
   - "Users can view their own profile"
   - "Admins can view all profiles"
   - etc.

### 7. Enable Email Auth (Optional)

If you want email confirmations:
1. Go to **Authentication** > **Settings**
2. Enable "Email confirmations"
3. Configure SMTP (or use Supabase's default)

---

## 🔧 Troubleshooting

### "Table already exists" Error
If you run the SQL twice, you might see this error. It's safe to ignore or you can drop tables first:

```sql
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
```

Then run the `database-schema.sql` again.

### Login Not Working
1. Check Supabase URL and keys in `.env` file
2. Verify user exists in Authentication > Users
3. Verify user_profiles row exists for the user
4. Check browser console for errors

### TypeScript Errors
The TypeScript errors you see are because Supabase types aren't generated yet. They won't prevent the app from running. To fix them:

```bash
npm install --save-dev @supabase/supabase-js@latest
npx supabase gen types typescript --project-id qrrekqzqkshvfzzumyer > src/integrations/supabase/types.ts
```

### "Authentication required" Error
Make sure you're logged in. The app redirects to `/login` if not authenticated.

---

## 📊 Database Schema Overview

```
user_profiles (extends auth.users)
├── id (UUID, references auth.users)
├── email (TEXT)
├── full_name (TEXT)
├── role (TEXT: admin/dentist/assistant)
└── timestamps

patients
├── id (UUID)
├── full_name, email, phone (TEXT)
├── date_of_birth (DATE)
├── address, medical_history, allergies (TEXT)
└── created_by (references user_profiles)

appointments
├── id (UUID)
├── patient_id (references patients)
├── dentist_id (references user_profiles)
├── appointment_date, appointment_time
├── type (consultation/cleaning/treatment/emergency/followup)
├── status (scheduled/confirmed/cancelled/completed)
└── notes

inventory
├── id (UUID)
├── name, category, unit
├── quantity, min_quantity
├── price, supplier
└── last_updated

invoices
├── id (UUID)
├── patient_id (references patients)
├── appointment_id (optional, references appointments)
├── amount, status (pending/paid/cancelled)
├── payment_method, description
└── invoice_date, due_date
```

---

## 🚀 Next Steps After Setup

1. **Customize branding** in `src/components/Sidebar.tsx`
2. **Add more dentists** via Users page
3. **Import existing patients** (can create import feature)
4. **Configure notifications** (future feature)
5. **Setup backup schedule** in Supabase Dashboard

---

## ✅ Setup Complete!

Your admin panel is now fully functional with:
- ✅ User authentication & roles
- ✅ Patient management
- ✅ Appointment scheduling
- ✅ Inventory tracking
- ✅ Billing system
- ✅ Dynamic, real-time updates

Enjoy your DentalCare Admin Panel! 🦷
