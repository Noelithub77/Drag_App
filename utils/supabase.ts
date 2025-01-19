import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dszccundlyavftavfljq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzemNjdW5kbHlhdmZ0YXZmbGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ1OTg1MzAsImV4cCI6MjA0MDE3NDUzMH0.KNYjh3Lf667cZzgU11ACDIfztwZ3PYcokwOE3hwIqZ8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
