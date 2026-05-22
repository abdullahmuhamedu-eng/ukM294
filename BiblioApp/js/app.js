/**
 * app.js - Initialisierung und Event-Listener der BiblioApp
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

const SEKTIONEN = {
    medien:    { titel: 'Medien',    sub: 'GET /media' },
    kunden:    { titel: 'Kunden',    sub: 'GET /customers' },
    adressen:  { titel: 'Adressen',  sub: 'GET /addresses' },
    ausleihen: { titel: 'Ausleihen', sub: 'GET /borrowings' }
};

async function switchSektion(sektionId) {
    navigateTo(sektionId);
    const info = SEKTIONEN[sektionId];
    document.getElementById('topbar-titel').textContent      = info.titel;
    document.getElementById('topbar-untertitel').textContent = info.sub;
    if (sektionId === 'medien')    await renderMedien();
    if (sektionId === 'kunden')    await renderKunden();
    if (sektionId === 'adressen')  await renderAdressen();
    if (sektionId === 'ausleihen') await renderAusleihen();
}

async function openNeuModal() {
    const aktiv = document.querySelector('.sektion:not(.is-hidden)');
    if (!aktiv) return;
    if (aktiv.id === 'sektion-medien')    openCreateMediumModal();
    if (aktiv.id === 'sektion-kunden')    await openCreateKundeModal();
    if (aktiv.id === 'sektion-adressen')  openCreateAdresseModal();
    if (aktiv.id === 'sektion-ausleihen') await openCreateAusleiheModal();
}

document.addEventListener('DOMContentLoaded', async function() {

    document.querySelectorAll('.nav-item').forEach(function(btn) {
        btn.addEventListener('click', function() { switchSektion(this.dataset.section); });
    });

    document.getElementById('btn-neu').addEventListener('click', openNeuModal);

    document.getElementById('medium-modal-close').addEventListener('click',  function() { hideModal('medium-modal'); });
    document.getElementById('medium-modal-cancel').addEventListener('click', function() { hideModal('medium-modal'); });
    document.getElementById('medium-modal-save').addEventListener('click',   saveMedium);

    document.getElementById('kunde-modal-close').addEventListener('click',  closeKundeModal);
    document.getElementById('kunde-modal-cancel').addEventListener('click', closeKundeModal);
    document.getElementById('kunde-modal-save').addEventListener('click',   saveKunde);

    document.getElementById('adresse-modal-close').addEventListener('click',  function() { hideModal('adresse-modal'); });
    document.getElementById('adresse-modal-cancel').addEventListener('click', function() { hideModal('adresse-modal'); });
    document.getElementById('adresse-modal-save').addEventListener('click',   saveAdresse);

    document.getElementById('ausleihe-modal-close').addEventListener('click',  function() { hideModal('ausleihe-modal'); });
    document.getElementById('ausleihe-modal-cancel').addEventListener('click', function() { hideModal('ausleihe-modal'); });
    document.getElementById('ausleihe-modal-save').addEventListener('click',   saveAusleihe);

    document.getElementById('medien-suche').addEventListener('input', searchMedien);

    document.getElementById('medien-tbody').addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id   = parseInt(btn.dataset.id);
        const name = btn.dataset.name || '';
        if (btn.dataset.action === 'edit-medium')   openEditMediumModal(id);
        if (btn.dataset.action === 'delete-medium') confirmDeleteMedium(id, name);
    });

    document.getElementById('kunden-tbody').addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id   = parseInt(btn.dataset.id);
        const name = btn.dataset.name || '';
        if (btn.dataset.action === 'edit-kunde')   openEditKundeModal(id);
        if (btn.dataset.action === 'delete-kunde') confirmDeleteKunde(id, name);
    });

    document.getElementById('adressen-tbody').addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id   = parseInt(btn.dataset.id);
        const name = btn.dataset.name || '';
        if (btn.dataset.action === 'edit-adresse')   openEditAdresseModal(id);
        if (btn.dataset.action === 'delete-adresse') confirmDeleteAdresse(id, name);
    });

    document.getElementById('ausleihen-tbody').addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id       = parseInt(btn.dataset.id);
        const mediumId = parseInt(btn.dataset.mediumId);
        if (btn.dataset.action === 'extend-ausleihe') confirmExtendAusleihe(id);
        if (btn.dataset.action === 'return-medium')   confirmReturnMedium(mediumId);
        if (btn.dataset.action === 'delete-ausleihe') confirmDeleteAusleihe(id);
    });

    document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay && overlay.id !== 'confirm-modal') {
                overlay.classList.add('is-hidden');
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') hideAllModals();
    });

    await renderMedien();
});
