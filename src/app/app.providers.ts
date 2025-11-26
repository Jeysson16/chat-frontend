import { Provider, EnvironmentProviders } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

// Domain
import { ChatRepository } from './features/chat/domain/repositories/chat.repository';
import { ApplicationRepository as ApplicationRepositoryAbstract } from './features/admin/domain/repositories/application.repository';
import { CompanyRepository as CompanyRepositoryAbstract } from './features/admin/domain/repositories/company.repository';

// Infrastructure
import { ChatRepositoryImpl } from './features/chat/infrastructure/repositories/chat.repository.impl';
import { ChatApiService } from './features/chat/infrastructure/services/chat-api.service';
import { ChatSignalRService } from './features/chat/infrastructure/services/chat-signalr.service';
import { ChatDataAdapter } from './features/chat/infrastructure/adapters/chat-data.adapter';
import { ApplicationRepositoryImpl } from './features/admin/infrastructure/repositories/application.repository';
import { CompanyRepositoryImpl } from './features/admin/infrastructure/repositories/company.repository';

// Use Cases
import { GetConversationsUseCase } from './features/chat/domain/use-cases/get-conversations.use-case';
import { GetMessagesUseCase } from './features/chat/domain/use-cases/get-messages.use-case';
import { SendMessageUseCase } from './features/chat/domain/use-cases/send-message.use-case';
import { GetContactsUseCase } from './features/chat/domain/use-cases/get-contacts.use-case';
import { CreateConversationUseCase } from './features/chat/domain/use-cases/create-conversation.use-case';
import { GetCurrentUserUseCase } from './features/chat/domain/use-cases/get-current-user.use-case';
import { SearchContactsUseCase } from './features/chat/domain/use-cases/search-contacts.use-case';

export const chatProviders: (Provider | EnvironmentProviders)[] = [
  // HTTP Interceptor (registered via DI; main.ts uses withInterceptorsFromDi)
  // Temporarily disabled to avoid conflicts with HybridAuthInterceptor
  // {
  //   provide: HTTP_INTERCEPTORS,
  //   useClass: JwtInterceptor,
  //   multi: true
  // },

  // Infrastructure Services
  ChatApiService,
  ChatSignalRService,
  ChatDataAdapter,
  ApplicationRepositoryImpl,
  CompanyRepositoryImpl,
  
  // Repository Implementation
  {
    provide: ChatRepository,
    useClass: ChatRepositoryImpl
  },
  {
    provide: ApplicationRepositoryAbstract,
    useClass: ApplicationRepositoryImpl
  },
  {
    provide: CompanyRepositoryAbstract,
    useClass: CompanyRepositoryImpl
  },
  
  // Use Cases
  GetConversationsUseCase,
  GetMessagesUseCase,
  SendMessageUseCase,
  GetContactsUseCase,
  CreateConversationUseCase,
  GetCurrentUserUseCase,
  SearchContactsUseCase
];