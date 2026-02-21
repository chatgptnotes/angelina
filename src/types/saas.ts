export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  company: string;
  role: 'designer' | 'contractor' | 'architect' | 'other';
  avatar_url: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  org_id: string | null;
  phone: string | null;
  currency: string;
  tax_rate: number;
  margin_preset: number;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  logo_url: string | null;
  address: string | null;
  owner_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  invited_by: string | null;
  invited_email: string | null;
  status: 'pending' | 'active';
  joined_at: string;
  profile?: Profile;
}

export interface ActivityLogEntry {
  id: string;
  org_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  profile?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'project_shared' | 'comment' | 'approval' | 'team_invite' | 'system';
  title: string;
  message: string | null;
  read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  org_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due';
  projects_used: number;
  ai_extractions_used: number;
  current_period_start: string;
  current_period_end: string;
}

export interface PricingPlan {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: number;
  features: string[];
  limits: {
    projects: number;
    rooms_per_project: number;
    export: boolean;
    ai_extraction: boolean;
    team: boolean;
    api: boolean;
    white_label: boolean;
  };
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free', name: 'Free', price: 0,
    features: ['2 projects', '5 rooms per project', 'Basic BOQ creation', 'Watermark on PDF'],
    limits: { projects: 2, rooms_per_project: 5, export: false, ai_extraction: false, team: false, api: false, white_label: false }
  },
  {
    id: 'pro', name: 'Pro', price: 29,
    features: ['Unlimited projects', 'AI extraction', 'Excel/PDF export', 'Client sharing', 'Priority email support'],
    limits: { projects: 999999, rooms_per_project: 999999, export: true, ai_extraction: true, team: false, api: false, white_label: false }
  },
  {
    id: 'enterprise', name: 'Enterprise', price: 99,
    features: ['Everything in Pro', 'Team collaboration', 'API access', 'Priority support', 'White-label reports', 'Custom branding'],
    limits: { projects: 999999, rooms_per_project: 999999, export: true, ai_extraction: true, team: true, api: true, white_label: true }
  }
];
