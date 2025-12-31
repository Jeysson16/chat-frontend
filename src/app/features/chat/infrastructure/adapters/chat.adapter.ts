import { User } from '../../../auth/domain/models/user.model';
import { ChatMessage, ChatUser, Conversation } from '../../domain/models/chat.model';
import { ChatConversacionEntity, ChatMensajeEntity, ChatUsuarioEntity } from '../entities/chat.entity';

/**
 * Adapter to convert between backend entities (database field names) and frontend models (clean English names)
 */
export class ChatAdapter {
  
  /**
   * Convert ChatConversacionEntity to ChatConversation model
   */
  static toConversation(entity: ChatConversacionEntity): Conversation {
    const rawType = (entity.cConversacionesChatTipo || '').toString().toLowerCase();
    const participantsRaw: any[] = (entity as any).participants || [];
    const displayName: string = (entity as any).cdisplayname || '';
    const participants: ChatUser[] = participantsRaw.map(p => ({
      id: p.cParticipantesChatUsuarioId || p.cparticipanteschatuserid || '',
      name: p.cUsuariosChatNombre || p.cusuarioschatname || displayName || '',
      email: p.cUsuariosChatEmail || p.cusuarioschatmail || '',
      avatar: p.cUsuariosChatAvatar || p.cusuarioschatavatar || '',
      role: p.cParticipantesChatRol || p.cparticipanteschatrol || 'user',
      isActive: p.bParticipantesChatEstaActivo ?? p.bparticipanteschatisactive ?? true,
      isOnline: p.bUsuariosChatEstaEnLinea ?? p.bisonline ?? false
    }));
    if (participants.length === 0 && rawType === 'individual' && displayName) {
      participants.push({ id: (entity as any).clastmessagesenderid || '', name: displayName, email: '', role: 'user', isActive: true, isOnline: (entity as any).botherparticipantisonline ?? false, avatar: '' });
    }
    const lastText: string | undefined = (entity as any).clastmessagetext || undefined;
    const lastTime: string | undefined = (entity as any).dtlastmessagetimestamp || undefined;
    const lastSenderId: string | undefined = (entity as any).clastmessagesenderid || undefined;
    const lastSenderName: string | undefined = (entity as any).clastmessagesendername || undefined;
    const unread: number = (entity as any).nunreadcount ?? 0;
    return {
      id: String(entity.nConversacionesChatId ?? (entity as any).nconversacioneschatid ?? ''),
      name: entity.cConversacionesChatNombre || displayName || '',
      type: rawType === 'individual' ? 'private' : 'group',
      createdAt: new Date(entity.dConversacionesChatFechaCreacion || (entity as any).dtconversacioneschatcreatedat || new Date().toISOString()),
      isActive: entity.bConversacionesChatEstaActiva,
      participants,
      lastMessage: lastText ? {
        id: '0',
        conversationId: String(entity.nConversacionesChatId ?? ''),
        senderId: String(lastSenderId || ''),
        senderName: lastSenderName || 'Usuario',
        content: lastText,
        type: 'text',
        timestamp: lastTime ? new Date(lastTime) : new Date(),
        isRead: false
      } : undefined,
      unreadCount: unread
    };
  }

  /**
   * Convert ChatConversation model to ChatConversacionEntity
   */
  static toConversationEntity(model: Partial<Conversation>): Partial<ChatConversacionEntity> {
    return {
      nConversacionesChatId: model.id ? parseInt(model.id) : 0,
      cConversacionesChatNombre: model.name || '',
      cConversacionesChatTipo: model.type === 'private' ? 'individual' : 'group',
      dConversacionesChatFechaCreacion: model.createdAt?.toISOString() || new Date().toISOString(),
      bConversacionesChatEstaActiva: model.isActive ?? true
    };
  }

  /**
   * Convert ChatMensajeEntity to ChatMessage model
   */
  static toMessage(entity: ChatMensajeEntity): ChatMessage {
    return {
      id: entity.nMensajesChatId.toString(),
      conversationId: entity.nMensajesChatConversacionId.toString(),
      senderId: entity.cMensajesChatRemitenteId,
      senderName: entity.cMensajesChatRemitenteNombre || 'Unknown',
      content: entity.cMensajesChatTexto,
      type: this.mapMessageType(entity.cMensajesChatTipo),
      timestamp: new Date(entity.dMensajesChatFechaHora),
      isRead: entity.bMensajesChatEstaLeido
    };
  }

