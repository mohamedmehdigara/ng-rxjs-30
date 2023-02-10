import { enableProdMode, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { APP_BASE_HREF, PlatformLocation } from '@angular/common';
import { AppComponent } from './app/app.component';
import { browserWindowProvider, windowProvider } from './app/core';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

function getAppBaseHref() {
  return inject(PlatformLocation).getBaseHrefFromDOM()
}


bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: APP_BASE_HREF,
      useFactory: getAppBaseHref,
    },
    browserWindowProvider,
    windowProvider,
  ]
})
  .catch(err => console.error(err));