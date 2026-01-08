import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface SavedJob {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  location: string;
  job_type: string;
  salary: string;
  date_posted: string;
  apply_link: string;
  source: string;
  notes: string;
  saved_at: string;
}

export interface JobApplication {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  location: string;
  salary: string;
  apply_link: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';
  applied_date: string | null;
  interview_date: string | null;
  notes: string;
  resume_version: string;
  cover_letter: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  resume_text: string | null;
  target_role: string | null;
  location: string | null;
  created_at: string;
}

// Helper functions for anonymous users (using local storage ID)
export function getLocalUserId(): string {
  let userId = localStorage.getItem('agragrati_user_id');
  if (!userId) {
    userId = 'anon_' + crypto.randomUUID();
    localStorage.setItem('agragrati_user_id', userId);
  }
  return userId;
}

// Saved Jobs functions
export async function saveJob(job: Omit<SavedJob, 'id' | 'user_id' | 'saved_at'>): Promise<SavedJob | null> {
  const userId = getLocalUserId();
  
  const { data, error } = await supabase
    .from('saved_jobs')
    .insert({
      ...job,
      user_id: userId,
      saved_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving job:', error);
    return null;
  }
  return data;
}

export async function unsaveJob(jobId: string): Promise<boolean> {
  const { error } = await supabase
    .from('saved_jobs')
    .delete()
    .eq('id', jobId);

  if (error) {
    console.error('Error removing saved job:', error);
    return false;
  }
  return true;
}

export async function getSavedJobs(): Promise<SavedJob[]> {
  const userId = getLocalUserId();
  
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved jobs:', error);
    return [];
  }
  return data || [];
}

export async function isJobSaved(applyLink: string): Promise<boolean> {
  const userId = getLocalUserId();
  
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('id')
    .eq('user_id', userId)
    .eq('apply_link', applyLink)
    .single();

  return !error && !!data;
}

// Job Applications functions
export async function createApplication(app: Omit<JobApplication, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<JobApplication | null> {
  const userId = getLocalUserId();
  
  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      ...app,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating application:', error);
    return null;
  }
  return data;
}

export async function updateApplication(id: string, updates: Partial<JobApplication>): Promise<JobApplication | null> {
  const { data, error } = await supabase
    .from('job_applications')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating application:', error);
    return null;
  }
  return data;
}

export async function deleteApplication(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('job_applications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting application:', error);
    return false;
  }
  return true;
}

export async function getApplications(): Promise<JobApplication[]> {
  const userId = getLocalUserId();
  
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
  return data || [];
}

export async function getApplicationsByStatus(status: JobApplication['status']): Promise<JobApplication[]> {
  const userId = getLocalUserId();
  
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications by status:', error);
    return [];
  }
  return data || [];
}