  /**
   * Convert ChatMessage model to ChatMensajeEntity
   */
  static toMessageEntity(model: Partial<ChatMessage>): Partial<ChatMensajeEntity> {
    return {
      nMensajesChatId: model.id ? parseInt(model.id) : 0,
      nMensajesChatConversacionId: model.conversationId ? parseInt(model.conversationId) : 0,
      cMensajesChatRemitenteId: model.senderId || '',
      cMensajesChatTexto: model.content || '',
      cMensajesChatTipo: model.type || 'text',
      dMensajesChatFechaHora: model.timestamp?.toISOString() || new Date().toISOString(),
      bMensajesChatEstaLeido: model.isRead ?? false,
      cMensajesChatRemitenteNombre: model.senderName
    };
  }

  /**
   * Convert ChatUsuarioEntity to ChatUser model
   */
  static toUser(entity: ChatUsuarioEntity): ChatUser {
    return {
      id: entity.cUsuariosChatId,
      name: entity.cUsuariosChatNombre,
      email: entity.cUsuariosChatEmail,
      avatar: entity.cUsuariosChatAvatar,
      role: entity.cUsuariosChatRol,
      isActive: entity.bUsuariosChatEstaActivo,
      isOnline: entity.bUsuariosChatEstaEnLinea,
      lastSeen: entity.dUsuariosChatUltimaConexion ? new Date(entity.dUsuariosChatUltimaConexion) : undefined,
      companyId: entity.cPerJurCodigo,
      companyName: entity.cPerCodigo // Using cPerCodigo as company name for now
    };
  }

  /**
   * Convert ChatUser model to ChatUsuarioEntity
   */
  static toUserEntity(model: Partial<ChatUser>): Partial<ChatUsuarioEntity> {
    return {
      cUsuariosChatId: model.id || '',
      cUsuariosChatNombre: model.name || '',
      cUsuariosChatEmail: model.email || '',
      cUsuariosChatAvatar: model.avatar,
      cUsuariosChatRol: model.role || 'USER',
      bUsuariosChatEstaActivo: model.isActive ?? true,
      bUsuariosChatEstaEnLinea: model.isOnline ?? false,
      dUsuariosChatUltimaConexion: model.lastSeen?.toISOString(),
      cPerJurCodigo: model.companyId,
      cPerCodigo: model.companyName
    };
  }

  /**
   * Convert arrays of entities to models
   */
  static toConversations(entities: ChatConversacionEntity[]): Conversation[] {
    return entities.map(entity => this.toConversation(entity));
  }

  static toMessages(entities: ChatMensajeEntity[]): ChatMessage[] {
    return entities.map(entity => this.toMessage(entity));
  }

  static toUsers(entities: ChatUsuarioEntity[]): ChatUser[] {
    return entities.map(entity => this.toUser(entity));
  }

  /**
   * Map backend message type to frontend message type
   */
  private static mapMessageType(backendType: string): 'text' | 'image' | 'file' | 'system' {
    const typeMap: Record<string, 'text' | 'image' | 'file' | 'system'> = {
      'text': 'text',
      'TEXT': 'text',
      'image': 'image',
      'IMAGEN': 'image',
      'file': 'file',
      'ARCHIVO': 'file',
      'system': 'system',
      'SISTEMA': 'system'
    };
    
    return typeMap[backendType] || 'text';
  }

  /**
   * Convert frontend User model to backend entity query parameters
   * This maps the clean frontend model to backend entity field names
   */
  static userToBackendEntityParams(user: User): Record<string, string> {
    const params: Record<string, string> = {};
    
    if (user?.id) {
      params['userId'] = user.id.toString();
      params['userid'] = user.id.toString();
      params['nPerId'] = user.id.toString();
    }
    
    if (user?.userCode) {
      // Frontend User.userCode maps to backend cPerCodigo (person code)
      params['cPerCodigo'] = user.userCode;
    } else if (user?.id) {
      // Fallback to ID if userCode is not available
      params['cPerCodigo'] = user.id.toString();
    }
    
    if (user?.companyId) {
      params['perJurCodigo'] = user.companyId;
      params['cPerJurCodigo'] = user.companyId;
    } else {
      params['perJurCodigo'] = 'DEFAULT';
      params['cPerJurCodigo'] = 'DEFAULT';
    }
    
    return params;
  }
}
