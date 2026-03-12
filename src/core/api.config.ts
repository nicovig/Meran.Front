import { InjectionToken } from '@angular/core';

export const API_BASE_URL = 'https://localhost:7040';

export const API_BASE_URL_TOKEN = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => API_BASE_URL,
});
