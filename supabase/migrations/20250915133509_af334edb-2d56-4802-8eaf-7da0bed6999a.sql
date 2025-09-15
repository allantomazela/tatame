-- Fix RLS policies for profiles to allow creating student profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Update belt colors with proper Taekwondo graduations
DELETE FROM public.belt_colors;

INSERT INTO public.belt_colors (color, description, order_sequence) VALUES 
('branca', 'Faixa Branca', 1),
('branca_ponta_amarela', 'Faixa Branca Ponta Amarela', 2),
('amarela', 'Faixa Amarela', 3),
('amarela_ponta_verde', 'Faixa Amarela Ponta Verde', 4),
('verde', 'Faixa Verde', 5),
('verde_ponta_azul', 'Faixa Verde Ponta Azul', 6),
('azul', 'Faixa Azul', 7),
('azul_ponta_vermelha', 'Faixa Azul Ponta Vermelha', 8),
('vermelha', 'Faixa Vermelha', 9),
('vermelha_ponta_preta', 'Faixa Vermelha Ponta Preta', 10),
('prata_ponta_branca', 'Faixa Prata Ponta Branca', 11),
('preta', 'Faixa Preta', 12);

-- Allow creation and updates for students table
DROP POLICY IF EXISTS "Students can view own record" ON public.students;
DROP POLICY IF EXISTS "Responsaveis can view their students" ON public.students;
DROP POLICY IF EXISTS "Students can view own data" ON public.students;

CREATE POLICY "Everyone can view students" 
ON public.students 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can create students" 
ON public.students 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Everyone can update students" 
ON public.students 
FOR UPDATE 
USING (true);

-- Allow operations on graduations table
CREATE POLICY "Everyone can create graduations" 
ON public.graduations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Everyone can update graduations" 
ON public.graduations 
FOR UPDATE 
USING (true);

CREATE POLICY "Everyone can delete graduations" 
ON public.graduations 
FOR DELETE 
USING (true);