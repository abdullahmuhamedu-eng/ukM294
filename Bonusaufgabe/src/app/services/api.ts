import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medium } from '../models/medium';
import { Kunde } from '../models/kunde';
import { Adresse } from '../models/adresse';
import { Ausleihe } from '../models/ausleihe';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getMedien(): Observable<Medium[]>                                   { return this.http.get<Medium[]>(`${this.base}/media`); }
  createMedium(m: Partial<Medium>): Observable<Medium>               { return this.http.post<Medium>(`${this.base}/media`, m); }
  updateMedium(id: number, m: Partial<Medium>): Observable<Medium>   { return this.http.put<Medium>(`${this.base}/media/${id}`, m); }
  deleteMedium(id: number): Observable<void>                         { return this.http.delete<void>(`${this.base}/media/${id}`); }

  getKunden(): Observable<Kunde[]>                                    { return this.http.get<Kunde[]>(`${this.base}/customers`); }
  createKunde(k: Partial<Kunde>): Observable<Kunde>                  { return this.http.post<Kunde>(`${this.base}/customers`, k); }
  updateKunde(id: number, k: Partial<Kunde>): Observable<Kunde>      { return this.http.put<Kunde>(`${this.base}/customers/${id}`, k); }
  deleteKunde(id: number): Observable<void>                          { return this.http.delete<void>(`${this.base}/customers/${id}`); }

  getAdressen(): Observable<Adresse[]>                               { return this.http.get<Adresse[]>(`${this.base}/addresses`); }
  createAdresse(a: Partial<Adresse>): Observable<Adresse>            { return this.http.post<Adresse>(`${this.base}/addresses`, a); }
  updateAdresse(id: number, a: Partial<Adresse>): Observable<Adresse> { return this.http.put<Adresse>(`${this.base}/addresses/${id}`, a); }
  deleteAdresse(id: number): Observable<void>                        { return this.http.delete<void>(`${this.base}/addresses/${id}`); }

  getAusleihen(): Observable<Ausleihe[]>                             { return this.http.get<Ausleihe[]>(`${this.base}/borrowings`); }
  createAusleihe(kundeId: number, mediumId: number): Observable<Ausleihe> {
    return this.http.post<Ausleihe>(`${this.base}/borrowings`, { customer: { id: kundeId }, media: { id: mediumId } });
  }
  extendAusleihe(id: number): Observable<Ausleihe>                   { return this.http.put<Ausleihe>(`${this.base}/borrowings/${id}/extend`, {}); }
  deleteAusleihe(id: number): Observable<void>                       { return this.http.delete<void>(`${this.base}/borrowings/${id}`); }
  returnMedium(mediumId: number): Observable<void>                   { return this.http.delete<void>(`${this.base}/borrowings/media/${mediumId}`); }
}
