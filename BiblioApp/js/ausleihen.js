/**
 * ausleihen.js - CRUD-Logik für die Ressource Ausleihe
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

let ausleihenListe = [];

/**
 * Lädt alle Ausleihen vom Backend und zeigt sie in der Tabelle an.
 * @async
 * @returns {Promise<void>}
 */
async function renderAusleihen() {
    const tbody = document.getElementById('ausleihen-tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Lade...</td></tr>';
    try {
        ausleihenListe = await getAusleihen();
        renderAusleihenTabelle(ausleihenListe);
        updateNavCount('ausleihen', ausleihenListe.length);
        updateStat('stat-ausleihen', ausleihenListe.length);
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Fehler beim Laden.</td></tr>';
        showToast('Ausleihen konnten nicht geladen werden', 'error');
    }
}

/**
 * Rendert die Ausleihen-Tabelle mit den übergebenen Daten.
 * @param {Array} liste - Liste der Ausleihen-Objekte
 * @returns {void}
 */
function renderAusleihenTabelle(liste) {
    const tbody = document.getElementById('ausleihen-tbody');
    if (!liste || liste.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Keine Ausleihen vorhanden</td></tr>';
        return;
    }
    tbody.innerHTML = liste.map(function(a) {
        const medium   = a.media    ? orDash(a.media.title)                                            : '-';
        const kunde    = a.customer ? orDash(a.customer.firstName) + ' ' + orDash(a.customer.lastName) : '-';
        const mediumId = a.media    ? a.media.id : 0;
        return '<tr>'
            + '<td>' + orDash(a.id) + '</td>'
            + '<td><strong>' + medium + '</strong></td>'
            + '<td>' + kunde + '</td>'
            + '<td>' + formatDatum(a.dateBorrowed) + '</td>'
            + '<td>'
            + '<button class="btn btn--sm btn--secondary" data-action="extend-ausleihe" data-id="' + a.id + '">+14 Tage</button> '
            + '<button class="btn btn--sm btn--secondary" data-action="return-medium" data-medium-id="' + mediumId + '">Rückgabe</button> '
            + '<button class="btn btn--sm btn--danger"    data-action="delete-ausleihe" data-id="' + a.id + '">Löschen</button>'
            + '</td></tr>';
    }).join('');
}

/**
 * Befüllt die Dropdowns im Ausleihe-Modal mit Kunden und verfügbaren Medien.
 * @async
 * @returns {Promise<void>}
 */
async function fillAusleiheDropdowns() {
    const kundeSelect  = document.getElementById('ausleihe-kunde');
    const mediumSelect = document.getElementById('ausleihe-medium');
    kundeSelect.innerHTML  = '<option value="">-- Kunden wählen --</option>';
    mediumSelect.innerHTML = '<option value="">-- Medium wählen --</option>';
    try {
        const [kunden, medien] = await Promise.all([getKunden(), getMedien()]);
        kunden.forEach(function(k) {
            const opt = document.createElement('option');
            opt.value = k.id;
            opt.textContent = k.firstName + ' ' + k.lastName + ' (ID: ' + k.id + ')';
            kundeSelect.appendChild(opt);
        });
        const ausgeliehenIds = ausleihenListe.map(function(a) { return a.media ? a.media.id : null; });
        medien.filter(function(m) { return !ausgeliehenIds.includes(m.id); }).forEach(function(m) {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.title + ' (ID: ' + m.id + ')';
            mediumSelect.appendChild(opt);
        });
    } catch (err) { showToast('Dropdowns konnten nicht geladen werden', 'error'); }
}

/**
 * Öffnet das Modal zum Erstellen einer neuen Ausleihe.
 * @async
 * @returns {Promise<void>}
 */
async function openCreateAusleiheModal() {
    document.getElementById('ausleihe-form').reset();
    document.querySelectorAll('#ausleihe-modal .form-error').forEach(function(e) { e.classList.add('is-hidden'); });
    await fillAusleiheDropdowns();
    showModal('ausleihe-modal');
}

/**
 * Speichert eine neue Ausleihe nach Validierung.
 * @async
 * @returns {Promise<void>}
 */
async function saveAusleihe() {
    const kundeSelect  = document.getElementById('ausleihe-kunde');
    const mediumSelect = document.getElementById('ausleihe-medium');
    const gueltig = validateFormular([
        { input: kundeSelect,  errorEl: document.getElementById('ausleihe-kunde-error'),  regel: validateNichtLeer, meldung: 'Bitte einen Kunden wählen' },
        { input: mediumSelect, errorEl: document.getElementById('ausleihe-medium-error'), regel: validateNichtLeer, meldung: 'Bitte ein Medium wählen' }
    ]);
    if (!gueltig) return;
    try {
        await createAusleihe(parseInt(kundeSelect.value), parseInt(mediumSelect.value));
        showToast('Ausleihe erstellt', 'success');
        hideModal('ausleihe-modal');
        await renderAusleihen();
        await renderMedien();
    } catch (err) { showToast('Ausleihe fehlgeschlagen: ' + err.message, 'error'); }
}

/**
 * Zeigt Bestätigungsdialog und verlängert eine Ausleihe um 14 Tage.
 * @param {number} id - ID der zu verlängernden Ausleihe
 * @returns {void}
 */
function confirmExtendAusleihe(id) {
    showConfirm('Ausleihe verlängern', 'Soll die Ausleihe um 14 Tage verlängert werden?', async function() {
        try {
            await extendAusleihe(id);
            showToast('Um 14 Tage verlängert', 'success');
            await renderAusleihen();
        } catch (err) { showToast('Verlängerung fehlgeschlagen: ' + err.message, 'error'); }
    });
}

/**
 * Zeigt Bestätigungsdialog und gibt ein Medium zurück.
 * @param {number} mediumId - ID des zurückzugebenden Mediums
 * @returns {void}
 */
function confirmReturnMedium(mediumId) {
    showConfirm('Medium zurückgeben', 'Soll das Medium zurückgegeben werden?', async function() {
        try {
            await returnMedium(mediumId);
            showToast('Medium zurückgegeben', 'success');
            await renderAusleihen();
            await renderMedien();
        } catch (err) { showToast('Rückgabe fehlgeschlagen: ' + err.message, 'error'); }
    });
}

/**
 * Zeigt Bestätigungsdialog und löscht eine Ausleihe nach Bestätigung.
 * @param {number} id - ID der zu löschenden Ausleihe
 * @returns {void}
 */
function confirmDeleteAusleihe(id) {
    showConfirm('Ausleihe löschen', 'Soll diese Ausleihe gelöscht werden?', async function() {
        try {
            await deleteAusleihe(id);
            showToast('Ausleihe gelöscht', 'success');
            await renderAusleihen();
            await renderMedien();
        } catch (err) { showToast('Löschen fehlgeschlagen: ' + err.message, 'error'); }
    });
}
