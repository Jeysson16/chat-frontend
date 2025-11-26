import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app/app.routes';
import { configurationProviders } from './app/core/providers/configuration.providers';
import { authProviders } from './app/core/providers/auth.providers';
import { chatProviders } from './app/app.providers';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    ...configurationProviders,
    ...authProviders,
    ...chatProviders
  ]
}).catch(err => console.error(err));