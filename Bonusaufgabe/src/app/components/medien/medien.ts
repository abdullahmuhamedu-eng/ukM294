import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Medium } from '../../models/medium';

@Component({
  selector: 'app-medien',
  imports: [CommonModule, FormsModule],
  templateUrl: './medien.html',
  styleUrl: './medien.css'
})
export class Medien implements OnInit {
  medien: Medium[] = [];
  gefiltert: Medium[] = [];
  suchbegriff = '';
  ladeStatus = true;
  fehler = false;

  modalOffen = false;
  bearbeiten = false;
  form: Partial<Medium> = {};
  aktuelleId: number | null = null;
  titelFehler = '';

  bestaetigung = { offen: false, titel: '', text: '', aktion: () => {} };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.laden(); }

  laden(): void {
    this.ladeStatus = true;
    this.api.getMedien().subscribe({
      next: (d) => { this.medien = d; this.gefiltert = d; this.ladeStatus = false; },
      error: () => { this.fehler = true; this.ladeStatus = false; }
    });
  }

  suchen(): void {
    const s = this.suchbegriff.trim().toLowerCase();
    this.gefiltert = s ? this.medien.filter(m => (m.title || '').toLowerCase().includes(s)) : [...this.medien];
  }

  neuOeffnen(): void {
    this.aktuelleId = null; this.form = {}; this.titelFehler = '';
    this.bearbeiten = false; this.modalOffen = true;
  }

  bearbeitenOeffnen(m: Medium): void {
    this.aktuelleId = m.id!; this.form = { ...m }; this.titelFehler = '';
    this.bearbeiten = true; this.modalOffen = true;
  }

  speichern(): void {
    if (!this.form.title?.trim()) { this.titelFehler = 'Pflichtfeld'; return; }
    this.titelFehler = '';
    const body: Partial<Medium> = {
      title: this.form.title, author: this.form.author || '',
      genre: this.form.genre || undefined, locationcode: this.form.locationcode || undefined,
      ean: this.form.ean ?? undefined, rating: this.form.rating ?? undefined
    };
    const req = this.aktuelleId
      ? this.api.updateMedium(this.aktuelleId, body)
      : this.api.createMedium(body);
    req.subscribe({ next: () => { this.modalOffen = false; this.laden(); } });
  }

  loeschenBestaetigen(m: Medium): void {
    this.bestaetigung = {
      offen: true, titel: 'Medium löschen',
      text: `Soll "${m.title}" wirklich gelöscht werden?`,
      aktion: () => this.api.deleteMedium(m.id!).subscribe({ next: () => this.laden() })
    };
  }

  bestaetigen(): void { this.bestaetigung.aktion(); this.bestaetigung.offen = false; }
}
