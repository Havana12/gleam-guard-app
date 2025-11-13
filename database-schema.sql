-- Admin Panel Database Schema for DentalCare
-- This file contains all the SQL commands needed to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'dentist', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies (simplified to avoid infinite recursion)
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  address TEXT,
  medical_history TEXT,
  allergies TEXT,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Patients Policies
CREATE POLICY "Authenticated users can view patients" ON patients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert patients" ON patients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update patients" ON patients
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete patients" ON patients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL REFERENCES user_profiles(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('consultation', 'cleaning', 'treatment', 'emergency', 'followup')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Appointments Policies
CREATE POLICY "Users can view appointments" ON appointments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update appointments" ON appointments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete appointments" ON appointments
  FOR DELETE USING (auth.role() = 'authenticated');

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('dental_supplies', 'instruments', 'materials', 'medications', 'hygiene', 'other')),
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs',
  min_quantity INTEGER NOT NULL DEFAULT 10,
  price DECIMAL(10, 2),
  supplier TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Inventory Policies
CREATE POLICY "Users can view inventory" ON inventory
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage inventory" ON inventory
  FOR ALL USING (auth.role() = 'authenticated');

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_method TEXT,
  description TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Invoices Policies
CREATE POLICY "Users can view invoices" ON invoices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create invoices" ON invoices
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update invoices" ON invoices
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete invoices" ON invoices
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_dentist ON appointments(dentist_id);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
