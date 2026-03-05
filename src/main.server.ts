import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './core/app.component';
import { config } from './core/app.config.server';

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(AppComponent, config, context);

export default bootstrap;
