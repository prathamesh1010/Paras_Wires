
-- Create user profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product models table
CREATE TABLE public.product_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model_number TEXT UNIQUE NOT NULL,
  specifications JSONB,
  reference_standards JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table to store generated reports
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_model_id UUID REFERENCES public.product_models(id),
  reference_model_id UUID REFERENCES public.product_models(id),
  report_data JSONB,
  format TEXT CHECK (format IN ('pdf', 'txt', 'docx')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for product_models (accessible to all authenticated users)
CREATE POLICY "Authenticated users can view products" ON public.product_models
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for reports
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON public.reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample product models
INSERT INTO public.product_models (name, model_number, specifications, reference_standards) VALUES
('Cable Model A', 'CMA-2024', '{"voltage": "600V", "conductor": "Copper", "insulation": "XLPE"}', '{"test_voltage": "2500V", "temperature_rating": "90C"}'),
('Cable Model B', 'CMB-2024', '{"voltage": "1000V", "conductor": "Aluminum", "insulation": "PVC"}', '{"test_voltage": "4000V", "temperature_rating": "70C"}'),
('Cable Model C', 'CMC-2024', '{"voltage": "11kV", "conductor": "Copper", "insulation": "XLPE"}', '{"test_voltage": "15kV", "temperature_rating": "90C"}'),
('Power Cable D', 'PCD-2024', '{"voltage": "33kV", "conductor": "Copper", "insulation": "XLPE"}', '{"test_voltage": "50kV", "temperature_rating": "90C"}'),
('Control Cable E', 'CCE-2024', '{"voltage": "250V", "conductor": "Copper", "insulation": "PVC"}', '{"test_voltage": "1000V", "temperature_rating": "70C"}');

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
