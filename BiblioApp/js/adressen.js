/**
 * adressen.js - CRUD-Logik fuer die Ressource Adresse
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

let adressenListe = [];
let currentAdresseId = null;

async function renderAdressen() {
    const tbody = document.getElementById('adressen-tbody');
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Lade...</td></tr>';
    try {
        adressenListe = await getAdressen();
        renderAdressenTabelle(adressenListe);
        updateNavCount('adressen', adressenListe.length);
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">Fehler: ' + err.message + '</td></tr>';
        showToast('Adressen konnten nicht geladen werden', 'error');
    }
}

function renderAdressenTabelle(liste) {
    const tbody = document.getElementById('adressen-tbody');
    if (!liste || liste.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="loading">Keine Adressen vorhanden</td></tr>'; return; }
    tbody.innerHTML = liste.map(function(a) {
        return '<tr>'
            + '<td>' + orDash(a.id) + '</td>'
            + '<td><strong>' + orDash(a.street) + '</strong></td>'
            + '<td>' + orDash(a.zip) + ' ' + orDash(a.city) + '</td>'
            + '<td>'
            + '<button class="btn btn--sm btn--secondary" data-action="edit-adresse" data-id="' + a.id + '">Bearbeiten</button> '
            + '<button class="btn btn--sm btn--danger" data-action="delete-adresse" data-id="' + a.id + '" data-name="' + sanitize(a.street || '') + '">Loeschen</button>'
            + '</td></tr>';
    }).join('');
}

function openCreateAdresseModal() {
    currentAdresseId = null;
    document.getElementById('adresse-modal-titel').textContent = 'Neue Adresse erstellen';
    document.getElementById('adresse-form').reset();
    document.querySelectorAll('#adresse-modal .form-error').forEach(function(e) { e.classList.add('is-hidden'); });
    document.querySelectorAll('#adresse-modal .form-input').forEach(function(i) { i.classList.remove('is-invalid'); });
    showModal('adresse-modal');
}

function openEditAdresseModal(id) {
    const adresse = adressenListe.find(function(a) { return a.id === id; });
    if (!adresse) return;
    currentAdresseId = id;
    document.getElementById('adresse-modal-titel').textContent = 'Adresse bearbeiten';
    document.getElementById('adresse-street').value = adresse.street || '';
    document.getElementById('adresse-city').value   = adresse.city   || '';
    document.getElementById('adresse-zip').value    = adresse.zip    || '';
    document.querySelectorAll('#adresse-modal .form-error').forEach(function(e) { e.classList.add('is-hidden'); });
    showModal('adresse-modal');
}

async function saveAdresse() {
    const streetInput = document.getElementById('adresse-street');
    const cityInput   = document.getElementById('adresse-city');
    const zipInput    = document.getElementById('adresse-zip');
    const gueltig = validateFormular([
        { input: streetInput, errorEl: document.getElementById('adresse-street-error'), regel: validateNichtLeer, meldung: 'Pflichtfeld' },
        { input: cityInput,   errorEl: document.getElementById('adresse-city-error'),   regel: validateNichtLeer, meldung: 'Pflichtfeld' },
        { input: zipInput,    errorEl: document.getElementById('adresse-zip-error'),    regel: validatePLZ,       meldung: 'PLZ muss 4-8 Ziffern enthalten' }
    ]);
    if (!gueltig) return;
    try {
        if (currentAdresseId) {
            await updateAdresse(currentAdresseId, sanitize(streetInput.value), sanitize(cityInput.value), sanitize(zipInput.value));
            showToast('Adresse aktualisiert', 'success');
        } else {
            await createAdresse(sanitize(streetInput.value), sanitize(cityInput.value), sanitize(zipInput.value));
            showToast('Adresse erstellt', 'success');
        }
        hideModal('adresse-modal');
        await renderAdressen();
    } catch (err) { showToast('Fehler: ' + err.message, 'error'); }
}

function confirmDeleteAdresse(id, name) {
    showConfirm('Adresse loeschen', 'Soll "' + name + '" geloescht werden? Nur moeglich wenn kein Kunde diese Adresse verwendet.', async function() {
        try { await deleteAdresse(id); showToast('Adresse geloescht', 'success'); await renderAdressen(); }
        catch (err) { showToast('Loeschen fehlgeschlagen: ' + err.message, 'error'); }
    });
}
