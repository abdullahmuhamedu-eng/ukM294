import { Routes } from '@angular/router';
import { Medien } from './components/medien/medien';
import { Kunden } from './components/kunden/kunden';
import { Adressen } from './components/adressen/adressen';
import { Ausleihen } from './components/ausleihen/ausleihen';

export const routes: Routes = [
  { path: '',          redirectTo: 'medien', pathMatch: 'full' },
  { path: 'medien',    component: Medien },
  { path: 'kunden',    component: Kunden },
  { path: 'adressen',  component: Adressen },
  { path: 'ausleihen', component: Ausleihen },
];
