/**
 * kunden.js - CRUD-Logik fuer die Ressource Kunde
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

let kundenListe = [];
let currentKundeId = null;

async function renderKunden() {
    const tbody = document.getElementById('kunden-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Lade...</td></tr>';
    try {
        kundenListe = await getKunden();
        renderKundenTabelle(kundenListe);
        updateNavCount('kunden', kundenListe.length);
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Fehler: ' + err.message + '</td></tr>';
        showToast('Kunden konnten nicht geladen werden', 'error');
    }
}

function renderKundenTabelle(liste) {
    const tbody = document.getElementById('kunden-tbody');
    if (!liste || liste.length === 0) { tbody.innerHTML = '<tr><td colspan="5" class="loading">Keine Kunden vorhanden</td></tr>'; return; }
    tbody.innerHTML = liste.map(function(k) {
        const adresse = k.address ? orDash(k.address.street) + ', ' + orDash(k.address.zip) + ' ' + orDash(k.address.city) : '-';
        return '<tr>'
            + '<td>' + orDash(k.id) + '</td>'
            + '<td><strong>' + orDash(k.firstName) + ' ' + orDash(k.lastName) + '</strong></td>'
            + '<td>' + orDash(k.email) + '</td>'
            + '<td>' + adresse + '</td>'
            + '<td>'
            + '<button class="btn btn--sm btn--secondary" data-action="edit-kunde" data-id="' + k.id + '">Bearbeiten</button> '
            + '<button class="btn btn--sm btn--danger" data-action="delete-kunde" data-id="' + k.id + '" data-name="' + sanitize((k.firstName||'') + ' ' + (k.lastName||'')) + '">Loeschen</button>'
            + '</td></tr>';
    }).join('');
}

async function fillAdressenDropdown() {
    const select = document.getElementById('kunde-adresse');
    select.innerHTML = '<option value="">-- Adresse waehlen --</option>';
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

async function openCreateKundeModal() {
    currentKundeId = null;
    document.getElementById('kunde-modal-titel').textContent = 'Neuen Kunden erstellen';
    document.getElementById('kunde-form').reset();
    enableKundeFelder(true);
    document.querySelectorAll('#kunde-modal .form-error').forEach(function(e) { e.classList.add('is-hidden'); });
    document.querySelectorAll('#kunde-modal .form-input, #kunde-modal select').forEach(function(i) { i.classList.remove('is-invalid'); });
    await fillAdressenDropdown();
    showModal('kunde-modal');
}

async function openEditKundeModal(id) {
    const kunde = kundenListe.find(function(k) { return k.id === id; });
    if (!kunde) return;
    currentKundeId = id;
    document.getElementById('kunde-modal-titel').textContent = 'Kunden bearbeiten (nur E-Mail + Adresse aenderbar)';
    document.getElementById('kunde-vorname').value   = kunde.firstName || '';
    document.getElementById('kunde-nachname').value  = kunde.lastName  || '';
    document.getElementById('kunde-birthdate').value = kunde.birthDate || '';
    document.getElementById('kunde-email').value     = kunde.email     || '';
    enableKundeFelder(false);
    document.querySelectorAll('#kunde-modal .form-error').forEach(function(e) { e.classList.add('is-hidden'); });
    await fillAdressenDropdown();
    if (kunde.address) document.getElementById('kunde-adresse').value = kunde.address.id;
    showModal('kunde-modal');
}

function enableKundeFelder(aktiv) {
    document.getElementById('kunde-vorname').disabled   = !aktiv;
    document.getElementById('kunde-nachname').disabled  = !aktiv;
    document.getElementById('kunde-birthdate').disabled = !aktiv;
}

function closeKundeModal() { enableKundeFelder(true); hideModal('kunde-modal'); }

async function saveKunde() {
    const emailInput    = document.getElementById('kunde-email');
    const adresseSelect = document.getElementById('kunde-adresse');
    const felder = currentKundeId ? [
        { input: emailInput,    errorEl: document.getElementById('kunde-email-error'),   regel: validateEmail,     meldung: 'Bitte gueltige E-Mail eingeben' },
        { input: adresseSelect, errorEl: document.getElementById('kunde-adresse-error'), regel: validateNichtLeer, meldung: 'Bitte eine Adresse waehlen' }
    ] : [
        { input: document.getElementById('kunde-vorname'),   errorEl: document.getElementById('kunde-vorname-error'),  regel: validateNichtLeer, meldung: 'Pflichtfeld' },
        { input: document.getElementById('kunde-nachname'),  errorEl: document.getElementById('kunde-nachname-error'), regel: validateNichtLeer, meldung: 'Pflichtfeld' },
        { input: document.getElementById('kunde-birthdate'), errorEl: document.getElementById('kunde-birth-error'),    regel: validateDatum,     meldung: 'Bitte gueltiges Datum (YYYY-MM-DD)' },
        { input: emailInput,                                 errorEl: document.getElementById('kunde-email-error'),    regel: validateEmail,     meldung: 'Bitte gueltige E-Mail eingeben' },
        { input: adresseSelect,                              errorEl: document.getElementById('kunde-adresse-error'),  regel: validateNichtLeer, meldung: 'Bitte eine Adresse waehlen' }
    ];
    if (!validateFormular(felder)) return;
    try {
        if (currentKundeId) {
            await updateKunde(currentKundeId, sanitize(emailInput.value), parseInt(adresseSelect.value));
            showToast('Kunde aktualisiert', 'success');
        } else {
            await createKunde(sanitize(document.getElementById('kunde-vorname').value), sanitize(document.getElementById('kunde-nachname').value), document.getElementById('kunde-birthdate').value, sanitize(emailInput.value), parseInt(adresseSelect.value));
            showToast('Kunde erstellt', 'success');
        }
        closeKundeModal();
        await renderKunden();
    } catch (err) { showToast('Fehler: ' + err.message, 'error'); }
}

function confirmDeleteKunde(id, name) {
    showConfirm('Kunden loeschen', 'Soll "' + name + '" wirklich geloescht werden?', async function() {
        try { await deleteKunde(id); showToast('Kunde geloescht', 'success'); await renderKunden(); }
        catch (err) { showToast('Loeschen fehlgeschlagen: ' + err.message, 'error'); }
    });
}
