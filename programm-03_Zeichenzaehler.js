/**
 * Programm 3 - Zeichenzähler
 * Autor: Abdullah Muhamedu Hisham
 * Datum: 18.05.2026
 */

/**
 * Zählt die Zeichen im Textfeld und zeigt das Ergebnis an.
 * @returns {void}
 */
function zaehleZeichen() {
    const text = document.getElementById("text").value;
    const anzahl = text.length;
    document.getElementById("ergebnis").textContent = "Anzahl Zeichen: " + anzahl;
}
