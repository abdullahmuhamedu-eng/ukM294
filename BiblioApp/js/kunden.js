/**
 * kunden.js - CRUD-Logik für die Ressource Kunde
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

let kundenListe = [];
let currentKundeId = null;

/**
 * Lädt alle Kunden vom Backend und zeigt sie in der Tabelle an.
 * @async
 * @returns {Promise<void>}
 */
async function renderKunden() {
    const tbody = document.getElementById('kunden-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Lade...</td></tr>';
    try {
        kundenListe = await getKunden();
        renderKundenTabelle(kundenListe);
        updateNavCount('kunden', kundenListe.length);
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Fehler beim Laden.</td></tr>';
        showToast('Kunden konnten nicht geladen werden', 'error');
    }
}

/**
 * Rendert die Kunden-Tabelle mit den übergebenen Daten.
 * @param {Array} liste - Liste der Kunden-Objekte
 * @returns {void}
 */
function renderKundenTabelle(liste) {
    const tbody = document.getElementById('kunden-tbody');
    if (!liste || liste.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Keine Kunden vorhanden</td></tr>';
        return;
    }
    tbody.innerHTML = liste.map(function(k) {
        const adresse = k.address
            ? orDash(k.address.street) + ', ' + orDash(k.address.zip) + ' ' + orDash(k.address.city)
            : '-';
        return '<tr>'
            + '<td>' + orDash(k.id) + '</td>'
            + '<td><strong>' + orDash(k.firstName) + ' ' + orDash(k.lastName) + '</strong></td>'
            + '<td>' + orDash(k.email) + '</td>'
            + '<td>' + adresse + '</td>'
            + '<td>'
            + '<button class="btn btn--sm btn--secondary" data-action="edit-kunde" data-id="' + k.id + '">Bearbeiten</button> '
            + '<button class="btn btn--sm btn--danger" data-action="delete-kunde" data-id="' + k.id + '" data-name="' + sanitize((k.firstName || '') + ' ' + (k.lastName || '')) + '">Löschen</button>'
            + '</td></tr>';
    }).join('');
}

/**
 * Befüllt das Adressen-Dropdown im Kunden-Formular.
 * @async
 * @returns {Promise<void>}
 */
async function fillAdressenDropdown() {
    const select = document.getElementById('kunde-adresse');
    select.innerHTML = '<option value="">-- Adresse wählen --</option>';
    try {
        const adressen = await getAdressen();
        adressen.forEach(function(a) {
            const opt = document.createElement('option');
            opt.value = a.id;
            opt.textContent = a.street + ', ' + a.zip + ' ' + a.city;
            select.appendChild(opt);
        });
    } catch (err) { showToast('Adressen konnten nicht geladen werden', 'error'); }
}

/**
 * Öffnet das Modal zum Erstellen eines neuen Kunden.
 * @async
 * @returns {Promise<void>}
 */
async function openCreateKundeModal() {
    currentKundeId = null;
    document.getElementById('kunde-modal-titel').textContent = 'Neuen Kunden erstellen';
    document.getElementById('kunde-form').reset();
    enableKundeFelder(true);
    clearKundeErrors();
    await fillAdressenDropdown();
    showModal('kunde-modal');
}

/**
 * Öffnet das Modal zum Bearbeiten eines bestehenden Kunden.
 * @async
 * @param {number} id - ID des zu bearbeitenden Kunden
 * @returns {Promise<void>}
 */
async function openEditKundeModal(id) {
    const kunde = kundenListe.find(function(k) { return k.id === id; });
    if (!kunde) return;
    currentKundeId = id;
    document.getElementById('kunde-modal-titel').textContent = 'Kunden bearbeiten';
    document.getElementById('kunde-vorname').value   = kunde.firstName || '';
    document.getElementById('kunde-nachname').value  = kunde.lastName  || '';
    document.getElementById('kunde-birthdate').value = kunde.birthDate || '';
    document.getElementById('kunde-email').value     = kunde.email     || '';
    enableKundeFelder(false);
    clearKundeErrors();
    await fillAdressenDropdown();
    if (kunde.address) document.getElementById('kunde-adresse').value = kunde.address.id;
    showModal('kunde-modal');
}

/**
 * Aktiviert oder deaktiviert die nicht änderbaren Felder im Kunden-Formular.
 * @param {boolean} aktiv - true = alle Felder aktiv
 * @returns {void}
 */
function enableKundeFelder(aktiv) {
    document.getElementById('kunde-vorname').disabled   = !aktiv;
    document.getElementById('kunde-nachname').disabled  = !aktiv;
    document.getElementById('kunde-birthdate').disabled = !aktiv;
}

/**
 * Entfernt alle Validierungsfehler im Kunden-Formular.
 * @returns {void}
 */
function clearKundeErrors() {
    document.querySelectorAll('#kunde-modal .form-error').forEach(function(e) { e.classList.add('is-hidden'); });
    document.querySelectorAll('#kunde-modal .form-input, #kunde-modal select').forEach(function(i) { i.classList.remove('is-invalid'); });
}

/**
 * Schliesst das Kunden-Modal und stellt alle Felder wieder her.
 * @returns {void}
 */
function closeKundeModal() {
    enableKundeFelder(true);
    hideModal('kunde-modal');
}

/**
 * Speichert einen Kunden nach Validierung (erstellen oder bearbeiten).
 * @async
 * @returns {Promise<void>}
 */
async function saveKunde() {
    const vornameInput   = document.getElementById('kunde-vorname');
    const nachnameInput  = document.getElementById('kunde-nachname');
    const birthdateInput = document.getElementById('kunde-birthdate');
    const emailInput     = document.getElementById('kunde-email');
    const adresseSelect  = document.getElementById('kunde-adresse');

    const felder = currentKundeId ? [
        { input: emailInput,    errorEl: document.getElementById('kunde-email-error'),   regel: validateEmail,     meldung: 'Bitte gültige E-Mail eingeben' },
        { input: adresseSelect, errorEl: document.getElementById('kunde-adresse-error'), regel: validateNichtLeer, meldung: 'Bitte eine Adresse wählen' }
    ] : [
        { input: vornameInput,   errorEl: document.getElementById('kunde-vorname-error'),  regel: validateName,      meldung: 'Nur Buchstaben erlaubt' },
        { input: nachnameInput,  errorEl: document.getElementById('kunde-nachname-error'), regel: validateName,      meldung: 'Nur Buchstaben erlaubt' },
        { input: birthdateInput, errorEl: document.getElementById('kunde-birth-error'),    regel: validateDatum,     meldung: 'Bitte gültiges Datum (YYYY-MM-DD)' },
        { input: emailInput,     errorEl: document.getElementById('kunde-email-error'),    regel: validateEmail,     meldung: 'Bitte gültige E-Mail eingeben' },
        { input: adresseSelect,  errorEl: document.getElementById('kunde-adresse-error'),  regel: validateNichtLeer, meldung: 'Bitte eine Adresse wählen' }
    ];
    if (!validateFormular(felder)) return;

    try {
        if (currentKundeId) {
            await updateKunde(currentKundeId, sanitize(emailInput.value), parseInt(adresseSelect.value));
            showToast('Kunde aktualisiert', 'success');
        } else {
            await createKunde(
                sanitize(vornameInput.value), sanitize(nachnameInput.value),
                birthdateInput.value, sanitize(emailInput.value),
                parseInt(adresseSelect.value)
            );
            showToast('Kunde erstellt', 'success');
        }
        closeKundeModal();
        await renderKunden();
    } catch (err) { showToast('Fehler: ' + err.message, 'error'); }
}

/**
 * Zeigt Bestätigungsdialog und löscht einen Kunden nach Bestätigung.
 * @param {number} id   - ID des zu löschenden Kunden
 * @param {string} name - Name des Kunden für die Bestätigung
 * @returns {void}
 */
function confirmDeleteKunde(id, name) {
    showConfirm('Kunden löschen', 'Soll "' + name + '" wirklich gelöscht werden?', async function() {
        try {
            await deleteKunde(id);
            showToast('Kunde gelöscht', 'success');
            await renderKunden();
        } catch (err) { showToast('Löschen fehlgeschlagen: ' + err.message, 'error'); }
    });
}
