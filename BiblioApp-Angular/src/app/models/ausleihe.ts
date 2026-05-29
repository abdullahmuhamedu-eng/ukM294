import { Kunde } from './kunde';
import { Medium } from './medium';

export interface Ausleihe {
  id?: number;
  customer?: Kunde;
  media?: Medium;
  dateBorrowed?: string;
  dueDate?: string;
}
