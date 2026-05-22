/**
 * validierung.js - RegEx-Validierung und Input Sanitization
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

function validateNichtLeer(wert) { return typeof wert === 'string' && wert.trim().length > 0; }
function validateEmail(email) { return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim()); }
function validatePLZ(zip) { return /^[0-9]{4,8}$/.test(zip.trim()); }
function validateDatum(datum) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) return false;
    const d = new Date(datum);
    return d instanceof Date && !isNaN(d) && d < new Date();
}
function sanitize(eingabe) {
    if (typeof eingabe !== 'string') return eingabe;
    return eingabe.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').trim();
}
function showError(input, errorEl, meldung) { input.classList.add('is-invalid'); errorEl.textContent = meldung; errorEl.classList.remove('is-hidden'); }
function clearError(input, errorEl) { input.classList.remove('is-invalid'); errorEl.classList.add('is-hidden'); }
function validateFormular(felder) {
    let gueltig = true;
    felder.forEach(function(f) {
        clearError(f.input, f.errorEl);
        if (!f.regel(f.input.value)) { showError(f.input, f.errorEl, f.meldung); gueltig = false; }
    });
    return gueltig;
}
