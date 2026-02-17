import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isldxscqawzzczrlwcci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbGR4c2NxYXd6emN6cmx3Y2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTIwOTYsImV4cCI6MjA4NjkyODA5Nn0.Cz4L2II3Li7Yc2wcl2N6FJlixHQgR6x4WVtnyJIx9wQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tier hierarchy for comparison
export const TIER_ORDER: Record<string, number> = {
    starter: 1,
    standard: 2,
    pro: 3,
    ultra: 4,
};
