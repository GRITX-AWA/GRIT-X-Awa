/**
 * Supabase configuration for frontend
 * Used to fetch dataset chunks from Supabase Storage
 */

export const SUPABASE_CONFIG = {
  url: import.meta.env.PUBLIC_SUPABASE_URL || 'https://nafpqdeyshrdstecqldc.supabase.co',
  anonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZnBxZGV5c2hyZHN0ZWNxbGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzE4NTksImV4cCI6MjA3NTEwNzg1OX0.rIVupsC8ivhfzuin2kYkP6XLxhulj9EOGSA4gyk4QcM',
  bucket: 'exoplanet_csvs'
};

/**
 * Get public URL for a file in Supabase Storage
 */
export function getSupabasePublicUrl(path: string): string {
  return `${SUPABASE_CONFIG.url}/storage/v1/object/public/${SUPABASE_CONFIG.bucket}/${path}`;
}
