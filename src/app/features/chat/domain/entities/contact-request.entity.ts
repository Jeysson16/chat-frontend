export interface ContactRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  fromUserAvatar?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  respondedAt?: Date;
}

export interface CreateContactRequestDto {
  toUserId: string;
  message?: string;
  companyId?: string;
  applicationId?: string;
}

export interface RespondToContactRequestDto {
  requestId: string;
  response: 'accept' | 'reject';
}

export interface SearchContactDto {
  query: string;
  companyId?: string;
  applicationId?: string;
}