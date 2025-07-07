// classifica.js
async function caricaClassifica(url, containerId) {
    const container = document.getElementById(containerId);
    try {
        const response = await fetch(url);
        const data = await response.json();

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Pos</th><th>Squadra</th><th>P</th><th>G</th><th>GV</th><th>GP</th><th>SV</th><th>SP</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach(team => {
            html += `
                <tr>
                    <td>${team.pos}</td>
                    <td>${team.squadra}</td>
                    <td>${team.pt}</td>
                    <td>${team.g}</td>
                    <td>${team.gv}</td>
                    <td>${team.gp}</td>
                    <td>${team.sv}</td>
                    <td>${team.sp}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        console.error("Errore nel caricamento:", error);
        container.innerHTML = "<p>Classifica non disponibile al momento.</p>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    caricaClassifica("classifica_maschile.json", "classifica-maschile");
    caricaClassifica("classifica_femminile.json", "classifica-femminile");
});
