/**
 * medien.js - CRUD-Logik fuer die Ressource Medium
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

let medienListe = [];
let currentMediumId = null;

async function renderMedien() {
    const tbody = document.getElementById('medien-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Lade...</td></tr>';
    try {
        medienListe = await getMedien();
        renderMedienTabelle(medienListe);
        updateNavCount('medien', medienListe.length);
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Fehler: ' + err.message + '</td></tr>';
        showToast('Medien konnten nicht geladen werden', 'error');
    }
}

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
            + '<button class="btn btn--sm btn--danger" data-action="delete-medium" data-id="' + m.id + '" data-name="' + sanitize(m.title || '') + '">Loeschen</button>'
            + '</td></tr>';
    }).join('');
}

async function searchMedien() {
    const suchbegriff = document.getElementById('medien-suche').value.trim();
    if (suchbegriff.length === 0) { renderMedienTabelle(medienListe); return; }
    try {
        const ergebnis = await searchMedienByTitel(suchbegriff);
        renderMedienTabelle(ergebnis);
    } catch (err) { showToast('Suche fehlgeschlagen', 'error'); }
}

function openCreateMediumModal() {
    currentMediumId = null;
    document.getElementById('medium-modal-titel').textContent = 'Neues Medium erstellen';
    document.getElementById('medium-form').reset();
    document.querySelectorAll('#medium-modal .form-error').forEach(function(e) { e.classList.add('is-hidden'); });
    document.querySelectorAll('#medium-modal .form-input').forEach(function(i) { i.classList.remove('is-invalid'); });
    showModal('medium-modal');
}

function openEditMediumModal(id) {
    const medium = medienListe.find(function(m) { return m.id === id; });
    if (!medium) return;
    currentMediumId = id;
    document.getElementById('medium-modal-titel').textContent = 'Medium bearbeiten';
    document.getElementById('medium-titel').value    = medium.title        || '';
    document.getElementById('medium-autor').value    = medium.author       || '';
    document.getElementById('medium-genre').value    = medium.genre        || '';
    document.getElementById('medium-standort').value = medium.locationcode || '';
    document.querySelectorAll('#medium-modal .form-error').forEach(function(e) { e.classList.add('is-hidden'); });
    document.querySelectorAll('#medium-modal .form-input').forEach(function(i) { i.classList.remove('is-invalid'); });
    showModal('medium-modal');
}

async function saveMedium() {
    const titelInput    = document.getElementById('medium-titel');
    const autorInput    = document.getElementById('medium-autor');
    const genreInput    = document.getElementById('medium-genre');
    const standortInput = document.getElementById('medium-standort');
    const gueltig = validateFormular([
        { input: titelInput, errorEl: document.getElementById('medium-titel-error'), regel: validateNichtLeer, meldung: 'Pflichtfeld - bitte ausfullen' },
        { input: autorInput, errorEl: document.getElementById('medium-autor-error'), regel: validateNichtLeer, meldung: 'Pflichtfeld - bitte ausfullen' }
    ]);
    if (!gueltig) return;
    try {
        if (currentMediumId) {
            await updateMedium(currentMediumId, { title: sanitize(titelInput.value), author: sanitize(autorInput.value), genre: sanitize(genreInput.value) || undefined, locationcode: sanitize(standortInput.value) || undefined });
            showToast('Medium aktualisiert', 'success');
        } else {
            await createMedium(sanitize(titelInput.value), sanitize(autorInput.value), sanitize(genreInput.value) || undefined, sanitize(standortInput.value) || undefined);
            showToast('Medium erstellt', 'success');
        }
        hideModal('medium-modal');
        await renderMedien();
    } catch (err) { showToast('Fehler: ' + err.message, 'error'); }
}

function confirmDeleteMedium(id, name) {
    showConfirm('Medium loeschen', 'Soll "' + name + '" wirklich geloescht werden?', async function() {
        try { await deleteMedium(id); showToast('Medium geloescht', 'success'); await renderMedien(); }
        catch (err) { showToast('Loeschen fehlgeschlagen: ' + err.message, 'error'); }
    });
}
