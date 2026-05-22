/**
 * ui.js - Toast, Modal, Navigation und UI-Hilfsfunktionen
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

function showToast(meldung, typ) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast toast--' + (typ || 'success');
    toast.textContent = meldung;
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3500);
}

function showModal(modalId) { document.getElementById(modalId).classList.remove('is-hidden'); }
function hideModal(modalId) { document.getElementById(modalId).classList.add('is-hidden'); }
function hideAllModals() { document.querySelectorAll('.modal-overlay').forEach(function(m) { m.classList.add('is-hidden'); }); }

function showConfirm(titel, text, onConfirm) {
    document.getElementById('confirm-titel').textContent = titel;
    document.getElementById('confirm-text').textContent  = text;
    showModal('confirm-modal');
    const btnJa = document.getElementById('confirm-ja');
    const btnNein = document.getElementById('confirm-nein');
    function handleJa() { hideModal('confirm-modal'); btnJa.removeEventListener('click', handleJa); btnNein.removeEventListener('click', handleNein); onConfirm(); }
    function handleNein() { hideModal('confirm-modal'); btnJa.removeEventListener('click', handleJa); btnNein.removeEventListener('click', handleNein); }
    btnJa.addEventListener('click', handleJa);
    btnNein.addEventListener('click', handleNein);
}

function navigateTo(sektionId) {
    document.querySelectorAll('.sektion').forEach(function(s) { s.classList.add('is-hidden'); });
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('is-active'); });
    const sektion = document.getElementById('sektion-' + sektionId);
    if (sektion) sektion.classList.remove('is-hidden');
    const navItem = document.querySelector('[data-section="' + sektionId + '"]');
    if (navItem) navItem.classList.add('is-active');
}

function updateNavCount(sektionId, anzahl) {
    const el = document.querySelector('[data-section="' + sektionId + '"] .nav-count');
    if (el) el.textContent = anzahl;
}

function formatDatum(datum) {
    if (!datum) return '-';
    const t = datum.split('-');
    return t[2] + '.' + t[1] + '.' + t[0];
}

function orDash(wert) { return (wert !== null && wert !== undefined && wert !== '') ? String(wert) : '-'; }
