/**
 * api.js - Kapselt alle HTTP-Anfragen an das Spring Boot Backend (Port 8080).
 * Alle CRUD-Operationen für Medien, Kunden, Adressen und Ausleihen laufen über sendRequest().
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

const API_BASE = 'http://localhost:8080';

/**
 * Sendet einen HTTP-Request an das Backend.
 * @async
 * @param {string}      endpoint - API-Pfad z.B. '/media'
 * @param {string}      method   - HTTP-Methode: GET, POST, PUT, DELETE
 * @param {Object|null} body     - Request-Body für POST/PUT
 * @returns {Promise<Object|null>} JSON-Antwort oder null
 */
async function sendRequest(endpoint, method = 'GET', body = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(API_BASE + endpoint, options);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error('HTTP ' + response.status + ': ' + errorText);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

/**
 * Lädt alle Medien vom Backend.
 * @async
 * @returns {Promise<Array>} Liste aller Medien-Objekte
 */
async function getMedien() { return await sendRequest('/media'); }

/**
 * Sucht Medien nach Titel über das Backend.
 * @async
 * @param {string} titel - Suchbegriff für den Titel
 * @returns {Promise<Array>} Gefilterte Liste von Medien-Objekten
 */
async function searchMedienByTitel(titel) { return await sendRequest('/media/search/title/' + encodeURIComponent(titel)); }

/**
 * Erstellt ein neues Medium im Backend.
 * @async
 * @param {string} titel    - Titel des Mediums
 * @param {string} autor    - Autor des Mediums
 * @param {string} genre    - Genre des Mediums
 * @param {string} standort - Standortcode des Mediums
 * @returns {Promise<Object>} Das erstellte Medium-Objekt
 */
async function createMedium(titel, autor, genre, standort) {
    const body = { title: titel, author: autor };
    if (genre)    body.genre        = genre;
    if (standort) body.locationcode = standort;
    return await sendRequest('/media', 'POST', body);
}

/**
 * Aktualisiert ein bestehendes Medium im Backend.
 * @async
 * @param {number} id   - ID des zu aktualisierenden Mediums
 * @param {Object} data - Aktualisierte Felder des Mediums
 * @returns {Promise<Object>} Das aktualisierte Medium-Objekt
 */
async function updateMedium(id, data) { return await sendRequest('/media/' + id, 'PUT', data); }

/**
 * Löscht ein Medium im Backend.
 * @async
 * @param {number} id - ID des zu löschenden Mediums
 * @returns {Promise<null>} null bei Erfolg
 */
async function deleteMedium(id) { return await sendRequest('/media/' + id, 'DELETE'); }

/**
 * Lädt alle Kunden vom Backend.
 * @async
 * @returns {Promise<Array>} Liste aller Kunden-Objekte
 */
async function getKunden() { return await sendRequest('/customers'); }

/**
 * Erstellt einen neuen Kunden im Backend.
 * @async
 * @param {string} firstName - Vorname des Kunden
 * @param {string} lastName  - Nachname des Kunden
 * @param {string} birthDate - Geburtsdatum im Format YYYY-MM-DD
 * @param {string} email     - E-Mail-Adresse des Kunden
 * @param {number} addressId - ID der zugehörigen Adresse
 * @returns {Promise<Object>} Das erstellte Kunden-Objekt
 */
async function createKunde(firstName, lastName, birthDate, email, addressId) {
    return await sendRequest('/customers', 'POST', { firstName, lastName, birthDate, email, address: { id: addressId } });
}

/**
 * Aktualisiert E-Mail und Adresse eines bestehenden Kunden.
 * @async
 * @param {number} id        - ID des zu aktualisierenden Kunden
 * @param {string} email     - Neue E-Mail-Adresse
 * @param {number} addressId - ID der neuen Adresse
 * @returns {Promise<Object>} Das aktualisierte Kunden-Objekt
 */
async function updateKunde(id, email, addressId) {
    return await sendRequest('/customers/' + id, 'PUT', { email, address: { id: addressId } });
}

/**
 * Löscht einen Kunden im Backend.
 * @async
 * @param {number} id - ID des zu löschenden Kunden
 * @returns {Promise<null>} null bei Erfolg
 */
async function deleteKunde(id) { return await sendRequest('/customers/' + id, 'DELETE'); }

/**
 * Lädt alle Adressen vom Backend.
 * @async
 * @returns {Promise<Array>} Liste aller Adress-Objekte
 */
async function getAdressen() { return await sendRequest('/addresses'); }

/**
 * Erstellt eine neue Adresse im Backend.
 * @async
 * @param {string} street - Strassenname inkl. Hausnummer
 * @param {string} city   - Ortsname
 * @param {string} zip    - Postleitzahl
 * @returns {Promise<Object>} Das erstellte Adress-Objekt
 */
async function createAdresse(street, city, zip) { return await sendRequest('/addresses', 'POST', { street, city, zip }); }

/**
 * Aktualisiert eine bestehende Adresse im Backend.
 * @async
 * @param {number} id     - ID der zu aktualisierenden Adresse
 * @param {string} street - Neuer Strassenname inkl. Hausnummer
 * @param {string} city   - Neuer Ortsname
 * @param {string} zip    - Neue Postleitzahl
 * @returns {Promise<Object>} Das aktualisierte Adress-Objekt
 */
async function updateAdresse(id, street, city, zip) { return await sendRequest('/addresses/' + id, 'PUT', { street, city, zip }); }

/**
 * Löscht eine Adresse im Backend.
 * @async
 * @param {number} id - ID der zu löschenden Adresse
 * @returns {Promise<null>} null bei Erfolg
 */
async function deleteAdresse(id) { return await sendRequest('/addresses/' + id, 'DELETE'); }

/**
 * Lädt alle aktiven Ausleihen vom Backend.
 * @async
 * @returns {Promise<Array>} Liste aller Ausleihen-Objekte
 */
async function getAusleihen() { return await sendRequest('/borrowings'); }

/**
 * Erstellt eine neue Ausleihe im Backend.
 * @async
 * @param {number} kundeId  - ID des ausleihenden Kunden
 * @param {number} mediumId - ID des auszuleihenden Mediums
 * @returns {Promise<Object>} Das erstellte Ausleihen-Objekt
 */
async function createAusleihe(kundeId, mediumId) {
    return await sendRequest('/borrowings', 'POST', { customer: { id: kundeId }, media: { id: mediumId } });
}

/**
 * Verlängert eine Ausleihe um 14 Tage.
 * @async
 * @param {number} id - ID der zu verlängernden Ausleihe
 * @returns {Promise<Object>} Das aktualisierte Ausleihen-Objekt
 */
async function extendAusleihe(id) { return await sendRequest('/borrowings/' + id + '/extend', 'PUT'); }

/**
 * Löscht eine Ausleihe im Backend.
 * @async
 * @param {number} id - ID der zu löschenden Ausleihe
 * @returns {Promise<null>} null bei Erfolg
 */
async function deleteAusleihe(id) { return await sendRequest('/borrowings/' + id, 'DELETE'); }

/**
 * Gibt ein Medium zurück (löscht die zugehörige Ausleihe).
 * @async
 * @param {number} mediumId - ID des zurückzugebenden Mediums
 * @returns {Promise<null>} null bei Erfolg
 */
async function returnMedium(mediumId) { return await sendRequest('/borrowings/media/' + mediumId, 'DELETE'); }
