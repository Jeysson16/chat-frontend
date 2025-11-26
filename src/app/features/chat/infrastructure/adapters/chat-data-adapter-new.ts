import { Injectable } from '@angular/core';
import { 
  ChatUser, 
  ChatMessage, 
  ChatConversation, 
  CreateChatMessageDto,
  CreateConversationDto,
  ConversationPreview,
  Contact
} from '../../domain/entities';

/**
 * DTOs reestructurados para el backend
 * Basado en: Chat_Backend_Architecture_Refactor.md
 * Coinciden con los DTOs del backend ChatDtosNew.cs
 */
export interface ChatConversationDtoNew {
  nconversacioneschatid: number;
  cconversacioneschatname?: string;
  cconversacioneschattype: string;
  dtconversacioneschatcreatedat: string;
  dtconversacioneschatupdatedat: string;
  bconversacioneschatisactive: boolean;
  clastmessagetext?: string;
  dtlastmessagetimestamp?: string;
  clastmessagesenderid?: string;
  clastmessagesendername?: string;
  nunreadcount: number;
  cdisplayname?: string;
  botherparticipantisonline: boolean;
  participants?: ChatParticipantDtoNew[];
}

export interface ChatMessageDtoNew {
  nmensajeschatid: number;
  nconversacioneschatid: number;
  cmensajeschatemisorid: string;
  cmensajeschattexto: string;
  cmensajeschattype: string;
  dtmensajeschattimestamp: string;
  bmensajeschatleido: boolean;
  csendername?: string;
  csenderavatar?: string;
  bsenderisonline: boolean;
}

export interface ChatUserDtoNew {
  cusuarioschatid: string;
  cusuarioschatname: string;
  cusuarioschatmail?: string;
  cusuarioschatavatar?: string;
  bisonline: boolean;
  dtusuarioschatultimavez?: string;
  dtusuarioschatcreatedat?: string;
  bhasexistingconversation: boolean;
  nexistingconversationid?: number;
}

export interface ChatParticipantDtoNew {
  nparticipanteschatid: number;
  nconversacioneschatid: number;
  cparticipanteschatuserid: string;
  dtparticipanteschatjoinedat: string;
  cparticipanteschatrol: string;
  bparticipanteschatisactive: boolean;
  cusuarioschatname?: string;
  cusuarioschatmail?: string;
  cusuarioschatavatar?: string;
  bisonline?: boolean;
}

export interface CreateChatMessageRequestDtoNew {
  nconversacioneschatid: number;
  cmensajeschattexto: string;
  cmensajeschattype: string;
}

export interface CreateChatConversationRequestDtoNew {
  cconversacioneschatname?: string;
  cconversacioneschattype: string;
  cparticipantids: string[];
  ncompanyid: number;
  napplicationid: number;
}

export interface SearchChatContactsRequestDtoNew {
  csearchterm: string;
}

