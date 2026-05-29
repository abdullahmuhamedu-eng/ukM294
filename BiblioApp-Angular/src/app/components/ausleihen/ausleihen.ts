import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Ausleihe } from '../../models/ausleihe';
import { Kunde } from '../../models/kunde';
import { Medium } from '../../models/medium';

@Component({
  selector: 'app-ausleihen',
  imports: [CommonModule, FormsModule],
  templateUrl: './ausleihen.html',
  styleUrl: './ausleihen.css'
})
export class Ausleihen implements OnInit {
  ausleihen: Ausleihe[] = [];
  gefiltert: Ausleihe[] = [];
  kunden: Kunde[] = [];
  verfuegbareMedian: Medium[] = [];
  suchbegriff = '';
  ladeStatus = true;
  fehler = false;

  modalOffen = false;
  kundeId: number | null = null;
  mediumId: number | null = null;
  fehlerFelder: Record<string, string> = {};

  bestaetigung = { offen: false, titel: '', text: '', aktion: () => {} };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.laden(); }

  laden(): void {
    this.ladeStatus = true;
    this.api.getAusleihen().subscribe({
      next: (d) => { this.ausleihen = d; this.gefiltert = d; this.ladeStatus = false; },
      error: () => { this.fehler = true; this.ladeStatus = false; }
    });
  }

  suchen(): void {
    const s = this.suchbegriff.trim().toLowerCase();
    this.gefiltert = s ? this.ausleihen.filter(a =>
      ((a.customer?.firstName ?? '') + ' ' + (a.customer?.lastName ?? '')).toLowerCase().includes(s)
    ) : [...this.ausleihen];
  }

  neuOeffnen(): void {
    this.kundeId = null; this.mediumId = null; this.fehlerFelder = {};
    const ausgeliehenIds = this.ausleihen.map(a => a.media?.id).filter(Boolean);
    this.api.getKunden().subscribe({ next: (k) => { this.kunden = k; } });
    this.api.getMedien().subscribe({
      next: (m) => { this.verfuegbareMedian = m.filter(x => !ausgeliehenIds.includes(x.id)); this.modalOffen = true; }
    });
  }

  speichern(): void {
    this.fehlerFelder = {};
    if (!this.kundeId)  this.fehlerFelder['kunde']  = 'Bitte wählen';
    if (!this.mediumId) this.fehlerFelder['medium'] = 'Bitte wählen';
    if (Object.keys(this.fehlerFelder).length) return;
    this.api.createAusleihe(this.kundeId!, this.mediumId!).subscribe({
      next: () => { this.modalOffen = false; this.laden(); }
    });
  }

  verlaengernBestaetigen(a: Ausleihe): void {
    this.bestaetigung = {
      offen: true, titel: 'Ausleihe verlängern',
      text: 'Soll die Ausleihe um 14 Tage verlängert werden?',
      aktion: () => this.api.extendAusleihe(a.id!).subscribe({ next: () => this.laden() })
    };
  }

  rueckgabeBestaetigen(a: Ausleihe): void {
    this.bestaetigung = {
      offen: true, titel: 'Rückgabe bestätigen',
      text: 'Wurde das Medium korrekt zurückgegeben?',
      aktion: () => this.api.returnMedium(a.media!.id!).subscribe({ next: () => this.laden() })
    };
  }

  loeschenBestaetigen(a: Ausleihe): void {
    this.bestaetigung = {
      offen: true, titel: 'Ausleihe löschen',
      text: 'Soll diese Ausleihe gelöscht werden?',
      aktion: () => this.api.deleteAusleihe(a.id!).subscribe({ next: () => this.laden() })
    };
  }

  bestaetigen(): void { this.bestaetigung.aktion(); this.bestaetigung.offen = false; }

  formatDatum(datum?: string): string {
    if (!datum) return '-';
    const t = datum.split('-');
    return t.length === 3 ? `${t[2]}.${t[1]}.${t[0]}` : datum;
  }
}
