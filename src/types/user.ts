export type UserDTO = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  plan: 'starter' | 'pro' | 'enterprise';
  is_active: boolean;
  address?: { city: string; zip?: string } | null;
};
export type UserVM = {
  id: string;
  displayName: string;
  email: string;
  joinedAt: Date;
  planLabel: string;
  active: boolean;
  city?: string;
  badge: 'NEW' | 'PRO' | 'ENT';
};
