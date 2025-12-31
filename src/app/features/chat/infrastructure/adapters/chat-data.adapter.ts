import { Injectable } from '@angular/core';
import { 
  ChatUser, 
  ChatMessage, 
  Conversation, 
  CreateMessageRequest,
  CreateConversationRequest,
  Contact
} from '../../domain/models/chat.model';

import {
  ChatUsuarioDto,
  ChatMensajeDto,
  ChatConversacionDto,
  EnviarMensajeDto,
  CrearConversacionDto
} from '../services/chat-api.service';

@Injectable({
  providedIn: 'root'
})
export class ChatDataAdapter {
  // User adapters
  adaptChatUser(dto: ChatUsuarioDto): ChatUser {
    return {
      id: dto.id,
      name: dto.nombre,
      email: dto.email,
      lastSeen: dto.ultima_conexion ? new Date(dto.ultima_conexion) : undefined,
      isOnline: dto.en_linea,
      avatar: dto.avatar,
      role: dto.rol || 'user',
      isActive: dto.activo || true
    };
  }

  adaptContact(dto: any): Contact {
    return {
      id: dto.id,
      name: dto.nombre,
      email: dto.email,
      avatar: dto.avatar,
      isOnline: dto.en_linea || false,
      lastSeen: dto.ultima_conexion ? new Date(dto.ultima_conexion) : undefined,
      isActive: dto.activo || true
    };
  }

  // Message adapters
  adaptChatMessage(dto: ChatMensajeDto): ChatMessage {
    return {
      id: dto.id.toString(),
      conversationId: dto.conversacion_id.toString(),
      senderId: dto.usuario_id,
      senderName: dto.usuario_nombre,
      content: dto.texto,
      type: dto.tipo as 'text' | 'image' | 'file' | 'system',
      timestamp: new Date(dto.fecha_envio),
      isRead: dto.leido
    };
  }

  adaptCreateMessageToBackend(dto: CreateMessageRequest): EnviarMensajeDto {
    return {
      nConversacionesChatId: parseInt(dto.conversationId),
      cMensajesChatTexto: dto.content,
      cMensajesChatTipo: dto.type || 'text'
    };
  }

  // Conversation adapters
  adaptChatConversation(dto: ChatConversacionDto): Conversation {
    return {
      id: dto.id.toString(),
      name: dto.nombre,
      type: dto.tipo === 'individual' ? 'private' : 'group',
      participants: dto.participantes.map(p => this.adaptChatUser(p)),
      lastMessage: dto.ultimo_mensaje ? this.adaptChatMessage(dto.ultimo_mensaje) : undefined,
      unreadCount: dto.mensajes_no_leidos || 0,
      isActive: true,
      createdAt: new Date(dto.fecha_creacion)
    };
  }

  adaptConversationPreview(dto: ChatConversacionDto | any): Conversation {
    const id = (dto.id ?? dto.nConversacionesChatId ?? dto.nconversacioneschatid ?? '').toString();
    const typeRaw = (dto.tipo ?? dto.cConversacionesChatTipo ?? dto.cconversacioneschattype ?? '').toString().toLowerCase();
    const tipo = typeRaw === 'individual' ? 'private' : 'group';
    const participantsRaw = dto.participantes ?? dto.participants ?? [];
    const participants = Array.isArray(participantsRaw) ? participantsRaw.map((p: any) => this.adaptChatUser(p)) : [];
    const last = dto.ultimo_mensaje ?? undefined;
    const lastText = dto.clastmessagetext ?? last?.texto ?? undefined;
    const lastSenderId = dto.clastmessagesenderid ?? last?.usuario_id ?? undefined;
    const lastSenderName = dto.clastmessagesendername ?? last?.usuario_nombre ?? undefined;
    const lastTime = dto.dtlastmessagetimestamp ?? last?.fecha_envio ?? undefined;
    const name = dto.nombre ?? dto.cConversacionesChatNombre ?? dto.cconversacioneschatname ?? dto.cdisplayname ?? '';
    const createdAtRaw = dto.fecha_creacion ?? dto.dConversacionesChatFechaCreacion ?? dto.dtconversacioneschatcreatedat ?? new Date().toISOString();
    const unread = dto.mensajes_no_leidos ?? dto.nunreadcount ?? 0;
    return {
      id,
      name,
      type: tipo,
      participants,
      lastMessage: lastText ? {
        id: (dto.ultimo_mensaje?.id ?? 0).toString(),
        conversationId: id,
        senderId: (lastSenderId ?? '').toString(),
        senderName: lastSenderName ?? '',
        content: lastText,
        type: 'text',
        timestamp: lastTime ? new Date(lastTime) : new Date(),
        isRead: false
      } : undefined,
      unreadCount: Number(unread) || 0,
      isActive: true,
      createdAt: new Date(createdAtRaw)
    };
  }

  adaptCreateConversationToBackend(dto: CreateConversationRequest): CrearConversacionDto {
    return {
      Nombre: dto.name || '',
      cConversacionesChatNombre: dto.name || '',
      cConversacionesChatTipo: dto.type,
      participante_ids: dto.participantIds
    };
  }
}
