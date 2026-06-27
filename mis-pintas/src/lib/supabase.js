import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ldjmvvuqcrhvvnojxtyg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkam12dnVxY3JodnZub2p4dHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1ODMxMjcsImV4cCI6MjA5ODE1OTEyN30.yCO-Jteb5GIa5yslLH1BULpgPviIZryqWChS-gA1CQ0'

export const supabase = createClient(supabaseUrl, supabaseKey)