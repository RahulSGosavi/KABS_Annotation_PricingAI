import { supabase } from './supabase';
import { Project } from '../types';

export const projectService = {
  /**
   * Upload PDF to Supabase Storage and return public URL
   */
  async uploadProjectPdf(userId: string, file: File): Promise<{ publicUrl: string | null, error: any }> {
    // Sanitize filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return { publicUrl: null, error: uploadError };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('project-files')
      .getPublicUrl(fileName);

    return { publicUrl, error: null };
  },

  /**
   * Fetch all projects for a specific user from Supabase
   */
  async getProjects(userId: string): Promise<{ data: Project[], error: any }> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return { data: [], error };
    }

    return { data: data as Project[], error: null };
  },

  /**
   * Create a new project in Supabase
   */
  async createProject(project: Partial<Project>): Promise<{ data: Project | null, error: any }> {
    const payload = {
      ...project,
      updated_at: new Date().toISOString(),
      annotations: project.annotations || []
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return { data: null, error };
    }

    return { data: data as Project, error: null };
  },

  /**
   * Update an existing project
   */
  async updateProject(id: string, updates: Partial<Project>): Promise<{ error: any }> {
    const { error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating project:', error);
    }
    
    return { error };
  },

  /**
   * Delete a project and its associated file
   */
  async deleteProject(id: string): Promise<{ error: any }> {
    // 1. Try to fetch the project to get the PDF URL for cleanup
    const { data: project } = await supabase
      .from('projects')
      .select('pdf_url')
      .eq('id', id)
      .single();

    // 2. If PDF exists, try to delete from storage
    if (project?.pdf_url) {
      try {
         // The URL structure depends on Supabase configuration.
         // We assume standard structure and split by the bucket name 'project-files' to get the relative path.
         const parts = project.pdf_url.split('/project-files/');
         if (parts.length > 1) {
             const path = decodeURIComponent(parts[1]);
             await supabase.storage.from('project-files').remove([path]);
         }
      } catch (err) {
         console.warn("Storage cleanup warning:", err);
         // We continue with DB deletion even if storage cleanup fails
      }
    }

    // 3. Delete the record from DB
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
    }

    return { error };
  },

  /**
   * Get a single project by ID
   */
  async getProject(id: string): Promise<{ data: Project | null, error: any }> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return { data: null, error };
    }

    return { data: data as Project, error: null };
  }
};