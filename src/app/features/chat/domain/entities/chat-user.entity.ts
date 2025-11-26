export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  status?: 'online' | 'offline' | 'away' | 'busy';
}