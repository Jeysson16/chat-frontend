# Modular Features Architecture

This directory contains the modular features of the ChatFrontend application. Each feature is designed to be completely independent and portable, following Clean Architecture principles.

## Structure

Each feature follows this standardized structure:

```
feature-name/
├── config/                 # Feature-specific configuration
│   └── environment.ts      # Environment variables and settings
├── domain/                 # Business logic and entities
│   ├── entities/          # Domain entities and interfaces
│   ├── interfaces/        # Repository and service interfaces
│   └── models/            # Domain models and value objects
├── infrastructure/        # External concerns implementation
│   ├── adapters/          # Data adapters and mappers
│   └── services/          # API services and external integrations
├── presentation/          # UI components and pages
│   ├── components/        # Feature-specific components
│   ├── pages/            # Feature pages
│   └── *.module.ts       # Angular module definition
├── shared/               # Feature-specific shared utilities
│   └── interfaces.ts     # Shared interfaces and types
└── index.ts              # Public API exports
```

## Available Features

### 🔐 Auth Feature
- **Purpose**: Authentication and authorization
- **Location**: `./auth/`
- **Dependencies**: `@angular/core`, `@angular/common`, `@angular/router`, `rxjs`
- **Exports**: User entities, auth services, auth module

### 💬 Chat Feature
- **Purpose**: Real-time messaging with SignalR
- **Location**: `./chat/`
- **Dependencies**: `@angular/core`, `@angular/common`, `@angular/router`, `rxjs`, `@microsoft/signalr`
- **Exports**: Chat entities, SignalR service, chat components

### ⚙️ Admin Feature
- **Purpose**: Application administration and management
- **Location**: `./admin/`
- **Dependencies**: `@angular/core`, `@angular/common`, `@angular/router`, `@angular/forms`, `rxjs`
- **Exports**: Admin entities, application services, admin module

### 🏢 Companies Feature
- **Purpose**: Company management
- **Location**: `./companies/`
- **Dependencies**: `@angular/core`, `@angular/common`, `@angular/router`, `@angular/forms`, `rxjs`
- **Exports**: Company services, company components

## Using Features

### Importing a Feature
Each feature exposes its public API through its `index.ts` file:

```typescript
// Import specific exports
import { AuthService, UserEntity } from './features/auth';
import { ChatService, ChatMessage } from './features/chat';

// Import feature metadata
import { AUTH_FEATURE, CHAT_FEATURE } from './features/auth';
```

### Feature Independence
Each feature is designed to be:
- **Self-contained**: All dependencies are clearly defined
- **Portable**: Can be moved to other projects with minimal changes
- **Testable**: Each layer can be tested independently
- **Maintainable**: Clear separation of concerns

### Moving Features Between Projects
To move a feature to another project:

1. Copy the entire feature directory
2. Install the required dependencies listed in the feature metadata
3. Import the feature module in your app module
4. Update any project-specific configurations in `config/environment.ts`

## Development Guidelines

### Adding New Features
1. Create the feature directory structure
2. Implement domain entities and interfaces first
3. Create infrastructure services
4. Build presentation components
5. Export public API through `index.ts`
6. Update this README with feature information

### Feature Communication
Features should communicate through:
- **Shared services** in the core module
- **Events** using Angular's dependency injection
- **State management** (if using NgRx or similar)
- **Avoid direct imports** between features when possible

### Configuration
Each feature has its own `config/environment.ts` for feature-specific settings. Global configuration should remain in the main environment files.

## Benefits

✅ **Modularity**: Features can be developed independently  
✅ **Reusability**: Features can be shared across projects  
✅ **Maintainability**: Clear boundaries and responsibilities  
✅ **Testability**: Each feature can be tested in isolation  
✅ **Scalability**: Easy to add new features without affecting existing ones  
✅ **Team Collaboration**: Different teams can work on different features  

## Migration Notes

This structure was migrated from a traditional Angular structure to improve:
- Code organization and maintainability
- Feature independence and portability
- Development team productivity
- Testing capabilities
- Long-term scalability