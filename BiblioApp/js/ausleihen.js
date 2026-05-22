/**
 * ausleihen.js - CRUD-Logik fuer die Ressource Ausleihe
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

let ausleihenListe = [];

async function renderAusleihen() {
    const tbody = document.getElementById('ausleihen-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Lade...</td></tr>';
    try {
        ausleihenListe = await getAusleihen();
        renderAusleihenTabelle(ausleihenListe);
        updateNavCount('ausleihen', ausleihenListe.length);
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Fehler: ' + err.message + '</td></tr>';
        showToast('Ausleihen konnten nicht geladen werden', 'error');
    }
}

function renderAusleihenTabelle(liste) {
    const tbody = document.getElementById('ausleihen-tbody');
    if (!liste || liste.length === 0) { tbody.innerHTML = '<tr><td colspan="5" class="loading">Keine Ausleihen vorhanden</td></tr>'; return; }
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
            + '<button class="btn btn--sm btn--secondary" data-action="return-medium" data-medium-id="' + mediumId + '">Rueckgabe</button> '
            + '<button class="btn btn--sm btn--danger" data-action="delete-ausleihe" data-id="' + a.id + '">Loeschen</button>'
            + '</td></tr>';
    }).join('');
}

async function fillAusleiheDropdowns() {
    const kundeSelect  = document.getElementById('ausleihe-kunde');
    const mediumSelect = document.getElementById('ausleihe-medium');
    kundeSelect.innerHTML  = '<option value="">-- Kunden waehlen --</option>';
    mediumSelect.innerHTML = '<option value="">-- Medium waehlen --</option>';
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

async function openCreateAusleiheModal() {
    document.getElementById('ausleihe-form').reset();
    document.querySelectorAll('#ausleihe-modal .form-error').forEach(function(e) { e.classList.add('is-hidden'); });
    await fillAusleiheDropdowns();
    showModal('ausleihe-modal');
}

async function saveAusleihe() {
    const kundeSelect  = document.getElementById('ausleihe-kunde');
    const mediumSelect = document.getElementById('ausleihe-medium');
    const gueltig = validateFormular([
        { input: kundeSelect,  errorEl: document.getElementById('ausleihe-kunde-error'),  regel: validateNichtLeer, meldung: 'Bitte einen Kunden waehlen' },
        { input: mediumSelect, errorEl: document.getElementById('ausleihe-medium-error'), regel: validateNichtLeer, meldung: 'Bitte ein Medium waehlen' }
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

function confirmExtendAusleihe(id) {
    showConfirm('Ausleihe verlaengern', 'Soll die Ausleihe um 14 Tage verlaengert werden?', async function() {
        try { await extendAusleihe(id); showToast('Um 14 Tage verlaengert', 'success'); await renderAusleihen(); }
        catch (err) { showToast('Verlaengerung fehlgeschlagen: ' + err.message, 'error'); }
    });
}

function confirmReturnMedium(mediumId) {
    showConfirm('Medium zurueckgeben', 'Soll das Medium zurueckgegeben werden?', async function() {
        try { await returnMedium(mediumId); showToast('Medium zurueckgegeben', 'success'); await renderAusleihen(); await renderMedien(); }
        catch (err) { showToast('Rueckgabe fehlgeschlagen: ' + err.message, 'error'); }
    });
}

function confirmDeleteAusleihe(id) {
    showConfirm('Ausleihe loeschen', 'Soll diese Ausleihe geloescht werden?', async function() {
        try { await deleteAusleihe(id); showToast('Ausleihe geloescht', 'success'); await renderAusleihen(); await renderMedien(); }
        catch (err) { showToast('Loeschen fehlgeschlagen: ' + err.message, 'error'); }
    });
}
