/**
 * Programm 2 - Passwort-Generator
 * Autor: Abdullah Muhamedu Hisham
 * Datum: 18.05.2026
 */

/**
 * Generiert ein zufälliges Passwort.
 * @param {number} laenge - Die gewünschte Passwortlänge
 * @returns {string} Das generierte Passwort
 */
function generierePasswort() {
    const laenge = document.getElementById("laenge").value;
    const zeichen = "ABCXYZabcdSTQRwxyz0123HIJKLPQRwxyz0123MNnopqrstuvefUVWlmDEFGPghijkO456789!@#$%";
    let passwort = "";

    for (let i = 0; i < laenge; i++) {
        const index = Math.floor(Math.random() * zeichen.length);
        passwort += zeichen[index];
    }

    document.getElementById("ergebnis").textContent = passwort;
}