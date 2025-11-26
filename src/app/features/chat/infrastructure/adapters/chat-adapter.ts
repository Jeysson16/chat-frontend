import { ChatUser, Conversation, ChatMessage, Contact, CreateMessageRequest, CreateConversationRequest } from '../models/chat.model';

// Interfaces del backend (entities con nomenclatura rara)
interface BackendChatUser {
  cUsuariosChatId: string;
  cUsuariosChatNombre: string;
  cUsuariosChatEmail: string;
  cUsuariosChatAvatar?: string;
  cUsuariosChatRol?: string;
  bUsuariosChatEstaActivo: boolean;
  bUsuariosChatEnLinea?: boolean;
  dUsuariosChatUltimaConexion?: string;
  cUsuariosChatEmpresaId?: string;
  cUsuariosChatEmpresaNombre?: string;
}

interface BackendConversation {
  nConversacionesChatId: number;
  cConversacionesChatAppCodigo: string;
  cConversacionesChatNombre?: string;
  cConversacionesChatTipo: string;
  dConversacionesChatFechaCreacion: string;
  bConversacionesChatEstaActiva: boolean;
  Participantes?: BackendChatUser[];
  UltimoMensaje?: BackendMessage;
  MensajesNoLeidos?: number;
}

interface BackendMessage {
  id: number;
  conversacion_id: number;
  usuario_id: string;
  usuario_nombre: string;
  texto: string;
  tipo: string;
  fecha_envio: string;
  leido: boolean;
}

interface BackendContact {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  estaActivo: boolean;
  enLinea?: boolean;
  ultimaConexion?: string;
  empresaId?: string;
  empresaNombre?: string;
}

export class ChatAdapter {
  
  static toChatUser(backendUser: BackendChatUser): ChatUser {
    return {
      id: backendUser.cUsuariosChatId,
      name: backendUser.cUsuariosChatNombre,
      email: backendUser.cUsuariosChatEmail,
      avatar: backendUser.cUsuariosChatAvatar,
      role: backendUser.cUsuariosChatRol || 'user',
      isActive: backendUser.bUsuariosChatEstaActivo,
      isOnline: backendUser.bUsuariosChatEnLinea ?? false,
      lastSeen: backendUser.dUsuariosChatUltimaConexion ? new Date(backendUser.dUsuariosChatUltimaConexion) : undefined,
      companyId: backendUser.cUsuariosChatEmpresaId,
      companyName: backendUser.cUsuariosChatEmpresaNombre
    };
  }
  
  static toConversation(backendConversation: BackendConversation): Conversation {
    return {
      id: backendConversation.nConversacionesChatId.toString(),
      name: backendConversation.cConversacionesChatNombre,
      type: this.mapConversationType(backendConversation.cConversacionesChatTipo),
      participants: (backendConversation.Participantes || []).map(p => this.toChatUser(p)),
      lastMessage: backendConversation.UltimoMensaje ? this.toMessage(backendConversation.UltimoMensaje) : undefined,
      unreadCount: backendConversation.MensajesNoLeidos || 0,
      isActive: backendConversation.bConversacionesChatEstaActiva,
      createdAt: new Date(backendConversation.dConversacionesChatFechaCreacion)
    };
  }
  
  static toMessage(backendMessage: BackendMessage): ChatMessage {
    return {
      id: backendMessage.id.toString(),
      conversationId: backendMessage.conversacion_id.toString(),
      senderId: backendMessage.usuario_id,
      senderName: backendMessage.usuario_nombre,
      content: backendMessage.texto,
      type: this.mapMessageType(backendMessage.tipo),
      timestamp: new Date(backendMessage.fecha_envio),
      isRead: backendMessage.leido
    };
  }
  
  static toContact(backendContact: BackendContact): Contact {
    return {
      id: backendContact.id,
      name: backendContact.nombre,
      email: backendContact.email,
      avatar: backendContact.avatar,
      isOnline: backendContact.enLinea ?? false,
      lastSeen: backendContact.ultimaConexion ? new Date(backendContact.ultimaConexion) : undefined,
      companyId: backendContact.empresaId,
      companyName: backendContact.empresaNombre,
      isActive: backendContact.estaActivo
    };
  }
  
  static toBackendCreateMessage(request: CreateMessageRequest): any {
    return {
      conversacion_id: parseInt(request.conversationId),
      texto: request.content,
      tipo: request.type || 'text'
    };
  }
  
  static toBackendCreateConversation(request: CreateConversationRequest): any {
    return {
      cConversacionesChatNombre: request.name,
      cConversacionesChatTipo: request.type.toUpperCase(),
      participantes: request.participantIds
    };
  }
  
  private static mapConversationType(backendType: string): 'private' | 'group' {
    const typeMap: Record<string, 'private' | 'group'> = {
      'PRIVATE': 'private',
      'private': 'private',
      'GROUP': 'group',
      'group': 'group',
      'PRIVADO': 'private',
      'GRUPO': 'group'
    };
    
    return typeMap[backendType] || 'private';
  }
  
  private static mapMessageType(backendType: string): 'text' | 'image' | 'file' | 'system' {
    const typeMap: Record<string, 'text' | 'image' | 'file' | 'system'> = {
      'text': 'text',
      'image': 'image',
      'file': 'file',
      'system': 'system',
      'TEXT': 'text',
      'IMAGEN': 'image',
      'ARCHIVO': 'file'
    };
    
    return typeMap[backendType] || 'text';
  }
}