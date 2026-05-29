/**
 * validierung.js - RegEx-Validierung und Input Sanitization
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

/**
 * Prüft ob ein Textwert mindestens 2 Buchstaben enthält (keine reinen Zahlen).
 * @param {string} wert - Der zu prüfende Text
 * @returns {boolean} true wenn gültig, false wenn leer oder nur Zahlen
 */
function validateNichtLeer(wert) {
    return typeof wert === 'string' && wert.trim().length > 0;
}

/**
 * Prüft ob ein Name nur Buchstaben, Leerzeichen und Bindestriche enthält.
 * Verhindert reine Zahlen als Namen (RegEx).
 * @param {string} wert - Der zu prüfende Name
 * @returns {boolean} true wenn gültig
 */
function validateName(wert) {
    if (typeof wert !== 'string' || wert.trim().length === 0) return false;
    const t = wert.trim();
    return /^[A-Za-zÀ-ÿäöüÄÖÜ\s\-\.,']+$/.test(t) && /[A-Za-zÀ-ÿäöüÄÖÜ]/.test(t);
}

/**
 * Prüft ob ein Titel Buchstaben oder Ziffern enthält (Sonderzeichen erlaubt).
 * @param {string} wert - Der zu prüfende Titel
 * @returns {boolean} true wenn gültig
 */
function validateTitel(wert) {
    if (typeof wert !== 'string' || wert.trim().length === 0) return false;
    const t = wert.trim();
    return /^[A-Za-z0-9À-ÿäöüÄÖÜ\s\-\.,']+$/.test(t) && /[A-Za-z0-9À-ÿäöüÄÖÜ]/.test(t);
}

/**
 * Prüft ob ein Wert eine positive Ganzzahl oder leer ist.
 * @param {string} wert - Der zu prüfende Wert
 * @returns {boolean} true wenn leer oder nur Ziffern
 */
function validateGanzzahl(wert) {
    if (wert.trim() === '') return true;
    return /^\d+$/.test(wert.trim());
}

/**
 * Prüft ob eine E-Mail-Adresse gültig ist (RegEx).
 * @param {string} email - Die zu prüfende E-Mail-Adresse
 * @returns {boolean} true wenn gültig
 */
function validateEmail(email) {
    return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(String(email).trim());
}

/**
 * Prüft ob eine PLZ aus 4 bis 8 Ziffern besteht (RegEx).
 * @param {string} zip - Die zu prüfende Postleitzahl
 * @returns {boolean} true wenn gültig
 */
function validatePLZ(zip) {
    return /^[0-9]{4,8}$/.test(String(zip).trim());
}

/**
 * Prüft ob ein Datum im Format YYYY-MM-DD gültig und in der Vergangenheit liegt.
 * @param {string} datum - Das zu prüfende Datum
 * @returns {boolean} true wenn gültig
 */
function validateDatum(datum) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) return false;
    const d = new Date(datum);
    return d instanceof Date && !isNaN(d) && d < new Date();
}

/**
 * Bereinigt eine Texteingabe gegen XSS (Input Sanitization).
 * Entfernt HTML-Sonderzeichen aus dem Eingabewert.
 * @param {string} eingabe - Der zu bereinigende Text
 * @returns {string} Bereinigter Text
 */
function sanitize(eingabe) {
    if (typeof eingabe !== 'string') return String(eingabe);
    return eingabe
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#x27;')
        .trim();
}

/**
 * Zeigt einen Validierungsfehler bei einem Formularfeld an.
 * @param {HTMLElement} input   - Das Eingabefeld
 * @param {HTMLElement} errorEl - Das Fehlermeldungs-Element
 * @param {string}      meldung - Die anzuzeigende Fehlermeldung
 * @returns {void}
 */
function showError(input, errorEl, meldung) {
    input.classList.add('is-invalid');
    errorEl.textContent = meldung;
    errorEl.classList.remove('is-hidden');
}

/**
 * Entfernt den Validierungsfehler eines Formularfelds.
 * @param {HTMLElement} input   - Das Eingabefeld
 * @param {HTMLElement} errorEl - Das Fehlermeldungs-Element
 * @returns {void}
 */
function clearError(input, errorEl) {
    input.classList.remove('is-invalid');
    errorEl.classList.add('is-hidden');
}

/**
 * Validiert mehrere Formularfelder anhand ihrer Regeln.
 * @param {Array} felder - Array von Feldobjekten mit input, errorEl, regel, meldung
 * @returns {boolean} true wenn alle Felder gültig sind
 */
function validateFormular(felder) {
    let gueltig = true;
    felder.forEach(function(f) {
        clearError(f.input, f.errorEl);
        if (!f.regel(f.input.value)) {
            showError(f.input, f.errorEl, f.meldung);
            gueltig = false;
        }
    });
    return gueltig;
}
