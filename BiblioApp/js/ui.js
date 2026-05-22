/**
 * ui.js - Toast, Modal, Navigation und UI-Hilfsfunktionen
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

/**
 * Zeigt eine Toast-Benachrichtigung für 3.5 Sekunden an.
 * @param {string} meldung - Anzuzeigende Nachricht
 * @param {string} typ     - Toast-Typ: success, error, warning
 * @returns {void}
 */
function showToast(meldung, typ) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast toast--' + (typ || 'success');
    toast.textContent = meldung;
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3500);
}

/**
 * Öffnet ein Modal anhand seiner ID.
 * @param {string} modalId - ID des Modals
 * @returns {void}
 */
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('is-hidden');
}

/**
 * Schliesst ein Modal anhand seiner ID.
 * @param {string} modalId - ID des Modals
 * @returns {void}
 */
function hideModal(modalId) {
    document.getElementById(modalId).classList.add('is-hidden');
}

/**
 * Schliesst alle offenen Modals.
 * @returns {void}
 */
function hideAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(function(m) {
        m.classList.add('is-hidden');
    });
}

/**
 * Zeigt einen Bestätigungsdialog an.
 * @param {string}   titel     - Titel des Dialogs
 * @param {string}   text      - Beschreibungstext
 * @param {Function} onConfirm - Funktion die bei Bestätigung aufgerufen wird
 * @returns {void}
 */
function showConfirm(titel, text, onConfirm) {
    document.getElementById('confirm-titel').textContent = titel;
    document.getElementById('confirm-text').textContent  = text;
    showModal('confirm-modal');
    const btnJa   = document.getElementById('confirm-ja');
    const btnNein = document.getElementById('confirm-nein');
    function handleJa()   { hideModal('confirm-modal'); btnJa.removeEventListener('click', handleJa); btnNein.removeEventListener('click', handleNein); onConfirm(); }
    function handleNein() { hideModal('confirm-modal'); btnJa.removeEventListener('click', handleJa); btnNein.removeEventListener('click', handleNein); }
    btnJa.addEventListener('click', handleJa);
    btnNein.addEventListener('click', handleNein);
}

/**
 * Wechselt die sichtbare Sektion in der App.
 * @param {string} sektionId - ID der anzuzeigenden Sektion
 * @returns {void}
 */
function navigateTo(sektionId) {
    document.querySelectorAll('.sektion').forEach(function(s) { s.classList.add('is-hidden'); });
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('is-active'); });
    const sektion = document.getElementById('sektion-' + sektionId);
    if (sektion) sektion.classList.remove('is-hidden');
    const navItem = document.querySelector('[data-section="' + sektionId + '"]');
    if (navItem) navItem.classList.add('is-active');
}

/**
 * Aktualisiert den Zähler eines Navigations-Eintrags.
 * @param {string} sektionId - ID der Sektion
 * @param {number} anzahl    - Anzahl der Einträge
 * @returns {void}
 */
function updateNavCount(sektionId, anzahl) {
    const el = document.querySelector('[data-section="' + sektionId + '"] .nav-count');
    if (el) el.textContent = anzahl;
}

/**
 * Formatiert ein ISO-Datum (YYYY-MM-DD) in deutsches Format (DD.MM.YYYY).
 * @param {string} datum - ISO-Datum
 * @returns {string} Formatiertes Datum oder '-' wenn leer
 */
function formatDatum(datum) {
    if (!datum) return '-';
    const t = datum.split('-');
    return t[2] + '.' + t[1] + '.' + t[0];
}

/**
 * Gibt den Wert zurück oder '-' wenn leer oder null.
 * @param {*} wert - Der zu prüfende Wert
 * @returns {string} Wert als String oder '-'
 */
function escHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function orDash(wert) {
    return (wert !== null && wert !== undefined && wert !== '') ? escHtml(String(wert)) : '-';
}
/**
 * Escaped einen String gegen XSS fuer sichere innerHTML-Ausgabe.
 * @param {string} str - Der zu escapende String
 * @returns {string} Escapeter String
 */
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
