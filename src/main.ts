import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { License } from 'yfiles';

// Load yFiles license before bootstrapping the app
fetch('/assets/license.json')
  .then(response => response.json())
  .then(licenseData => {
    License.value = licenseData;
    return bootstrapApplication(AppComponent, appConfig);
  })
  .catch((err) => {
    console.error('[yFiles] Failed to load license:', err);
    // Bootstrap anyway to show error in UI
    return bootstrapApplication(AppComponent, appConfig);
  })
  .catch((err) => console.error('Bootstrap error:', err));
