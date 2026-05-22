/**
 * api.js - API-Anfragen an das Spring Boot Backend (Port 8080)
 * @author  Abdullah Muhamedu Hisham
 * @date    21.05.2026
 * @version 1.0
 */

const API_BASE = 'http://localhost:8080';

/**
 * Sendet einen HTTP-Request an das Backend.
 * @param {string} endpoint - API-Pfad z.B. '/media'
 * @param {string} method - HTTP-Methode: GET, POST, PUT, DELETE
 * @param {Object|null} body - Request-Body fuer POST/PUT
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

async function getMedien() { return await sendRequest('/media'); }
async function searchMedienByTitel(titel) { return await sendRequest('/media/search/title/' + encodeURIComponent(titel)); }
async function createMedium(titel, autor, genre, standort) {
    const body = { title: titel, author: autor };
    if (genre)    body.genre        = genre;
    if (standort) body.locationcode = standort;
    return await sendRequest('/media', 'POST', body);
}
async function updateMedium(id, data) { return await sendRequest('/media/' + id, 'PUT', data); }
async function deleteMedium(id) { return await sendRequest('/media/' + id, 'DELETE'); }

async function getKunden() { return await sendRequest('/customers'); }
async function createKunde(firstName, lastName, birthDate, email, addressId) {
    return await sendRequest('/customers', 'POST', { firstName, lastName, birthDate, email, address: { id: addressId } });
}
async function updateKunde(id, email, addressId) {
    return await sendRequest('/customers/' + id, 'PUT', { email, address: { id: addressId } });
}
async function deleteKunde(id) { return await sendRequest('/customers/' + id, 'DELETE'); }

async function getAdressen() { return await sendRequest('/addresses'); }
async function createAdresse(street, city, zip) { return await sendRequest('/addresses', 'POST', { street, city, zip }); }
async function updateAdresse(id, street, city, zip) { return await sendRequest('/addresses/' + id, 'PUT', { street, city, zip }); }
async function deleteAdresse(id) { return await sendRequest('/addresses/' + id, 'DELETE'); }

async function getAusleihen() { return await sendRequest('/borrowings'); }
async function createAusleihe(kundeId, mediumId) {
    return await sendRequest('/borrowings', 'POST', { customer: { id: kundeId }, media: { id: mediumId } });
}
async function extendAusleihe(id) { return await sendRequest('/borrowings/' + id + '/extend', 'PUT'); }
async function deleteAusleihe(id) { return await sendRequest('/borrowings/' + id, 'DELETE'); }
async function returnMedium(mediumId) { return await sendRequest('/borrowings/media/' + mediumId, 'DELETE'); }
