
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  image_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


ALTER TABLE reports ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Allow public access to reports"
ON reports FOR ALL
USING (true)
WITH CHECK (true);


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


DO $$
BEGIN
  
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('reports', 'reports', true)
  ON CONFLICT (id) DO NOTHING;
  
  
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  
  
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Public GET access" ON storage.objects;
  DROP POLICY IF EXISTS "Public PUT access" ON storage.objects;
  DROP POLICY IF EXISTS "Public UPDATE access" ON storage.objects;
  DROP POLICY IF EXISTS "Public DELETE access" ON storage.objects;
  
  
  
  CREATE POLICY "Public SELECT"
    ON storage.objects FOR SELECT
    USING (true);

  
  CREATE POLICY "Public INSERT"
    ON storage.objects FOR INSERT
    WITH CHECK (true);

  
  CREATE POLICY "Public UPDATE"
    ON storage.objects FOR UPDATE
    USING (true)
    WITH CHECK (true);

  
  CREATE POLICY "Public DELETE"
    ON storage.objects FOR DELETE
    USING (true);

EXCEPTION
  WHEN unique_violation THEN
    
END $$; 