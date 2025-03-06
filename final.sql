
DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_report_created ON public.reports;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_report() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_anonymous_users() CASCADE;
DROP TABLE IF EXISTS public.reports_access CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  image_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports_access table for managing access control
CREATE TABLE IF NOT EXISTS public.reports_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID,
  user_id UUID,
  access_level TEXT NOT NULL CHECK (access_level IN ('viewer', 'editor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_id, user_id),
  FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create trigger function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new profile with proper handling for anonymous users
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id, 
    CASE 
      WHEN NEW.email IS NULL OR NEW.email = '' THEN NULL
      ELSE NEW.email
    END,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Anonymous User'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Silently handle duplicate profile creation attempts
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in handle_new_user: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to handle new report creation
CREATE OR REPLACE FUNCTION public.handle_new_report() 
RETURNS TRIGGER AS $$
BEGIN
  -- Only create access entry if user is authenticated (not for public reports)
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.reports_access (report_id, user_id, access_level)
    VALUES (NEW.id, auth.uid(), 'admin');
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Silently handle duplicate access entry creation attempts
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in handle_new_report: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up old anonymous users
CREATE OR REPLACE FUNCTION public.cleanup_anonymous_users()
RETURNS void AS $$
BEGIN
  -- Delete anonymous users older than 30 days
  DELETE FROM auth.users
  WHERE is_anonymous IS TRUE AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_report_created
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.handle_new_report();

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_access ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to ensure clean setup
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

DROP POLICY IF EXISTS "Allow public access to reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view reports they have access to" ON public.reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can update reports they have edit access to" ON public.reports;
DROP POLICY IF EXISTS "Users can delete reports they have admin access to" ON public.reports;

DROP POLICY IF EXISTS "Users can view their own access entries" ON public.reports_access;
DROP POLICY IF EXISTS "Users can insert their own access entries" ON public.reports_access;
DROP POLICY IF EXISTS "Users can update their own access entries" ON public.reports_access;
DROP POLICY IF EXISTS "Users can delete their own access entries" ON public.reports_access;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create policies for reports table
-- Allow all users (including anonymous) to view all reports
CREATE POLICY "Allow public access to reports for viewing"
ON public.reports FOR SELECT
USING (true);

-- Allow all users (including anonymous) to create reports
CREATE POLICY "Allow public creation of reports"
ON public.reports FOR INSERT
WITH CHECK (true);

-- Allow users to update reports they have edit access to
CREATE POLICY "Users can update reports they have edit access to"
ON public.reports FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.reports_access
    WHERE public.reports_access.report_id = id
    AND public.reports_access.user_id = auth.uid()
    AND public.reports_access.access_level IN ('editor', 'admin')
  )
  OR 
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email LIKE '%@police.gov%'
  )
);

-- Allow users to delete reports they have admin access to
CREATE POLICY "Users can delete reports they have admin access to"
ON public.reports FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.reports_access
    WHERE public.reports_access.report_id = id
    AND public.reports_access.user_id = auth.uid()
    AND public.reports_access.access_level = 'admin'
  )
  OR 
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email LIKE '%@police.gov%'
  )
);

-- Create policies for reports_access table
CREATE POLICY "Users can view their own access entries"
ON public.reports_access FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert access entries for reports they admin"
ON public.reports_access FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.reports_access
    WHERE public.reports_access.report_id = report_id
    AND public.reports_access.user_id = auth.uid()
    AND public.reports_access.access_level = 'admin'
  )
);

CREATE POLICY "Users can update access entries for reports they admin"
ON public.reports_access FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.reports_access
    WHERE public.reports_access.report_id = report_id
    AND public.reports_access.user_id = auth.uid()
    AND public.reports_access.access_level = 'admin'
  )
);

CREATE POLICY "Users can delete access entries for reports they admin"
ON public.reports_access FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.reports_access
    WHERE public.reports_access.report_id = report_id
    AND public.reports_access.user_id = auth.uid()
    AND public.reports_access.access_level = 'admin'
  )
);

-- Storage bucket setup
-- Note: This section uses Supabase-specific storage API
/*
DO $$
BEGIN
  -- Create reports bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('reports', 'reports', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- Create avatars bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', false)
  ON CONFLICT (id) DO NOTHING;
  
  -- Enable RLS on storage objects
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  
  -- Drop all existing storage policies
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Public GET access" ON storage.objects;
  DROP POLICY IF EXISTS "Public PUT access" ON storage.objects;
  DROP POLICY IF EXISTS "Public UPDATE access" ON storage.objects;
  DROP POLICY IF EXISTS "Public DELETE access" ON storage.objects;
  DROP POLICY IF EXISTS "Public SELECT" ON storage.objects;
  DROP POLICY IF EXISTS "Public INSERT" ON storage.objects;
  DROP POLICY IF EXISTS "Public UPDATE" ON storage.objects;
  DROP POLICY IF EXISTS "Public DELETE" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their own objects" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own objects" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own objects" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own objects" ON storage.objects;
  
  -- Create storage policies for public access to reports bucket
  CREATE POLICY "Public can view objects in reports bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'reports');
  
  -- Allow anyone to upload to reports bucket (needed for anonymous users)
  CREATE POLICY "Public can upload to reports bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'reports');
  
  -- Create storage policies for authenticated users
  -- Avatars bucket policies (private to each user)
  CREATE POLICY "Users can view their own avatar"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND name = auth.uid()::text);
  
  CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND name = auth.uid()::text);
  
  CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND name = auth.uid()::text);
  
  CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND name = auth.uid()::text);
  
EXCEPTION
  WHEN unique_violation THEN
    -- Silently handle duplicate bucket creation attempts
END $$;
*/

-- Create a scheduled job to clean up old anonymous users (runs daily)
/*
SELECT cron.schedule(
  'cleanup-anonymous-users',
  '0 0 * * *', -- Run at midnight every day
  $$
    SELECT cleanup_anonymous_users();
  $$
);
*/

-- Storage bucket setup (SQL statements for Supabase)
-- Uncomment and run these in the Supabase SQL editor
/*
-- Create reports bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public GET access" ON storage.objects;
DROP POLICY IF EXISTS "Public PUT access" ON storage.objects;
DROP POLICY IF EXISTS "Public UPDATE access" ON storage.objects;
DROP POLICY IF EXISTS "Public DELETE access" ON storage.objects;
DROP POLICY IF EXISTS "Public SELECT" ON storage.objects;
DROP POLICY IF EXISTS "Public INSERT" ON storage.objects;
DROP POLICY IF EXISTS "Public UPDATE" ON storage.objects;
DROP POLICY IF EXISTS "Public DELETE" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own objects" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own objects" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own objects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own objects" ON storage.objects;

-- Create storage policies for public access to reports bucket
CREATE POLICY "Public can view objects in reports bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'reports');

-- Allow anyone to upload to reports bucket (needed for anonymous users)
CREATE POLICY "Public can upload to reports bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reports');

-- Create storage policies for authenticated users
-- Avatars bucket policies (private to each user)
CREATE POLICY "Users can view their own avatar"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND name = auth.uid()::text);

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND name = auth.uid()::text);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND name = auth.uid()::text);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND name = auth.uid()::text);

-- Create a scheduled job to clean up old anonymous users (runs daily)
SELECT cron.schedule(
  'cleanup-anonymous-users',
  '0 0 * * *', -- Run at midnight every day
  $$
    SELECT public.cleanup_anonymous_users();
  $$
);
*/ 