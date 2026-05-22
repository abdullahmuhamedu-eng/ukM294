/**
 * app.js - Initialisierung und Event-Listener der BiblioApp
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

const SEKTIONEN = {
    medien:    { titel: 'Medien' },
    kunden:    { titel: 'Kunden' },
    adressen:  { titel: 'Adressen' },
    ausleihen: { titel: 'Ausleihen' }
};

/**
 * Wechselt zur angegebenen Sektion und laedt die Daten.
 * @async
 * @param {string} sektionId - ID der Sektion
 * @returns {Promise<void>}
 */
async function switchSektion(sektionId) {
    navigateTo(sektionId);
    document.getElementById('topbar-titel').textContent = SEKTIONEN[sektionId].titel;
    if (sektionId === 'medien')    await renderMedien();
    if (sektionId === 'kunden')    await renderKunden();
    if (sektionId === 'adressen')  await renderAdressen();
    if (sektionId === 'ausleihen') await renderAusleihen();
}

/**
 * Oeffnet das passende Erstellen-Modal fuer die aktive Sektion.
 * @async
 * @returns {Promise<void>}
 */
async function openNeuModal() {
    const aktiv = document.querySelector('.sektion:not(.is-hidden)');
    if (!aktiv) return;
    if (aktiv.id === 'sektion-medien')    openCreateMediumModal();
    if (aktiv.id === 'sektion-kunden')    await openCreateKundeModal();
    if (aktiv.id === 'sektion-adressen')  openCreateAdresseModal();
    if (aktiv.id === 'sektion-ausleihen') await openCreateAusleiheModal();
}

document.addEventListener('DOMContentLoaded', async function() {

    // Navigation
    document.querySelectorAll('.nav-item').forEach(function(btn) {
        btn.addEventListener('click', function() { switchSektion(this.dataset.section); });
    });

    document.getElementById('btn-neu').addEventListener('click', openNeuModal);

    // Suche
    document.getElementById('medien-suche').addEventListener('input', searchMedien);
    document.getElementById('medien-suche-btn').addEventListener('click', searchMedien);
    document.getElementById('kunden-suche').addEventListener('input', searchKunden);
    document.getElementById('kunden-suche-btn').addEventListener('click', searchKunden);

    // Modal Medium
    document.getElementById('medium-modal-close').addEventListener('click',  function() { hideModal('medium-modal'); });
    document.getElementById('medium-modal-cancel').addEventListener('click', function() { hideModal('medium-modal'); });
    document.getElementById('medium-modal-save').addEventListener('click',   saveMedium);

    // Modal Kunde
    document.getElementById('kunde-modal-close').addEventListener('click',  closeKundeModal);
    document.getElementById('kunde-modal-cancel').addEventListener('click', closeKundeModal);
    document.getElementById('kunde-modal-save').addEventListener('click',   saveKunde);

    // Modal Adresse
    document.getElementById('adresse-modal-close').addEventListener('click',  function() { hideModal('adresse-modal'); });
    document.getElementById('adresse-modal-cancel').addEventListener('click', function() { hideModal('adresse-modal'); });
    document.getElementById('adresse-modal-save').addEventListener('click',   saveAdresse);

    // Modal Ausleihe
    document.getElementById('ausleihe-modal-close').addEventListener('click',  function() { hideModal('ausleihe-modal'); });
    document.getElementById('ausleihe-modal-cancel').addEventListener('click', function() { hideModal('ausleihe-modal'); });
    document.getElementById('ausleihe-modal-save').addEventListener('click',   saveAusleihe);

    // Event-Delegation Medien
    document.getElementById('medien-tbody').addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id   = parseInt(btn.dataset.id);
        const name = btn.dataset.name || '';
        if (btn.dataset.action === 'edit-medium')   openEditMediumModal(id);
        if (btn.dataset.action === 'delete-medium') confirmDeleteMedium(id, name);
    });

    // Event-Delegation Kunden
    document.getElementById('kunden-tbody').addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id   = parseInt(btn.dataset.id);
        const name = btn.dataset.name || '';
        if (btn.dataset.action === 'edit-kunde')   openEditKundeModal(id);
        if (btn.dataset.action === 'delete-kunde') confirmDeleteKunde(id, name);
    });

    // Event-Delegation Adressen
    document.getElementById('adressen-tbody').addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id   = parseInt(btn.dataset.id);
        const name = btn.dataset.name || '';
        if (btn.dataset.action === 'edit-adresse')   openEditAdresseModal(id);
        if (btn.dataset.action === 'delete-adresse') confirmDeleteAdresse(id, name);
    });

    // Event-Delegation Ausleihen
    document.getElementById('ausleihen-tbody').addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id       = parseInt(btn.dataset.id);
        const mediumId = parseInt(btn.dataset.mediumId);
        if (btn.dataset.action === 'extend-ausleihe') confirmExtendAusleihe(id);
        if (btn.dataset.action === 'return-medium')   confirmReturnMedium(mediumId);
        if (btn.dataset.action === 'delete-ausleihe') confirmDeleteAusleihe(id);
    });

    // Klick ausserhalb Modal schliesst es
    document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay && overlay.id !== 'confirm-modal') {
                overlay.classList.add('is-hidden');
            }
        });
    });

    // Escape schliesst alle Modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') hideAllModals();
    });

    // Startseite laden + alle Stats laden
    await renderMedien();
    await renderKunden();
    await renderAusleihen();
    navigateTo('medien');
    document.getElementById('topbar-titel').textContent = 'Medien';
    document.querySelector('[data-section="medien"]').classList.add('is-active');
});

