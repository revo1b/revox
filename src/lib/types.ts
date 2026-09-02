export type Stage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type ContactStatus = 'lead' | 'prospect' | 'customer' | 'inactive';
export type Priority = 'low' | 'medium' | 'high';
export type Folder = 'inbox' | 'sent' | 'archive' | 'waiting';

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  relationship_health: 'healthy' | 'neutral' | 'at_risk';
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  company_id: string | null;
  name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  status: ContactStatus;
  ai_score: number;
  tags: string | null;
  ai_summary: string | null;
  last_activity_at: string | null;
  created_at: string;
  companies?: { name: string } | null;
}

export interface Opportunity {
  id: string;
  title: string;
  contact_id: string | null;
  company_id: string | null;
  value: number;
  stage: Stage;
  probability: number;
  expected_close: string | null;
  next_best_action: string | null;
  next_best_action_reason: string | null;
  ai_summary: string | null;
  last_activity_at: string | null;
  created_at: string;
  contacts?: { name: string; email: string | null; position: string | null } | null;
  companies?: { name: string; id: string } | null;
}

export interface EmailThread {
  id: string;
  subject: string;
  contact_id: string | null;
  company_id: string | null;
  opportunity_id: string | null;
  folder: Folder;
  is_unread: boolean;
  is_important: boolean;
  ai_intent: string | null;
  ai_priority: Priority;
  ai_sentiment: string | null;
  ai_recommended_action: string | null;
  waiting_since: string | null;
  last_message_at: string;
  contacts?: { name: string } | null;
  companies?: { name: string } | null;
  opportunities?: { title: string; value: number; stage: Stage } | null;
}

export interface EmailMessage {
  id: string;
  thread_id: string;
  direction: 'inbound' | 'outbound';
  sender_name: string | null;
  sender_email: string | null;
  body: string;
  is_draft: boolean;
  sent_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  status: 'open' | 'completed';
  contact_id: string | null;
  company_id: string | null;
  opportunity_id: string | null;
  created_at: string;
  contacts?: { name: string } | null;
  companies?: { name: string } | null;
}

export interface Appointment {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  contact_id: string | null;
  company_id: string | null;
  opportunity_id: string | null;
  ai_preparation: string | null;
}

export interface Note {
  id: string;
  contact_id: string | null;
  company_id: string | null;
  opportunity_id: string | null;
  body: string;
  created_at: string;
}

export interface Activity {
  id: string;
  contact_id: string | null;
  company_id: string | null;
  opportunity_id: string | null;
  type: string;
  description: string;
  occurred_at: string;
}

export interface NotificationRow {
  id: string;
  type: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface KnowledgeSource {
  id: string;
  title: string;
  type: string;
  file_path: string | null;
  content: string | null;
  created_at: string;
}

export interface BusinessProfile {
  id: string;
  business_name: string;
  industry: string | null;
  description: string | null;
  services: string | null;
  currency: string;
}
