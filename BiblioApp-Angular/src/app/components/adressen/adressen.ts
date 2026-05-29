import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Adresse } from '../../models/adresse';

@Component({
  selector: 'app-adressen',
  imports: [CommonModule, FormsModule],
  templateUrl: './adressen.html',
  styleUrl: './adressen.css'
})
export class Adressen implements OnInit {
  adressen: Adresse[] = [];
  gefiltert: Adresse[] = [];
  suchbegriff = '';
  ladeStatus = true;
  fehler = false;

  modalOffen = false;
  bearbeiten = false;
  aktuelleId: number | null = null;
  form: Partial<Adresse> = {};
  fehlerFelder: Record<string, string> = {};

  bestaetigung = { offen: false, titel: '', text: '', aktion: () => {} };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.laden(); }

  laden(): void {
    this.ladeStatus = true;
    this.api.getAdressen().subscribe({
      next: (d) => { this.adressen = d; this.gefiltert = d; this.ladeStatus = false; },
      error: () => { this.fehler = true; this.ladeStatus = false; }
    });
  }

  suchen(): void {
    const s = this.suchbegriff.trim().toLowerCase();
    this.gefiltert = s ? this.adressen.filter(a =>
      (a.street + ' ' + a.city + ' ' + a.zip).toLowerCase().includes(s)
    ) : [...this.adressen];
  }

  neuOeffnen(): void {
    this.aktuelleId = null; this.form = {}; this.fehlerFelder = {};
    this.bearbeiten = false; this.modalOffen = true;
  }

  bearbeitenOeffnen(a: Adresse): void {
    this.aktuelleId = a.id!; this.form = { ...a }; this.fehlerFelder = {};
    this.bearbeiten = true; this.modalOffen = true;
  }

  speichern(): void {
    this.fehlerFelder = {};
    if (!this.form.street?.trim()) this.fehlerFelder['street'] = 'Pflichtfeld';
    if (!this.form.city?.trim())   this.fehlerFelder['city']   = 'Pflichtfeld';
    if (!this.form.zip?.trim())    this.fehlerFelder['zip']    = 'Pflichtfeld';
    if (Object.keys(this.fehlerFelder).length) return;

    const req = this.bearbeiten
      ? this.api.updateAdresse(this.aktuelleId!, this.form as Adresse)
      : this.api.createAdresse(this.form as Adresse);
    req.subscribe({ next: () => { this.modalOffen = false; this.laden(); } });
  }

  loeschenBestaetigen(a: Adresse): void {
    this.bestaetigung = {
      offen: true, titel: 'Adresse löschen',
      text: `Soll "${a.street}" wirklich gelöscht werden?`,
      aktion: () => this.api.deleteAdresse(a.id!).subscribe({ next: () => this.laden() })
    };
  }

  bestaetigen(): void { this.bestaetigung.aktion(); this.bestaetigung.offen = false; }
}
