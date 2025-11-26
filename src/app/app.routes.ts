import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/chat/presentation/chat.page').then((m) => m.ChatPage),
        title: 'Chat - Chat System',
        canActivate: [AuthGuard]
    },
    {
        path: 'chat',
        loadComponent: () => import('./features/chat/presentation/chat.page').then((m) => m.ChatPage),
        title: 'Chat - Chat System',
        canActivate: [AuthGuard]
    },
    {
        path: 'configuration',
        loadChildren: () => import('./features/admin/presentation/admin.module').then((m) => m.AdminModule),
        title: 'Configuration - Chat System',
        canActivate: [AdminGuard]
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/presentation/auth.module').then((m) => m.AuthModule),
        title: 'Authentication - Chat System'
    },
    {
        path: 'admin',
        loadChildren: () => import('./features/admin/presentation/admin.module').then((m) => m.AdminModule),
        title: 'Administration - Chat System',
        canActivate: [AdminGuard]
    },
    {
        path: 'test-signalr',
        loadComponent: () => import('./test-signalr.component').then((m) => m.TestSignalRComponent),
        title: 'SignalR Test - Chat System'
    },
    {
        path: '**',
        redirectTo: '/',
    },
];
