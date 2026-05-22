/**
 * medien.js - CRUD-Logik für die Ressource Medium
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

let medienListe = [];
let currentMediumId = null;

/**
 * Lädt alle Medien vom Backend und zeigt sie in der Tabelle an.
 * @async
 * @returns {Promise<void>}
 */
async function renderMedien() {
    const tbody = document.getElementById('medien-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Lade...</td></tr>';
    try {
        medienListe = await getMedien();
        renderMedienTabelle(medienListe);
        updateNavCount('medien', medienListe.length);
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Fehler beim Laden. Ist das Backend gestartet?</td></tr>';
        showToast('Medien konnten nicht geladen werden', 'error');
    }
}

/**
 * Rendert die Medien-Tabelle mit den übergebenen Daten.
 * @param {Array} liste - Liste der Medien-Objekte
 * @returns {void}
 */
function renderMedienTabelle(liste) {
    const tbody = document.getElementById('medien-tbody');
    if (!liste || liste.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Keine Medien vorhanden</td></tr>';
        return;
    }
    tbody.innerHTML = liste.map(function(m) {
        return '<tr>'
            + '<td>' + orDash(m.id) + '</td>'
            + '<td><strong>' + orDash(m.title) + '</strong></td>'
            + '<td>' + orDash(m.author) + '</td>'
            + '<td>' + orDash(m.genre) + '</td>'
            + '<td>'
            + '<button class="btn btn--sm btn--secondary" data-action="edit-medium" data-id="' + m.id + '">Bearbeiten</button> '
            + '<button class="btn btn--sm btn--danger" data-action="delete-medium" data-id="' + m.id + '" data-name="' + sanitize(m.title || '') + '">Löschen</button>'
            + '</td></tr>';
    }).join('');
}

/**
 * Sucht Medien nach Titel und aktualisiert die Tabelle.
 * @async
 * @returns {Promise<void>}
 */
async function searchMedien() {
    const suchbegriff = document.getElementById('medien-suche').value.trim();
    if (suchbegriff.length === 0) { renderMedienTabelle(medienListe); return; }
    try {
        const ergebnis = await searchMedienByTitel(suchbegriff);
        renderMedienTabelle(ergebnis);
    } catch (err) { showToast('Suche fehlgeschlagen', 'error'); }
}

/**
 * Öffnet das Modal zum Erstellen eines neuen Mediums.
 * @returns {void}
 */
function openCreateMediumModal() {
    currentMediumId = null;
    document.getElementById('medium-modal-titel').textContent = 'Neues Medium erstellen';
    document.getElementById('medium-form').reset();
    clearMediumErrors();
    showModal('medium-modal');
}

/**
 * Öffnet das Modal zum Bearbeiten eines bestehenden Mediums.
 * @param {number} id - ID des zu bearbeitenden Mediums
 * @returns {void}
 */
function openEditMediumModal(id) {
    const medium = medienListe.find(function(m) { return m.id === id; });
    if (!medium) return;
    currentMediumId = id;
    document.getElementById('medium-modal-titel').textContent = 'Medium bearbeiten';
    document.getElementById('medium-titel').value    = medium.title        || '';
    document.getElementById('medium-autor').value    = medium.author       || '';
    document.getElementById('medium-genre').value    = medium.genre        || '';
    document.getElementById('medium-standort').value = medium.locationcode || '';
    clearMediumErrors();
    showModal('medium-modal');
}

/**
 * Entfernt alle Validierungsfehler im Medium-Formular.
 * @returns {void}
 */
function clearMediumErrors() {
    document.querySelectorAll('#medium-modal .form-error').forEach(function(e) { e.classList.add('is-hidden'); });
    document.querySelectorAll('#medium-modal .form-input').forEach(function(i) { i.classList.remove('is-invalid'); });
}

/**
 * Speichert ein Medium nach Validierung (erstellen oder bearbeiten).
 * @async
 * @returns {Promise<void>}
 */
async function saveMedium() {
    const titelInput    = document.getElementById('medium-titel');
    const autorInput    = document.getElementById('medium-autor');
    const genreInput    = document.getElementById('medium-genre');
    const standortInput = document.getElementById('medium-standort');

    const gueltig = validateFormular([
        { input: titelInput, errorEl: document.getElementById('medium-titel-error'), regel: validateName, meldung: 'Titel darf nur Buchstaben enthalten (kein reiner Zahlenwert).' },
        { input: autorInput, errorEl: document.getElementById('medium-autor-error'), regel: validateName, meldung: 'Autor darf nur Buchstaben enthalten (kein reiner Zahlenwert).' }
    ]);
    if (!gueltig) return;

    const body = { title: sanitize(titelInput.value), author: sanitize(autorInput.value) };
    if (genreInput.value.trim())    body.genre        = sanitize(genreInput.value);
    if (standortInput.value.trim()) body.locationcode = sanitize(standortInput.value);

    try {
        if (currentMediumId) {
            await updateMedium(currentMediumId, body);
            showToast('Medium aktualisiert', 'success');
        } else {
            await createMedium(body.title, body.author, body.genre, body.locationcode);
            showToast('Medium erstellt', 'success');
        }
        hideModal('medium-modal');
        await renderMedien();
    } catch (err) { showToast('Fehler: ' + err.message, 'error'); }
}

/**
 * Zeigt Bestätigungsdialog und löscht ein Medium nach Bestätigung.
 * @param {number} id   - ID des zu löschenden Mediums
 * @param {string} name - Titel des Mediums für die Bestätigung
 * @returns {void}
 */
function confirmDeleteMedium(id, name) {
    showConfirm('Medium löschen', 'Soll "' + name + '" wirklich gelöscht werden?', async function() {
        try {
            await deleteMedium(id);
            showToast('Medium gelöscht', 'success');
            await renderMedien();
        } catch (err) { showToast('Löschen fehlgeschlagen: ' + err.message, 'error'); }
    });
}
