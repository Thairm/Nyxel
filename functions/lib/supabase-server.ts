// Server-side Supabase client using service_role key
// Used in Cloudflare Functions to bypass RLS for inserts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://isldxscqawzzczrlwcci.supabase.co';

let supabaseServer: SupabaseClient | null = null;

export function getSupabaseServer(serviceKey: string): SupabaseClient {
    if (!supabaseServer) {
        supabaseServer = createClient(SUPABASE_URL, serviceKey, {
            auth: { persistSession: false },
        });
    }
    return supabaseServer;
}

export interface GenerationRecord {
    user_id: string;
    media_url: string;
    media_type: 'image' | 'video';
    prompt: string;
    model_id: number;
}

/**
 * Save a generation record to Supabase.
 * Returns the inserted row's ID.
 */
export async function saveGeneration(
    serviceKey: string,
    record: GenerationRecord
): Promise<string> {
    const supabase = getSupabaseServer(serviceKey);

    const { data, error } = await supabase
        .from('generations')
        .insert(record)
        .select('id')
        .single();

    if (error) {
        throw new Error(`Supabase insert failed: ${error.message}`);
    }

    return data.id;
}
