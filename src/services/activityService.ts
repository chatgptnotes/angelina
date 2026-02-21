import { supabase } from './supabase';
import type { ActivityLogEntry } from '../types/saas';

export const ActivityService = {
  async log(action: string, entityType?: string, entityId?: string, details?: Record<string, unknown>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('org_id').eq('user_id', user.id).single();
      await supabase.from('activity_log').insert({
        user_id: user.id,
        org_id: profile?.org_id || null,
        action, entity_type: entityType || null, entity_id: entityId || null,
        details: details || null
      });
    } catch { /* silent */ }
  },

  async getActivities(filters?: { orgId?: string; userId?: string; action?: string; from?: string; to?: string; limit?: number }): Promise<ActivityLogEntry[]> {
    try {
      let query = supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(filters?.limit || 50);
      if (filters?.orgId) query = query.eq('org_id', filters.orgId);
      if (filters?.userId) query = query.eq('user_id', filters.userId);
      if (filters?.action) query = query.eq('action', filters.action);
      if (filters?.from) query = query.gte('created_at', filters.from);
      if (filters?.to) query = query.lte('created_at', filters.to);
      const { data } = await query;
      return (data || []) as ActivityLogEntry[];
    } catch { return []; }
  },

  async getProjectActivities(entityId: string): Promise<ActivityLogEntry[]> {
    try {
      const { data } = await supabase.from('activity_log').select('*').eq('entity_id', entityId).order('created_at', { ascending: false }).limit(50);
      return (data || []) as ActivityLogEntry[];
    } catch { return []; }
  }
};
