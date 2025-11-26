export interface Contact {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  status: ContactStatus;
  companyId: string;
  applicationId: string;
  addedAt: Date;
  addedBy: string;
  // Nuevas propiedades del backend reestructurado
  hasExistingConversation?: boolean;
  existingConversationId?: number;
}

export type ContactStatus = 'pending' | 'accepted' | 'blocked' | 'declined';

export interface ContactRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  fromUserAvatar?: string;
  message?: string;
  status: ContactStatus;
  createdAt: Date;
  respondedAt?: Date;
}

export interface CreateContactRequestDto {
  toUserId: string;
  message?: string;
  companyId: string;
  applicationId: string;
}

export interface RespondToContactRequestDto {
  requestId: string;
  status: 'accepted' | 'declined';
}

export interface SearchContactDto {
  query: string;
  companyId?: string;
  applicationId?: string;
  excludeExistingContacts?: boolean;
}