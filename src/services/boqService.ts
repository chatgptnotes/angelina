import supabase from './supabase';
import type { BOQProject, BOQRoom, BOQItem, BOQDocument } from '../types/boq';

export class BOQService {
  // ===== PROJECTS =====
  static async getProjects(): Promise<BOQProject[]> {
    const { data, error } = await supabase
      .from('boq_projects')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getProject(id: string): Promise<BOQProject | null> {
    const { data, error } = await supabase
      .from('boq_projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async createProject(project: Partial<BOQProject>): Promise<BOQProject> {
    const { data, error } = await supabase
      .from('boq_projects')
      .insert({ ...project, currency: project.currency || 'USD' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateProject(id: string, updates: Partial<BOQProject>): Promise<void> {
    const { error } = await supabase
      .from('boq_projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  // ===== ROOMS =====
  static async getRooms(projectId: string): Promise<BOQRoom[]> {
    const { data, error } = await supabase
      .from('boq_rooms')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  static async createRoom(room: Partial<BOQRoom>): Promise<BOQRoom> {
    const { data, error } = await supabase
      .from('boq_rooms')
      .insert(room)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateRoom(id: string, updates: Partial<BOQRoom>): Promise<void> {
    const { error } = await supabase
      .from('boq_rooms')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  }

  static async deleteRoom(id: string): Promise<void> {
    const { error } = await supabase.from('boq_rooms').delete().eq('id', id);
    if (error) throw error;
  }

  // ===== BOQ ITEMS =====
  static async getItems(projectId: string): Promise<BOQItem[]> {
    const { data, error } = await supabase
      .from('boq_items')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  static async getItemsByRoom(roomId: string): Promise<BOQItem[]> {
    const { data, error } = await supabase
      .from('boq_items')
      .select('*')
      .eq('room_id', roomId)
      .order('category', { ascending: true })
      .order('order', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  static async createItem(item: Partial<BOQItem>): Promise<BOQItem> {
    const amount = (item.quantity || 0) * (item.rate || 0);
    const { data, error } = await supabase
      .from('boq_items')
      .insert({ ...item, amount, source: item.source || 'manual' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateItem(id: string, updates: Partial<BOQItem>): Promise<void> {
    if (updates.quantity !== undefined || updates.rate !== undefined) {
      // Recalculate amount
      const { data: existing } = await supabase.from('boq_items').select('quantity, rate').eq('id', id).single();
      if (existing) {
        const qty = updates.quantity ?? existing.quantity;
        const rate = updates.rate ?? existing.rate;
        updates.amount = qty * rate;
      }
    }
    const { error } = await supabase.from('boq_items').update(updates).eq('id', id);
    if (error) throw error;
  }

  static async deleteItem(id: string): Promise<void> {
    const { error } = await supabase.from('boq_items').delete().eq('id', id);
    if (error) throw error;
  }

  static async bulkCreateItems(items: Partial<BOQItem>[]): Promise<BOQItem[]> {
    const prepared = items.map(item => ({
      ...item,
      amount: (item.quantity || 0) * (item.rate || 0),
      source: item.source || 'ai_extracted'
    }));
    const { data, error } = await supabase
      .from('boq_items')
      .insert(prepared)
      .select();
    if (error) throw error;
    return data || [];
  }

  // ===== DOCUMENTS =====
  static async getDocuments(projectId: string): Promise<BOQDocument[]> {
    const { data, error } = await supabase
      .from('boq_documents')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async uploadDocument(
    projectId: string,
    file: File,
    fileType: BOQDocument['file_type']
  ): Promise<BOQDocument> {
    // Upload to Supabase Storage
    const fileName = `${projectId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('boq-documents')
      .upload(fileName, file);
    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('boq-documents')
      .getPublicUrl(fileName);

    // Create document record
    const { data, error } = await supabase
      .from('boq_documents')
      .insert({
        project_id: projectId,
        filename: file.name,
        file_url: urlData.publicUrl,
        file_type: fileType,
        file_size: file.size,
        processing_status: 'pending'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // ===== CALCULATIONS =====
  static async getProjectTotals(projectId: string) {
    const items = await this.getItems(projectId);
    const rooms = await this.getRooms(projectId);

    const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

    // Group by category
    const byCategory: Record<string, { count: number; amount: number }> = {};
    items.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = { count: 0, amount: 0 };
      }
      byCategory[item.category].count++;
      byCategory[item.category].amount += item.amount || 0;
    });

    // Group by room
    const byRoom: Record<string, { name: string; count: number; amount: number }> = {};
    rooms.forEach(room => {
      byRoom[room.id] = { name: room.name, count: 0, amount: 0 };
    });
    items.forEach(item => {
      if (item.room_id && byRoom[item.room_id]) {
        byRoom[item.room_id].count++;
        byRoom[item.room_id].amount += item.amount || 0;
      }
    });

    return {
      totalAmount,
      totalItems: items.length,
      totalRooms: rooms.length,
      byCategory,
      byRoom,
      aiExtracted: items.filter(i => i.source === 'ai_extracted').length,
      manualItems: items.filter(i => i.source === 'manual').length
    };
  }
}
