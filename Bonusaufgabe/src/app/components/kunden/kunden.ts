import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Kunde } from '../../models/kunde';
import { Adresse } from '../../models/adresse';

@Component({
  selector: 'app-kunden',
  imports: [CommonModule, FormsModule],
  templateUrl: './kunden.html',
  styleUrl: './kunden.css'
})
export class Kunden implements OnInit {
  kunden: Kunde[] = [];
  gefiltert: Kunde[] = [];
  adressen: Adresse[] = [];
  suchbegriff = '';
  ladeStatus = true;
  fehler = false;

  modalOffen = false;
  bearbeiten = false;
  aktuelleId: number | null = null;
  form: Partial<Kunde> = {};
  adresseId: number | null = null;
  geburtsdatum = '';
  fehlerFelder: Record<string, string> = {};

  bestaetigung = { offen: false, titel: '', text: '', aktion: () => {} };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.laden(); }

  laden(): void {
    this.ladeStatus = true;
    this.api.getKunden().subscribe({
      next: (d) => { this.kunden = d; this.gefiltert = d; this.ladeStatus = false; },
      error: () => { this.fehler = true; this.ladeStatus = false; }
    });
  }

  suchen(): void {
    const s = this.suchbegriff.trim().toLowerCase();
    this.gefiltert = s ? this.kunden.filter(k =>
      (k.firstName + ' ' + k.lastName).toLowerCase().includes(s)
    ) : [...this.kunden];
  }

  neuOeffnen(): void {
    this.aktuelleId = null; this.form = {}; this.adresseId = null; this.geburtsdatum = '';
    this.fehlerFelder = {}; this.bearbeiten = false;
    this.api.getAdressen().subscribe({ next: (a) => { this.adressen = a; this.modalOffen = true; } });
  }

  bearbeitenOeffnen(k: Kunde): void {
    this.aktuelleId = k.id!;
    this.form = { ...k };
    this.adresseId = k.address?.id ?? null;
    this.geburtsdatum = k.birthDate ? this.isoZuAnzeige(k.birthDate) : '';
    this.fehlerFelder = {}; this.bearbeiten = true;
    this.api.getAdressen().subscribe({ next: (a) => { this.adressen = a; this.modalOffen = true; } });
  }

  speichern(): void {
    this.fehlerFelder = {};
    if (!this.bearbeiten) {
      if (!this.form.firstName?.trim()) this.fehlerFelder['vorname'] = 'Pflichtfeld';
      if (!this.form.lastName?.trim())  this.fehlerFelder['nachname'] = 'Pflichtfeld';
      if (!this.geburtsdatum.trim())    this.fehlerFelder['datum'] = 'Pflichtfeld';
    }
    if (!this.form.email?.trim())       this.fehlerFelder['email'] = 'Pflichtfeld';
    if (!this.adresseId)                this.fehlerFelder['adresse'] = 'Bitte wählen';
    if (Object.keys(this.fehlerFelder).length) return;

    if (this.bearbeiten) {
      this.api.updateKunde(this.aktuelleId!, { email: this.form.email, address: { id: this.adresseId! } as Adresse })
        .subscribe({ next: () => { this.modalOffen = false; this.laden(); } });
    } else {
      const iso = this.anzeigeZuIso(this.geburtsdatum);
      this.api.createKunde({
        firstName: this.form.firstName, lastName: this.form.lastName,
        birthDate: iso, email: this.form.email, address: { id: this.adresseId! } as Adresse
      }).subscribe({ next: () => { this.modalOffen = false; this.laden(); } });
    }
  }

  loeschenBestaetigen(k: Kunde): void {
    this.bestaetigung = {
      offen: true, titel: 'Kunden löschen',
      text: `Soll "${k.firstName} ${k.lastName}" wirklich gelöscht werden?`,
      aktion: () => this.api.deleteKunde(k.id!).subscribe({ next: () => this.laden() })
    };
  }

  bestaetigen(): void { this.bestaetigung.aktion(); this.bestaetigung.offen = false; }

  adresseText(k: Kunde): string {
    return k.address ? `${k.address.street}, ${k.address.zip} ${k.address.city}` : '-';
  }

  private isoZuAnzeige(iso: string): string {
    const t = iso.split('-');
    return t.length === 3 ? `${t[2]}.${t[1]}.${t[0]}` : iso;
  }

  private anzeigeZuIso(d: string): string {
    const t = d.split('.');
    return t.length === 3 ? `${t[2]}-${t[1]}-${t[0]}` : d;
  }
}
