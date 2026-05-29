import { Adresse } from './adresse';

export interface Kunde {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string;
  address?: Adresse;
}
