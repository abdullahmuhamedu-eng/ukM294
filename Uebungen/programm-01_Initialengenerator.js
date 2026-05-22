/**
 * Programm 1 - Initialengenerator
 * Autor: Abdullah Muhamedu Hisham
 * Datum: 18.05.2026
 */

/**
 * Liest Vor- und Nachname aus den Eingabefeldern
 * und zeigt die Initialen an.
 * @param {string} vname - Der Vorname
 * @param {string} nname - Der Nachname
 * @returns {string} Die Initialen z.B. "A.M."
 */
function erstelleInitialen() {
    const vorname = document.getElementById("vorname").value;
    const nachname = document.getElementById("nachname").value;

    const initialen = vorname[0] + "." + nachname[0] + ".";

    document.getElementById("ergebnis").textContent = initialen;
}