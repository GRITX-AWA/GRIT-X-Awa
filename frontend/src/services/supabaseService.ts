import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabase';

// Initialize the Supabase client
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

export interface Discovery {
  id: string;
  object_id: string;
  discovery_type: string;
  confidence: number;
  discovered_at: string;
  model_used: string;
  metadata?: Record<string, any>;
}

export const getRecentDiscoveries = async (limit: number = 5): Promise<Discovery[]> => {
  try {
    const { data, error } = await supabase
      .from('recent_discoveries')
      .select('*')
      .order('discovered_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent discoveries:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRecentDiscoveries:', error);
    return [];
  }
};

// Add more database functions as needed
export const supabaseService = {
  getRecentDiscoveries,
};
