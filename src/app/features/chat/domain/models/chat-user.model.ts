export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  status?: 'online' | 'away' | 'busy' | 'offline';
  role?: string;
  companyId?: string;
}

export interface ChatUserCreate {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  companyId?: string;
}

export interface ChatUserUpdate {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  role?: string;
}