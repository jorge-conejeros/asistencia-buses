import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dkdinnqnpicownqyfbbi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZGlubnFucGljb3ducXlmYmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MjQzOTYsImV4cCI6MjA4OTUwMDM5Nn0.vG8zdrcNLzinjzJ-yBcAxmNWZ1NlPUy1nG4haWRYG8s'

export const supabase = createClient(supabaseUrl, supabaseKey)