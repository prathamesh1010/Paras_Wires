
-- Create a table to store DEF STAN standards data
CREATE TABLE public.def_standards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  standard_name TEXT NOT NULL UNIQUE,
  metadata JSONB NOT NULL,
  products JSONB NOT NULL,
  sections JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to allow public read access
ALTER TABLE public.def_standards ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to read standards data
CREATE POLICY "Anyone can view standards" 
  ON public.def_standards 
  FOR SELECT 
  TO public
  USING (true);

-- Create policy that allows authenticated users to insert standards data
CREATE POLICY "Authenticated users can insert standards" 
  ON public.def_standards 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create policy that allows authenticated users to update standards data
CREATE POLICY "Authenticated users can update standards" 
  ON public.def_standards 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Insert sample DEF STAN 61-12 Part 31 data
INSERT INTO public.def_standards (standard_name, metadata, products, sections) VALUES (
  'DEF STAN 61-12 Part 31',
  '{
    "title": "Sheaths - Limited Fire Hazard",
    "issue": "2",
    "date": "2006-01-20",
    "scope": "Sheathing materials for cables (-30°C to +105°C, 40,000+ hours at 85°C)"
  }',
  '{
    "Sheath Material": {
      "sections": ["Clause 1", "Clause 6", "Clause 9", "Table 1"],
      "requirements": "General requirements for colour, temperature, fluid resistance",
      "tests": "Tensile strength ≥ 8 N/mm², critical oxygen index ≥ 29",
      "temperature_range": "-30°C to +105°C",
      "toxicity_limit": "Max 5 per 100g"
    }
  }',
  '{
    "Clause 1": "Scope and general requirements for sheath materials",
    "Clause 6": "General requirements including colour, temperature stability, and fluid resistance properties",
    "Clause 9": "Test methods including tensile strength testing and critical oxygen index determination",
    "Table 1": "Fluid resistance limits and compatibility requirements"
  }'
);

-- Insert sample DEF STAN 61-12 Part 18 data
INSERT INTO public.def_standards (standard_name, metadata, products, sections) VALUES (
  'DEF STAN 61-12 Part 18',
  '{
    "title": "Equipment Wires - Limited Fire Hazard",
    "issue": "4",
    "date": "1995-01-06",
    "scope": "Equipment wires (-50°C to +120°C, or +85°C for Type 1SBM 85)"
  }',
  '{
    "Cable Type 1SBM 85": {
      "sections": ["Clause 1", "Table A", "Table I(D)"],
      "voltage": "600 V RMS",
      "temperature_range": "-50°C to +85°C",
      "bend_radius": "10x diameter for flexing",
      "current_rating": "3.7 amps for 19/0.20 conductor",
      "toxicity_index": "≤ 0.2"
    },
    "Cable Type 2SB": {
      "sections": ["Clause 1", "Table A", "Table I(D)"],
      "voltage": "600 V RMS",
      "temperature_range": "-50°C to +120°C",
      "multicore": true
    }
  }',
  '{
    "Clause 1": "Scope including voltage ratings (600 V RMS) and bend radii requirements",
    "Table A": "Current ratings for different conductor sizes (e.g., 19/0.20 conductor = 3.7 amps)",
    "Table I(D)": "Toxicity index requirements (≤ 0.2 for Type 1SBM 85)"
  }'
);

-- Create a table to store chat messages for the smart box
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  standard_name TEXT NOT NULL,
  product_name TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for chat messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own chat messages
CREATE POLICY "Users can view their own chat messages" 
  ON public.chat_messages 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy for users to insert chat messages
CREATE POLICY "Users can create chat messages" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