export interface GetChatMessagesRequestDtoNew {
  nconversacioneschatid: number;
  npage: number;
  npagesize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatDataAdapterNew {
  
  /**
   * Adapta un usuario del backend al modelo del frontend
   */
  adaptChatUser(dto: ChatUserDtoNew): ChatUser {
    return {
      id: dto.cusuarioschatid,
      personJuridicalCode: '', // No disponible en la nueva estructura
      personCode: '', // No disponible en la nueva estructura
      name: dto.cusuarioschatname,
      email: dto.cusuarioschatmail || '',
      lastConnection: dto.dtusuarioschatultimavez ? new Date(dto.dtusuarioschatultimavez) : undefined,
      lastSeen: dto.dtusuarioschatultimavez ? new Date(dto.dtusuarioschatultimavez) : undefined,
      isActive: true, // Assume active if in the system
      isOnline: dto.bisonline,
      role: 'user', // Rol por defecto
      avatar: dto.cusuarioschatavatar || '',
      createdAt: dto.dtusuarioschatcreatedat ? new Date(dto.dtusuarioschatcreatedat) : undefined
    };
  }

  /**
   * Adapta un contacto del backend al modelo del frontend
   */
  adaptContact(dto: ChatUserDtoNew): Contact {
    return {
      id: dto.cusuarioschatid,
      userId: dto.cusuarioschatid,
      name: dto.cusuarioschatname,
      email: dto.cusuarioschatmail || '',
      avatar: dto.cusuarioschatavatar || '',
      isOnline: dto.bisonline,
      lastSeen: dto.dtusuarioschatultimavez ? new Date(dto.dtusuarioschatultimavez) : undefined,
      status: 'accepted', // Estado por defecto
      companyId: '', // No disponible en la nueva estructura
      applicationId: '', // No disponible en la nueva estructura
      addedAt: dto.dtusuarioschatcreatedat ? new Date(dto.dtusuarioschatcreatedat) : new Date(),
      addedBy: '', // No disponible en la nueva estructura
      hasExistingConversation: dto.bhasexistingconversation,
      existingConversationId: dto.nexistingconversationid
    };
  }

  /**
   * Adapta un mensaje del backend al modelo del frontend
   */
  adaptChatMessage(dto: ChatMessageDtoNew): ChatMessage {
    return {
      id: dto.nmensajeschatid,
      conversationId: dto.nconversacioneschatid,
      senderId: dto.cmensajeschatemisorid,
      senderName: dto.csendername || 'Usuario',
      text: dto.cmensajeschattexto,
      type: dto.cmensajeschattype as 'text' | 'file' | 'image' | 'system',
      timestamp: new Date(dto.dtmensajeschattimestamp),
      isRead: dto.bmensajeschatleido,
      senderAvatar: dto.csenderavatar,
      senderIsOnline: dto.bsenderisonline
    };
  }

  /**
   * Adapta un DTO de creación de mensaje del frontend al backend
   */
  adaptCreateMessageToBackend(dto: CreateChatMessageDto): CreateChatMessageRequestDtoNew {
    return {
      nconversacioneschatid: dto.conversationId,
      cmensajeschattexto: dto.text,
      cmensajeschattype: dto.type || 'text'
    };
  }

  /**
   * Adapta una conversación del backend al modelo del frontend
   */
  adaptChatConversation(dto: ChatConversationDtoNew): ChatConversation {
    // Crear participantes basados en la información disponible
    const participants: ChatUser[] = [];
    
    // Si hay participantes en el DTO, usarlos
    if (dto.participants && dto.participants.length > 0) {
      participants.push(...dto.participants.map(p => ({
        id: p.cparticipanteschatuserid,
        personJuridicalCode: '',
        personCode: '',
        name: p.cusuarioschatname || 'Usuario',
        email: p.cusuarioschatmail || '',
        lastConnection: undefined,
        lastSeen: undefined,
        isActive: p.bparticipanteschatisactive,
        isOnline: p.bisonline || false,
        role: p.cparticipanteschatrol || 'user',
        avatar: p.cusuarioschatavatar || '',
        createdAt: undefined
      })));
    } else if (dto.cconversacioneschattype === 'individual' && dto.cdisplayname) {
      // Fallback para conversaciones individuales sin participantes explícitos
      participants.push({
        id: dto.clastmessagesenderid || 'unknown',
        personJuridicalCode: '',
        personCode: '',
        name: dto.cdisplayname,
        email: '',
        lastConnection: undefined,
        lastSeen: undefined,
        isActive: true,
        isOnline: dto.botherparticipantisonline,
        role: 'user',
        avatar: '',
        createdAt: undefined
      });
    }

    return {
      id: dto.nconversacioneschatid,
      name: dto.cconversacioneschatname || dto.cdisplayname || 'Conversación',
      type: dto.cconversacioneschattype as 'individual' | 'group',
      createdAt: new Date(dto.dtconversacioneschatcreatedat),
      participants: participants,
      lastMessage: dto.clastmessagetext ? {
        id: 0, // No disponible
        conversationId: dto.nconversacioneschatid,
        senderId: dto.clastmessagesenderid || '',
        senderName: dto.clastmessagesendername || 'Usuario',
        text: dto.clastmessagetext,
        type: 'text',
        timestamp: dto.dtlastmessagetimestamp ? new Date(dto.dtlastmessagetimestamp) : new Date(),
        isRead: false
      } : undefined,
      unreadCount: dto.nunreadcount
    };
  }

  /**
   * Adapta una conversación del backend a una vista previa para el frontend
   */
  adaptConversationPreview(dto: ChatConversationDtoNew): ConversationPreview {
    // Crear participantes basados en la información disponible
    const participants: ChatUser[] = [];
    
    // Si hay participantes en el DTO, usarlos
    if (dto.participants && dto.participants.length > 0) {
      participants.push(...dto.participants.map(p => ({
        id: p.cparticipanteschatuserid,
        personJuridicalCode: '',
        personCode: '',
        name: p.cusuarioschatname || 'Usuario',
        email: p.cusuarioschatmail || '',
        lastConnection: undefined,
        lastSeen: undefined,
        isActive: p.bparticipanteschatisactive,
        isOnline: p.bisonline || false,
        role: p.cparticipanteschatrol || 'user',
        avatar: p.cusuarioschatavatar || '',
        createdAt: undefined
      })));
    } else if (dto.cconversacioneschattype === 'individual' && dto.cdisplayname) {
      // Fallback para conversaciones individuales sin participantes explícitos
      participants.push({
        id: dto.clastmessagesenderid || 'unknown',
        personJuridicalCode: '',
        personCode: '',
        name: dto.cdisplayname,
        email: '',
        lastConnection: undefined,
        lastSeen: undefined,
        isActive: true,
        isOnline: dto.botherparticipantisonline,
        role: 'user',
        avatar: '',
        createdAt: undefined
      });
    }

    return {
      id: dto.nconversacioneschatid,
      name: dto.cconversacioneschatname || dto.cdisplayname || 'Conversación',
      type: dto.cconversacioneschattype as 'individual' | 'group',
      lastMessage: dto.clastmessagetext,
      lastMessageTime: dto.dtlastmessagetimestamp ? new Date(dto.dtlastmessagetimestamp) : undefined,
      unreadCount: dto.nunreadcount,
      participants: participants,
      displayName: dto.cdisplayname,
      otherParticipantIsOnline: dto.botherparticipantisonline
    };
  }

  /**
   * Adapta un DTO de creación de conversación del frontend al backend
   */
  adaptCreateConversationToBackend(dto: CreateConversationDto): CreateChatConversationRequestDtoNew {
    return {
      cconversacioneschatname: dto.name,
      cconversacioneschattype: dto.type,
      cparticipantids: dto.participantIds,
      ncompanyid: 1, // Default value, should be set from context
      napplicationid: 1 // Default value, should be set from context
    };
  }

  /**
   * Adapta un DTO de búsqueda de contactos del frontend al backend
   */
  adaptSearchContactsToBackend(userId: string, searchTerm: string = ''): SearchChatContactsRequestDtoNew {
    return {
      csearchterm: searchTerm
    };
  }

  /**
   * Adapta una lista de conversaciones del backend al frontend
   */
  adaptConversationList(dtos: ChatConversationDtoNew[]): ConversationPreview[] {
    return dtos.map(dto => this.adaptConversationPreview(dto));
  }

  /**
   * Adapta una lista de mensajes del backend al frontend
   */
  adaptMessageList(dtos: ChatMessageDtoNew[]): ChatMessage[] {
    return dtos.map(dto => this.adaptChatMessage(dto));
  }

  /**
   * Adapta una lista de usuarios/contactos del backend al frontend
   */
  adaptContactList(dtos: ChatUserDtoNew[]): Contact[] {
    return dtos.map(dto => this.adaptContact(dto));
  }

  /**
   * Adapta una lista de usuarios del backend al frontend
   */
  adaptUserList(dtos: ChatUserDtoNew[]): ChatUser[] {
    return dtos.map(dto => this.adaptChatUser(dto));
  }

  /**
   * Método auxiliar para validar DTOs
   */
  private validateDto<T>(dto: T, requiredFields: (keyof T)[]): boolean {
    if (!dto) return false;
    
    return requiredFields.every(field => {
      const value = dto[field];
      return value !== null && value !== undefined && value !== '';
    });
  }

  /**
   * Método auxiliar para manejar fechas
   */
  private parseDate(dateString?: string): Date | undefined {
    if (!dateString) return undefined;
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  }

  /**
   * Método auxiliar para formatear fechas para el backend
   */
  private formatDateForBackend(date: Date): string {
    return date.toISOString();
  }

  /**
   * Método auxiliar para obtener el nombre de visualización de una conversación
   */
  getConversationDisplayName(conversation: ChatConversationDtoNew, currentUserId: string): string {
    if (conversation.cconversacioneschattype === 'group') {
      return conversation.cconversacioneschatname || 'Grupo sin nombre';
    }
    
    // Para conversaciones individuales, usar el displayName del backend
    return conversation.cdisplayname || 'Usuario';
  }

  /**
   * Método auxiliar para determinar si un usuario está online
   */
  isUserOnline(user: ChatUserDtoNew): boolean {
    return user.bisonline;
  }

  /**
   * Método auxiliar para obtener el tiempo transcurrido desde la última conexión
   */
  getLastSeenText(lastSeen?: string): string {
    if (!lastSeen) return 'Nunca visto';
    
    const lastSeenDate = this.parseDate(lastSeen);
    if (!lastSeenDate) return 'Nunca visto';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return lastSeenDate.toLocaleDateString();
  }
}